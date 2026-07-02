import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { markdownToBlocks } from './blocks/render';
import { BLOG_CONTENT_DIR } from './constants';
import { deleteGitHubFile, getGitHubFile, isGitHubConfigured, listGitHubDirectory, putGitHubFile } from './github';
import { isValidSlug, slugToFilename } from './slug';
import type { Block, PostDocument, PostMeta } from '../types/blocks';

const blogLocalDir = path.join(process.cwd(), BLOG_CONTENT_DIR);

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

function postJsonPath(slug: string): string {
	return `${BLOG_CONTENT_DIR}/${slug}.post.json`;
}

function postMdPath(slug: string): string {
	return `${BLOG_CONTENT_DIR}/${slugToFilename(slug)}`;
}

function defaultMeta(slug: string, partial?: Partial<PostMeta>): PostMeta {
	return {
		title: partial?.title ?? slug,
		slug,
		seoTitle: partial?.seoTitle ?? partial?.title ?? slug,
		description: partial?.description ?? '',
		published: partial?.published ?? true,
		draft: partial?.draft ?? false,
		featuredImage: partial?.featuredImage ?? '',
		author: partial?.author ?? '',
		publishDate: partial?.publishDate ?? today(),
		updatedAt: partial?.updatedAt ?? today(),
		excerpt: partial?.excerpt ?? '',
		categories: partial?.categories ?? [],
		tags: partial?.tags ?? [],
	};
}

function migrateFromMarkdown(raw: string, slug: string): PostDocument {
	const { data, content } = matter(raw);
	const fm = data as Record<string, unknown>;
	const categories = fm.categories;
	const tags = fm.tags;
	return {
		meta: defaultMeta(slug, {
			title: String(fm.title ?? slug),
			seoTitle: String(fm.seoTitle ?? fm.title ?? slug),
			description: String(fm.description ?? fm.seoDescription ?? ''),
			published: fm.published !== false && fm.status !== 'draft',
			draft: fm.status === 'draft' || fm.draft === true,
			featuredImage: String(fm.featuredImage ?? ''),
			author: String(fm.author ?? ''),
			publishDate: String(fm.date ?? fm.publishDate ?? fm.updatedAt ?? today()).slice(0, 10),
			updatedAt: String(fm.updatedAt ?? fm.date ?? today()).slice(0, 10),
			excerpt: String(fm.excerpt ?? ''),
			categories: Array.isArray(categories) ? categories.map(String) : [],
			tags: Array.isArray(tags) ? tags.map(String) : [],
		}),
		blocks: markdownToBlocks(content.trim()),
	};
}

async function readPostJson(slug: string): Promise<{ doc: PostDocument; sha?: string } | null> {
	const jsonPath = postJsonPath(slug);
	if (isGitHubConfigured()) {
		const file = await getGitHubFile(jsonPath);
		if (file) {
			return { doc: JSON.parse(file.content) as PostDocument, sha: file.sha };
		}
	}

	const localJson = path.join(process.cwd(), jsonPath);
	if (fs.existsSync(localJson)) {
		return { doc: JSON.parse(fs.readFileSync(localJson, 'utf-8')) as PostDocument };
	}

	const mdPath = postMdPath(slug);
	if (isGitHubConfigured()) {
		const mdFile = await getGitHubFile(mdPath);
		if (mdFile) {
			return { doc: migrateFromMarkdown(mdFile.content, slug) };
		}
	}

	const localMd = path.join(blogLocalDir, slugToFilename(slug));
	if (fs.existsSync(localMd)) {
		return { doc: migrateFromMarkdown(fs.readFileSync(localMd, 'utf-8'), slug) };
	}

	return null;
}

export interface PostListItem {
	title: string;
	slug: string;
	updatedAt: string;
	published: boolean;
	draft: boolean;
	date: string;
}

export async function listPostDocuments(): Promise<PostListItem[]> {
	const slugs = new Set<string>();

	if (fs.existsSync(blogLocalDir)) {
		for (const file of fs.readdirSync(blogLocalDir)) {
			if (file.endsWith('.post.json')) slugs.add(file.replace('.post.json', ''));
			else if (file.endsWith('.md')) slugs.add(file.replace('.md', ''));
		}
	}

	if (isGitHubConfigured()) {
		try {
			const files = await listGitHubDirectory(BLOG_CONTENT_DIR);
			for (const file of files) {
				if (file.name.endsWith('.post.json')) slugs.add(file.name.replace('.post.json', ''));
				else if (file.name.endsWith('.md')) slugs.add(file.name.replace('.md', ''));
			}
		} catch {
			/* use local */
		}
	}

	const items: PostListItem[] = [];
	for (const slug of slugs) {
		if (!isValidSlug(slug)) continue;
		const post = await readPostJson(slug);
		if (!post) continue;
		items.push({
			title: post.doc.meta.title,
			slug: post.doc.meta.slug,
			updatedAt: post.doc.meta.updatedAt,
			published: post.doc.meta.published,
			draft: post.doc.meta.draft,
			date: post.doc.meta.publishDate,
		});
	}

	return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostDocument(slug: string): Promise<{ doc: PostDocument; sha?: string } | null> {
	if (!isValidSlug(slug)) return null;
	return readPostJson(slug);
}

export async function savePostDocument(doc: PostDocument, originalSlug?: string): Promise<void> {
	if (!isValidSlug(doc.meta.slug)) throw new Error('Invalid slug');
	doc.meta.updatedAt = today();
	const content = `${JSON.stringify(doc, null, 2)}\n`;
	const slug = doc.meta.slug;
	const jsonPath = postJsonPath(slug);
	const message =
		originalSlug && originalSlug !== slug
			? `Update blog post: ${originalSlug} → ${slug}`
			: `Update blog post: ${slug}`;

	if (isGitHubConfigured()) {
		if (originalSlug && originalSlug !== slug) {
			const oldJson = await getGitHubFile(postJsonPath(originalSlug));
			if (oldJson) await deleteGitHubFile(postJsonPath(originalSlug), oldJson.sha, `Remove post: ${originalSlug}`);
			const oldMd = await getGitHubFile(postMdPath(originalSlug));
			if (oldMd) await deleteGitHubFile(postMdPath(originalSlug), oldMd.sha, `Remove legacy md: ${originalSlug}`);
		}

		const existing = await getGitHubFile(jsonPath);
		await putGitHubFile(jsonPath, content, message, existing?.sha);

		const legacyMd = await getGitHubFile(postMdPath(slug));
		if (legacyMd) {
			await deleteGitHubFile(postMdPath(slug), legacyMd.sha, `Remove legacy md after JSON migration: ${slug}`);
		}
		return;
	}

	fs.mkdirSync(blogLocalDir, { recursive: true });
	if (originalSlug && originalSlug !== slug) {
		const oldJson = path.join(blogLocalDir, `${originalSlug}.post.json`);
		const oldMd = path.join(blogLocalDir, slugToFilename(originalSlug));
		if (fs.existsSync(oldJson)) fs.unlinkSync(oldJson);
		if (fs.existsSync(oldMd)) fs.unlinkSync(oldMd);
	}
	fs.writeFileSync(path.join(blogLocalDir, `${slug}.post.json`), content, 'utf-8');
	const localMd = path.join(blogLocalDir, slugToFilename(slug));
	if (fs.existsSync(localMd)) fs.unlinkSync(localMd);
}

export async function postDocumentExists(slug: string): Promise<boolean> {
	const post = await getPostDocument(slug);
	return post !== null;
}

export function getPostDocumentForBuild(slug: string): PostDocument | null {
	const jsonPath = path.join(blogLocalDir, `${slug}.post.json`);
	if (fs.existsSync(jsonPath)) {
		return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as PostDocument;
	}
	const mdPath = path.join(blogLocalDir, slugToFilename(slug));
	if (fs.existsSync(mdPath)) {
		return migrateFromMarkdown(fs.readFileSync(mdPath, 'utf-8'), slug);
	}
	return null;
}

export function getAllPostDocumentsForBuild(includeDrafts = false): PostDocument[] {
	if (!fs.existsSync(blogLocalDir)) return [];
	const slugs = new Set<string>();
	for (const file of fs.readdirSync(blogLocalDir)) {
		if (file.endsWith('.post.json')) slugs.add(file.replace('.post.json', ''));
		else if (file.endsWith('.md')) slugs.add(file.replace('.md', ''));
	}
	return [...slugs]
		.filter((slug) => isValidSlug(slug))
		.map((slug) => getPostDocumentForBuild(slug))
		.filter((doc): doc is PostDocument => {
			if (!doc) return false;
			if (includeDrafts) return true;
			return doc.meta.published && !doc.meta.draft;
		});
}

export type { Block, PostDocument, PostMeta };
