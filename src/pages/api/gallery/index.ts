import type { APIRoute } from 'astro';
import { getPageDocument, savePageDocument, type PageDocument } from '../../../lib/page-document';
import { GALLERY_PAGE_SLUG } from '../../../lib/content';

export const prerender = false;

export const GET: APIRoute = async () => {
	const page = await getPageDocument(GALLERY_PAGE_SLUG);
	if (!page) return new Response(JSON.stringify({ error: 'Gallery not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
	return new Response(JSON.stringify({ page: page.doc }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
	const body = (await request.json()) as PageDocument;
	body.meta.slug = GALLERY_PAGE_SLUG;
	await savePageDocument(body, GALLERY_PAGE_SLUG);
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
