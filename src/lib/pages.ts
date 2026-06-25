import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { PAGES_CONTENT_DIR, type PageFrontmatter } from './content';
import {
	deleteGitHubFile,
	getGitHubFile,
	isGitHubConfigured,
	listGitHubPageFiles,
	putGitHubFile,
} from './github';
import { isValidSlug, slugToFilename } from './slug';

export interface PageRecord {
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
}

export interface PageListItem {
	title: string;
	slug: string;
	updatedAt: string;
	published: boolean;
}

const pagesDir = path.join(process.cwd(), 'src/content/pages');

function todayIsoDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function parsePage(raw: string, sha?: string): PageRecord {
	const { data, content } = matter(raw);
	const frontmatter = data as PageFrontmatter;
	const slug = frontmatter.slug || '';

	return {
		title: frontmatter.title || '',
		slug,
		seoTitle: frontmatter.seoTitle || frontmatter.title || '',
		description: frontmatter.description || frontmatter.seoDescription || '',
		body: content.trim(),
		published: frontmatter.published !== false,
		updatedAt: frontmatter.updatedAt || todayIsoDate(),
		menuLabel: frontmatter.menuLabel,
		showInMenu: frontmatter.showInMenu,
		menuOrder: frontmatter.menuOrder,
		sha,
	};
}

function serializePage(page: PageRecord): string {
	const frontmatter: Record<string, unknown> = {
		title: page.title,
		slug: page.slug,
		seoTitle: page.seoTitle,
		description: page.description,
		published: page.published,
		updatedAt: page.updatedAt,
	};

	if (page.menuLabel) frontmatter.menuLabel = page.menuLabel;
	if (page.showInMenu !== undefined) frontmatter.showInMenu = page.showInMenu;
	if (page.menuOrder !== undefined) frontmatter.menuOrder = page.menuOrder;

	return matter.stringify(`\n${page.body}\n`, frontmatter);
}

function pagePath(slug: string): string {
	return `${PAGES_CONTENT_DIR}/${slugToFilename(slug)}`;
}

async function readLocalPage(slug: string): Promise<PageRecord | null> {
	const filePath = path.join(pagesDir, slugToFilename(slug));
	if (!fs.existsSync(filePath)) {
		return null;
	}
	const raw = fs.readFileSync(filePath, 'utf-8');
	return parsePage(raw);
}

async function writeLocalPage(page: PageRecord): Promise<void> {
	fs.mkdirSync(pagesDir, { recursive: true });
	const filePath = path.join(pagesDir, slugToFilename(page.slug));
	fs.writeFileSync(filePath, serializePage(page), 'utf-8');
}

async function deleteLocalPage(slug: string): Promise<void> {
	const filePath = path.join(pagesDir, slugToFilename(slug));
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
}

export async function listPages(): Promise<PageListItem[]> {
	if (isGitHubConfigured()) {
		const files = await listGitHubPageFiles();
		const pages = await Promise.all(
			files.map(async (file) => {
				const githubFile = await getGitHubFile(file.path);
				if (!githubFile) return null;
				const page = parsePage(githubFile.content, githubFile.sha);
				return {
					title: page.title,
					slug: page.slug,
					updatedAt: page.updatedAt,
					published: page.published,
				};
			}),
		);
		return pages.filter((page): page is PageListItem => page !== null).sort((a, b) => a.title.localeCompare(b.title));
	}

	if (!fs.existsSync(pagesDir)) {
		return [];
	}

	return fs
		.readdirSync(pagesDir)
		.filter((file) => file.endsWith('.md'))
		.map((file) => {
			const raw = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
			const page = parsePage(raw);
			return {
				title: page.title,
				slug: page.slug,
				updatedAt: page.updatedAt,
				published: page.published,
			};
		})
		.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPage(slug: string): Promise<PageRecord | null> {
	if (!isValidSlug(slug)) {
		return null;
	}

	if (isGitHubConfigured()) {
		const githubFile = await getGitHubFile(pagePath(slug));
		if (!githubFile) return null;
		return parsePage(githubFile.content, githubFile.sha);
	}

	return readLocalPage(slug);
}

export async function savePage(page: PageRecord, originalSlug?: string): Promise<void> {
	if (!isValidSlug(page.slug)) {
		throw new Error('Invalid slug');
	}
	if (!page.title.trim()) {
		throw new Error('Title is required');
	}

	page.updatedAt = todayIsoDate();
	const content = serializePage(page);
	const commitMessage = originalSlug && originalSlug !== page.slug
		? `Update page: ${originalSlug} → ${page.slug}`
		: `Update page: ${page.slug}`;

	if (isGitHubConfigured()) {
		if (originalSlug && originalSlug !== page.slug) {
			const oldPath = pagePath(originalSlug);
			const oldFile = await getGitHubFile(oldPath);
			if (oldFile) {
				await deleteGitHubFile(oldPath, oldFile.sha, `Remove old page file: ${originalSlug}`);
			}
		}

		const targetPath = pagePath(page.slug);
		const existing = await getGitHubFile(targetPath);
		await putGitHubFile(targetPath, content, commitMessage, existing?.sha);
		return;
	}

	if (originalSlug && originalSlug !== page.slug) {
		await deleteLocalPage(originalSlug);
	}

	await writeLocalPage(page);
}

export async function pageExists(slug: string): Promise<boolean> {
	const page = await getPage(slug);
	return page !== null;
}
