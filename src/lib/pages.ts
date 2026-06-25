import { ADMIN_ONLY_PAGE_SLUGS, PAGES_CONTENT_DIR } from './content';
import { createContentService, type ContentListItem, type ContentRecord } from './cms';

export type PageRecord = ContentRecord;
export type PageListItem = ContentListItem;

const pageService = createContentService({
	contentDir: PAGES_CONTENT_DIR,
	label: 'page',
});

export async function listPages(): Promise<PageListItem[]> {
	const pages = await pageService.listItems();
	return pages
		.filter((page) => !ADMIN_ONLY_PAGE_SLUGS.has(page.slug))
		.sort((a, b) => {
			if (a.slug === 'home') return -1;
			if (b.slug === 'home') return 1;
			return a.title.localeCompare(b.title);
		});
}

export async function getPage(slug: string): Promise<PageRecord | null> {
	return pageService.getItem(slug);
}

export async function savePage(page: PageRecord, originalSlug?: string): Promise<void> {
	return pageService.saveItem(page, originalSlug);
}

export async function pageExists(slug: string): Promise<boolean> {
	return pageService.itemExists(slug);
}

export { pageService };
