import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const pagesRoot = path.join(process.cwd(), 'src/content/pages');
const blogRoot = path.join(process.cwd(), 'src/content/blog');
const contentRoot = path.join(process.cwd(), 'content');
const RESERVED_PAGE_SLUGS = new Set(['home', 'chase-reports']);

marked.setOptions({ gfm: true, breaks: true });

export const PAGES_CONTENT_DIR = 'src/content/pages';
export const BLOG_CONTENT_DIR = 'src/content/blog';
export const GALLERY_PAGE_SLUG = 'gallery';
export const BLOG_INDEX_PAGE_SLUG = 'chase-reports';
export const ADMIN_ONLY_PAGE_SLUGS = new Set([GALLERY_PAGE_SLUG, BLOG_INDEX_PAGE_SLUG]);

export interface PageFrontmatter {
	title: string;
	slug: string;
	menuLabel?: string;
	showInMenu?: boolean;
	menuOrder?: number;
	seoTitle?: string;
	description?: string;
	/** @deprecated use description */
	seoDescription?: string;
	published?: boolean;
	updatedAt?: string;
}

export interface Page extends PageFrontmatter {
	body: string;
	html: string;
	filename: string;
}

export interface ChaseReportFrontmatter {
	title: string;
	slug: string;
	date: string;
	excerpt?: string;
	featuredImage?: string;
	status: 'draft' | 'published';
}

export interface ChaseReport extends ChaseReportFrontmatter {
	body: string;
	html: string;
	filename: string;
}

export interface SiteSettings {
	siteTitle: string;
	tagline?: string;
	youtubeUrl?: string;
	xUrl?: string;
	supportUrl?: string;
	liveStreamEmbedUrl?: string;
}

function readMarkdownFiles<T>(directory: string): Array<{ data: T; body: string; filename: string }> {
	if (!fs.existsSync(directory)) {
		return [];
	}

	return fs
		.readdirSync(directory)
		.filter((file) => file.endsWith('.md'))
		.map((file) => {
			const raw = fs.readFileSync(path.join(directory, file), 'utf-8');
			const { data, content } = matter(raw);
			return {
				data: data as T,
				body: content.trim(),
				filename: file.replace(/\.md$/, ''),
			};
		});
}

function toHtml(body: string): string {
	return marked.parse(body) as string;
}

function normalizePage(data: PageFrontmatter, body: string, filename: string): Page {
	const slug = data.slug || filename;
	const description = data.description || data.seoDescription;
	return {
		...data,
		slug,
		description,
		body,
		html: toHtml(body),
		filename,
	};
}

export function getAllPages(includeUnpublished = false): Page[] {
	return readMarkdownFiles<PageFrontmatter>(pagesRoot)
		.map(({ data, body, filename }) => normalizePage(data, body, filename))
		.filter((page) => includeUnpublished || page.published !== false);
}

export function getPageBySlug(slug: string, includeUnpublished = false): Page | undefined {
	return getAllPages(includeUnpublished).find((page) => page.slug === slug);
}

export function getRoutablePages(): Page[] {
	return getAllPages().filter((page) => !RESERVED_PAGE_SLUGS.has(page.slug));
}

export function getMenuPages(): Page[] {
	return getAllPages()
		.filter((page) => page.showInMenu && page.published !== false)
		.sort((a, b) => (a.menuOrder ?? 999) - (b.menuOrder ?? 999));
}

export function getPageHref(slug: string): string {
	if (slug === 'home') return '/';
	if (slug === 'chase-reports') return '/chase-reports';
	return `/${slug}`;
}

export function getAllChaseReports(includeDrafts = false): ChaseReport[] {
	const blogDir = fs.existsSync(blogRoot) ? blogRoot : path.join(contentRoot, 'chase-reports');

	return readMarkdownFiles<ChaseReportFrontmatter>(blogDir)
		.map(({ data, body, filename }) => {
			const slug = data.slug || filename;
			return {
				...data,
				slug,
				body,
				html: toHtml(body),
				filename,
			};
		})
		.filter((report) => includeDrafts || report.status === 'published')
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getChaseReportBySlug(slug: string, includeDrafts = false): ChaseReport | undefined {
	return getAllChaseReports(includeDrafts).find((report) => report.slug === slug);
}

export function getSiteSettings(): SiteSettings {
	const settingsPath = path.join(contentRoot, 'settings/site.json');
	const raw = fs.readFileSync(settingsPath, 'utf-8');
	return JSON.parse(raw) as SiteSettings;
}
