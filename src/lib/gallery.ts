import { GALLERY_PAGE_SLUG } from './constants';
import { getPageDocument } from './page-document';
import { savePageDocument, type PageDocument } from './page-document';

export async function getGalleryPage(): Promise<PageDocument['meta'] & { body: string; blocks: PageDocument['blocks'] } | null> {
	const page = await getPageDocument(GALLERY_PAGE_SLUG);
	if (!page) return null;
	return { ...page.doc.meta, body: '', blocks: page.doc.blocks };
}

export async function saveGalleryPage(meta: Partial<PageDocument['meta']>, blocks: PageDocument['blocks']): Promise<void> {
	const existing = await getPageDocument(GALLERY_PAGE_SLUG);
	const doc: PageDocument = existing?.doc ?? {
		meta: {
			title: 'Gallery',
			slug: GALLERY_PAGE_SLUG,
			seoTitle: 'Gallery',
			description: '',
			published: true,
			draft: false,
			featuredImage: '',
			template: 'default',
			author: '',
			publishDate: new Date().toISOString().slice(0, 10),
			updatedAt: new Date().toISOString().slice(0, 10),
			menuLabel: 'Gallery',
			showInMenu: true,
			menuOrder: 3,
		},
		blocks: [],
	};
	doc.meta = { ...doc.meta, ...meta, slug: GALLERY_PAGE_SLUG };
	doc.blocks = blocks;
	await savePageDocument(doc, GALLERY_PAGE_SLUG);
}
