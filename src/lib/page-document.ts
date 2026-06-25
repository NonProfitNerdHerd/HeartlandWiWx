import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { markdownToBlocks } from './blocks/render';
import { deleteGitHubFile, getGitHubFile, isGitHubConfigured, listGitHubDirectory, putGitHubFile } from './github';
import { isValidSlug, slugToFilename } from './slug';
import type { Block, PageDocument, PageMeta } from '../types/blocks';

const PAGES_DIR = 'src/content/pages';
const pagesLocalDir = path.join(process.cwd(), PAGES_DIR);

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

function pageJsonPath(slug: string): string {
	return `${PAGES_DIR}/${slug}.page.json`;
}

function pageMdPath(slug: string): string {
	return `${PAGES_DIR}/${slugToFilename(slug)}`;
}

function defaultMeta(slug: string, partial?: Partial<PageMeta>): PageMeta {
	return {
		title: partial?.title ?? slug,
		slug,
		seoTitle: partial?.seoTitle ?? partial?.title ?? slug,
		description: partial?.description ?? '',
		published: partial?.published ?? true,
		draft: partial?.draft ?? false,
		featuredImage: partial?.featuredImage ?? '',
		template: partial?.template ?? 'default',
		author: partial?.author ?? '',
		publishDate: partial?.publishDate ?? today(),
		updatedAt: partial?.updatedAt ?? today(),
		menuLabel: partial?.menuLabel,
		showInMenu: partial?.showInMenu,
		menuOrder: partial?.menuOrder,
	};
}

function migrateFromMarkdown(raw: string, slug: string): PageDocument {
	const { data, content } = matter(raw);
	const fm = data as Record<string, unknown>;
	return {
		meta: defaultMeta(slug, {
			title: String(fm.title ?? slug),
			seoTitle: String(fm.seoTitle ?? fm.title ?? slug),
			description: String(fm.description ?? fm.seoDescription ?? ''),
			published: fm.published !== false,
			draft: fm.draft === true,
			menuLabel: fm.menuLabel ? String(fm.menuLabel) : undefined,
			showInMenu: fm.showInMenu === true,
			menuOrder: fm.menuOrder !== undefined ? Number(fm.menuOrder) : undefined,
			updatedAt: String(fm.updatedAt ?? today()),
			publishDate: String(fm.publishDate ?? fm.updatedAt ?? today()),
			author: String(fm.author ?? ''),
			featuredImage: String(fm.featuredImage ?? ''),
			template: String(fm.template ?? 'default'),
		}),
		blocks: markdownToBlocks(content.trim()),
	};
}

async function readPageJson(slug: string): Promise<{ doc: PageDocument; sha?: string } | null> {
	const jsonPath = pageJsonPath(slug);
	if (isGitHubConfigured()) {
		const file = await getGitHubFile(jsonPath);
		if (file) {
			return { doc: JSON.parse(file.content) as PageDocument, sha: file.sha };
		}
	}

	const localJson = path.join(process.cwd(), jsonPath);
	if (fs.existsSync(localJson)) {
		return { doc: JSON.parse(fs.readFileSync(localJson, 'utf-8')) as PageDocument };
	}

	const mdPath = pageMdPath(slug);
	if (isGitHubConfigured()) {
		const mdFile = await getGitHubFile(mdPath);
		if (mdFile) {
			return { doc: migrateFromMarkdown(mdFile.content, slug), sha: undefined };
		}
	}

	const localMd = path.join(pagesLocalDir, slugToFilename(slug));
	if (fs.existsSync(localMd)) {
		return { doc: migrateFromMarkdown(fs.readFileSync(localMd, 'utf-8'), slug) };
	}

	return null;
}

export interface PageListItem {
	title: string;
	slug: string;
	updatedAt: string;
	published: boolean;
	draft: boolean;
}

export async function listPageDocuments(excludeSlugs: Set<string> = new Set()): Promise<PageListItem[]> {
	const slugs = new Set<string>();

	if (fs.existsSync(pagesLocalDir)) {
		for (const file of fs.readdirSync(pagesLocalDir)) {
			if (file.endsWith('.page.json')) slugs.add(file.replace('.page.json', ''));
			else if (file.endsWith('.md')) slugs.add(file.replace('.md', ''));
		}
	}

	if (isGitHubConfigured()) {
		try {
			const files = await listGitHubDirectory(PAGES_DIR);
			for (const file of files) {
				if (file.name.endsWith('.page.json')) slugs.add(file.name.replace('.page.json', ''));
				else if (file.name.endsWith('.md')) slugs.add(file.name.replace('.md', ''));
			}
		} catch {
			// use local
		}
	}

	const items: PageListItem[] = [];
	for (const slug of slugs) {
		if (!isValidSlug(slug) || excludeSlugs.has(slug)) continue;
		const page = await readPageJson(slug);
		if (!page) continue;
		items.push({
			title: page.doc.meta.title,
			slug: page.doc.meta.slug,
			updatedAt: page.doc.meta.updatedAt,
			published: page.doc.meta.published,
			draft: page.doc.meta.draft,
		});
	}

	return items.sort((a, b) => {
		if (a.slug === 'home') return -1;
		if (b.slug === 'home') return 1;
		return a.title.localeCompare(b.title);
	});
}

export async function getPageDocument(slug: string): Promise<{ doc: PageDocument; sha?: string } | null> {
	if (!isValidSlug(slug)) return null;
	return readPageJson(slug);
}

export async function savePageDocument(doc: PageDocument, originalSlug?: string): Promise<void> {
	if (!isValidSlug(doc.meta.slug)) throw new Error('Invalid slug');
	doc.meta.updatedAt = today();
	const content = `${JSON.stringify(doc, null, 2)}\n`;
	const slug = doc.meta.slug;
	const jsonPath = pageJsonPath(slug);
	const message = originalSlug && originalSlug !== slug ? `Update page: ${originalSlug} → ${slug}` : `Update page: ${slug}`;

	if (isGitHubConfigured()) {
		if (originalSlug && originalSlug !== slug) {
			const oldJson = await getGitHubFile(pageJsonPath(originalSlug));
			if (oldJson) await deleteGitHubFile(pageJsonPath(originalSlug), oldJson.sha, `Remove page: ${originalSlug}`);
			const oldMd = await getGitHubFile(pageMdPath(originalSlug));
			if (oldMd) await deleteGitHubFile(pageMdPath(originalSlug), oldMd.sha, `Remove legacy md: ${originalSlug}`);
		}

		const existing = await getGitHubFile(jsonPath);
		await putGitHubFile(jsonPath, content, message, existing?.sha);

		const legacyMd = await getGitHubFile(pageMdPath(slug));
		if (legacyMd) {
			await deleteGitHubFile(pageMdPath(slug), legacyMd.sha, `Remove legacy md after JSON migration: ${slug}`);
		}
		return;
	}

	fs.mkdirSync(pagesLocalDir, { recursive: true });
	if (originalSlug && originalSlug !== slug) {
		const oldJson = path.join(pagesLocalDir, `${originalSlug}.page.json`);
		const oldMd = path.join(pagesLocalDir, slugToFilename(originalSlug));
		if (fs.existsSync(oldJson)) fs.unlinkSync(oldJson);
		if (fs.existsSync(oldMd)) fs.unlinkSync(oldMd);
	}
	fs.writeFileSync(path.join(pagesLocalDir, `${slug}.page.json`), content, 'utf-8');
	const localMd = path.join(pagesLocalDir, slugToFilename(slug));
	if (fs.existsSync(localMd)) fs.unlinkSync(localMd);
}

export async function pageDocumentExists(slug: string): Promise<boolean> {
	const page = await getPageDocument(slug);
	return page !== null;
}

export function getPageDocumentForBuild(slug: string): PageDocument | null {
	const jsonPath = path.join(pagesLocalDir, `${slug}.page.json`);
	if (fs.existsSync(jsonPath)) {
		return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as PageDocument;
	}
	const mdPath = path.join(pagesLocalDir, slugToFilename(slug));
	if (fs.existsSync(mdPath)) {
		return migrateFromMarkdown(fs.readFileSync(mdPath, 'utf-8'), slug);
	}
	return null;
}

export function getAllPageDocumentsForBuild(excludeSlugs: Set<string> = new Set()): PageDocument[] {
	if (!fs.existsSync(pagesLocalDir)) return [];
	const slugs = new Set<string>();
	for (const file of fs.readdirSync(pagesLocalDir)) {
		if (file.endsWith('.page.json')) slugs.add(file.replace('.page.json', ''));
		else if (file.endsWith('.md')) slugs.add(file.replace('.md', ''));
	}
	return [...slugs]
		.filter((slug) => isValidSlug(slug) && !excludeSlugs.has(slug))
		.map((slug) => getPageDocumentForBuild(slug))
		.filter((doc): doc is PageDocument => doc !== null && doc.meta.published && !doc.meta.draft);
}

export type { Block, PageDocument, PageMeta };
