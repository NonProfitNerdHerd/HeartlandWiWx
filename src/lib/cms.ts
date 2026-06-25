import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
	deleteGitHubFile,
	getGitHubFile,
	isGitHubConfigured,
	listGitHubDirectory,
	putGitHubFile,
} from './github';
import { isSafeContentPath, isValidSlug, slugToFilename } from './slug';

export interface ContentListItem {
	title: string;
	slug: string;
	updatedAt: string;
	published: boolean;
}

export interface ContentRecord {
	title: string;
	slug: string;
	seoTitle: string;
	description: string;
	body: string;
	published: boolean;
	updatedAt: string;
	menuLabel?: string;
	showInMenu?: boolean;
	menuOrder?: number;
	sha?: string;
	[key: string]: unknown;
}

interface ContentTypeConfig {
	contentDir: string;
	label: string;
	extraFrontmatter?: (record: ContentRecord) => Record<string, unknown>;
	parseExtra?: (data: Record<string, unknown>, record: ContentRecord) => void;
}

function todayIsoDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function localDir(contentDir: string): string {
	return path.join(process.cwd(), contentDir);
}

function filePath(contentDir: string, slug: string): string {
	return `${contentDir}/${slugToFilename(slug)}`;
}

function assertSafePath(relativePath: string, contentDir: string): void {
	if (!isSafeContentPath(relativePath, contentDir)) {
		throw new Error('Unsafe content path');
	}
}

function parseMarkdown(raw: string, sha?: string): ContentRecord {
	const { data, content } = matter(raw);
	const frontmatter = data as Record<string, unknown>;
	const slug = String(frontmatter.slug ?? '');

	return {
		title: String(frontmatter.title ?? ''),
		slug,
		seoTitle: String(frontmatter.seoTitle ?? frontmatter.title ?? ''),
		description: String(frontmatter.description ?? frontmatter.seoDescription ?? ''),
		body: content.trim(),
		published: frontmatter.published !== false && frontmatter.status !== 'draft',
		updatedAt: String(frontmatter.updatedAt ?? frontmatter.date ?? todayIsoDate()).slice(0, 10),
		menuLabel: frontmatter.menuLabel ? String(frontmatter.menuLabel) : undefined,
		showInMenu: frontmatter.showInMenu === true,
		menuOrder: frontmatter.menuOrder !== undefined ? Number(frontmatter.menuOrder) : undefined,
		sha,
		...frontmatter,
	};
}

function serializeMarkdown(record: ContentRecord, config: ContentTypeConfig): string {
	const frontmatter: Record<string, unknown> = {
		title: record.title,
		slug: record.slug,
		seoTitle: record.seoTitle,
		description: record.description,
		published: record.published,
		updatedAt: record.updatedAt,
	};

	if (record.menuLabel) frontmatter.menuLabel = record.menuLabel;
	if (record.showInMenu !== undefined) frontmatter.showInMenu = record.showInMenu;
	if (record.menuOrder !== undefined) frontmatter.menuOrder = record.menuOrder;

	if (config.extraFrontmatter) {
		Object.assign(frontmatter, config.extraFrontmatter(record));
	}

	return matter.stringify(`\n${record.body}\n`, frontmatter);
}

function listLocalMarkdown(contentDir: string): Array<{ slug: string; raw: string }> {
	const directory = localDir(contentDir);
	if (!fs.existsSync(directory)) {
		return [];
	}

	return fs
		.readdirSync(directory)
		.filter((file) => file.endsWith('.md'))
		.map((file) => {
			const slug = file.replace(/\.md$/, '');
			const raw = fs.readFileSync(path.join(directory, file), 'utf-8');
			return { slug, raw };
		});
}

async function readRemoteMarkdown(contentDir: string, slug: string): Promise<{ raw: string; sha?: string } | null> {
	const relativePath = filePath(contentDir, slug);
	assertSafePath(relativePath, contentDir);
	const githubFile = await getGitHubFile(relativePath);
	if (!githubFile) return null;
	return { raw: githubFile.content, sha: githubFile.sha };
}

async function readLocalMarkdown(contentDir: string, slug: string): Promise<string | null> {
	const localPath = path.join(localDir(contentDir), slugToFilename(slug));
	if (!fs.existsSync(localPath)) return null;
	return fs.readFileSync(localPath, 'utf-8');
}

async function getRawContent(contentDir: string, slug: string): Promise<{ raw: string; sha?: string } | null> {
	if (isGitHubConfigured()) {
		const remote = await readRemoteMarkdown(contentDir, slug);
		if (remote) return remote;
	}

	const local = await readLocalMarkdown(contentDir, slug);
	if (!local) return null;
	return { raw: local };
}

export function createContentService(config: ContentTypeConfig) {
	return {
		async listItems(): Promise<ContentListItem[]> {
			const localItems = listLocalMarkdown(config.contentDir).map(({ raw }) => {
				const record = parseMarkdown(raw);
				return {
					title: record.title,
					slug: record.slug,
					updatedAt: record.updatedAt,
					published: record.published,
				};
			});

			if (!isGitHubConfigured()) {
				return localItems.sort((a, b) => a.title.localeCompare(b.title));
			}

			try {
				const remoteFiles = await listGitHubDirectory(config.contentDir);
				const remoteItems = await Promise.all(
					remoteFiles.map(async (file) => {
						const githubFile = await getGitHubFile(file.path);
						if (!githubFile) return null;
						const record = parseMarkdown(githubFile.content, githubFile.sha);
						return {
							title: record.title,
							slug: record.slug,
							updatedAt: record.updatedAt,
							published: record.published,
						};
					}),
				);

				const merged = new Map<string, ContentListItem>();
				for (const item of localItems) {
					if (item.slug) merged.set(item.slug, item);
				}
				for (const item of remoteItems) {
					if (item?.slug) merged.set(item.slug, item);
				}

				return [...merged.values()].sort((a, b) => a.title.localeCompare(b.title));
			} catch {
				return localItems.sort((a, b) => a.title.localeCompare(b.title));
			}
		},

		async getItem(slug: string): Promise<ContentRecord | null> {
			if (!isValidSlug(slug)) return null;
			const content = await getRawContent(config.contentDir, slug);
			if (!content) return null;
			const record = parseMarkdown(content.raw, content.sha);
			if (config.parseExtra) {
				config.parseExtra(record, record);
			}
			return record;
		},

		async itemExists(slug: string): Promise<boolean> {
			const item = await this.getItem(slug);
			return item !== null;
		},

		async saveItem(record: ContentRecord, originalSlug?: string): Promise<void> {
			if (!isValidSlug(record.slug)) {
				throw new Error('Invalid slug');
			}
			if (!record.title.trim()) {
				throw new Error('Title is required');
			}

			record.updatedAt = todayIsoDate();
			const content = serializeMarkdown(record, config);
			const commitMessage =
				originalSlug && originalSlug !== record.slug
					? `Update ${config.label}: ${originalSlug} → ${record.slug}`
					: `Update ${config.label}: ${record.slug}`;

			if (isGitHubConfigured()) {
				if (originalSlug && originalSlug !== record.slug) {
					const oldRelativePath = filePath(config.contentDir, originalSlug);
					assertSafePath(oldRelativePath, config.contentDir);
					const oldFile = await getGitHubFile(oldRelativePath);
					if (oldFile) {
						await deleteGitHubFile(oldRelativePath, oldFile.sha, `Remove old ${config.label} file: ${originalSlug}`);
					}
				}

				const targetPath = filePath(config.contentDir, record.slug);
				assertSafePath(targetPath, config.contentDir);
				const existing = await getGitHubFile(targetPath);
				await putGitHubFile(targetPath, content, commitMessage, existing?.sha);
				return;
			}

			const directory = localDir(config.contentDir);
			fs.mkdirSync(directory, { recursive: true });

			if (originalSlug && originalSlug !== record.slug) {
				const oldLocalPath = path.join(directory, slugToFilename(originalSlug));
				if (fs.existsSync(oldLocalPath)) {
					fs.unlinkSync(oldLocalPath);
				}
			}

			fs.writeFileSync(path.join(directory, slugToFilename(record.slug)), content, 'utf-8');
		},
	};
}
