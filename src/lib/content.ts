import fs from 'node:fs';
import path from 'node:path';
import { ADMIN_ONLY_PAGE_SLUGS, BLOG_CONTENT_DIR, BLOG_INDEX_PAGE_SLUG, PAGES_CONTENT_DIR } from './constants';
import { getAllPageDocumentsForBuild, getPageDocumentForBuild } from './page-document';
import { renderBlocks } from './blocks/render';
import { globalBlocksMap, getGlobalBlocksForBuild } from './global-blocks';
import matter from 'gray-matter';
import { marked } from 'marked';

const blogRoot = path.join(process.cwd(), BLOG_CONTENT_DIR);
const legacyBlogRoot = path.join(process.cwd(), 'content/chase-reports');
const RESERVED_PAGE_SLUGS = new Set(['home', BLOG_INDEX_PAGE_SLUG]);

marked.setOptions({ gfm: true, breaks: true });

export interface PageView {
	title: string;
	slug: string;
	seoTitle: string;
	description: string;
	html: string;
	published: boolean;
	template: string;
	featuredImage: string;
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

function pageDocToView(slug: string): PageView | undefined {
	const doc = getPageDocumentForBuild(slug);
	if (!doc || !doc.meta.published || doc.meta.draft) return undefined;

	const globalBlocks = globalBlocksMap(getGlobalBlocksForBuild());
	const html = renderBlocks(doc.blocks, globalBlocks);

	return {
		title: doc.meta.title,
		slug: doc.meta.slug,
		seoTitle: doc.meta.seoTitle || doc.meta.title,
		description: doc.meta.description,
		html,
		published: doc.meta.published,
		template: doc.meta.template,
		featuredImage: doc.meta.featuredImage,
	};
}

export function getPageBySlug(slug: string): PageView | undefined {
	return pageDocToView(slug);
}

export function getRoutablePages(): PageView[] {
	return getAllPageDocumentsForBuild(RESERVED_PAGE_SLUGS)
		.map((doc) => pageDocToView(doc.meta.slug))
		.filter((p): p is PageView => p !== undefined);
}

export function getMenuPages(): Array<{ slug: string; menuLabel?: string; title: string; menuOrder?: number }> {
	return getAllPageDocumentsForBuild()
		.filter((doc) => doc.meta.showInMenu && doc.meta.published)
		.sort((a, b) => (a.meta.menuOrder ?? 999) - (b.meta.menuOrder ?? 999))
		.map((doc) => ({
			slug: doc.meta.slug,
			menuLabel: doc.meta.menuLabel,
			title: doc.meta.title,
			menuOrder: doc.meta.menuOrder,
		}));
}

export function getPageHref(slug: string): string {
	if (slug === 'home') return '/';
	if (slug === BLOG_INDEX_PAGE_SLUG) return '/chase-reports';
	return `/${slug}`;
}

export function getAllChaseReports(includeDrafts = false): ChaseReport[] {
	const blogDir = fs.existsSync(blogRoot) ? blogRoot : legacyBlogRoot;
	if (!fs.existsSync(blogDir)) return [];

	return fs
		.readdirSync(blogDir)
		.filter((f) => f.endsWith('.md'))
		.map((file) => {
			const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
			const { data, content } = matter(raw);
			const fm = data as ChaseReportFrontmatter;
			const slug = fm.slug || file.replace('.md', '');
			return {
				...fm,
				slug,
				body: content.trim(),
				html: marked.parse(content.trim()) as string,
				filename: file.replace('.md', ''),
			};
		})
		.filter((r) => includeDrafts || r.status === 'published')
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getChaseReportBySlug(slug: string, includeDrafts = false): ChaseReport | undefined {
	return getAllChaseReports(includeDrafts).find((r) => r.slug === slug);
}

export function getSiteSettings(): SiteSettings {
	const settingsPath = path.join(process.cwd(), 'content/settings/site.json');
	const raw = fs.readFileSync(settingsPath, 'utf-8');
	return JSON.parse(raw) as SiteSettings;
}

export {
	ADMIN_ONLY_PAGE_SLUGS,
	BLOG_CONTENT_DIR,
	BLOG_INDEX_PAGE_SLUG,
	GALLERY_PAGE_SLUG,
	PAGES_CONTENT_DIR,
} from './constants';
