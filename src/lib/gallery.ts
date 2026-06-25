import { GALLERY_PAGE_SLUG } from './content';
import { getPage, savePage, type PageRecord } from './pages';

export async function getGalleryPage(): Promise<PageRecord | null> {
	return getPage(GALLERY_PAGE_SLUG);
}

export async function saveGalleryPage(page: PageRecord): Promise<void> {
	page.slug = GALLERY_PAGE_SLUG;
	return savePage(page, GALLERY_PAGE_SLUG);
}
