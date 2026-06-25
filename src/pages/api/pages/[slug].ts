import type { APIRoute } from 'astro';
import {
	getPageDocument,
	listPageDocuments,
	pageDocumentExists,
	savePageDocument,
	type PageDocument,
} from '../../../lib/page-document';
import { isValidSlug } from '../../../lib/slug';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const slug = params.slug ?? '';
	if (!isValidSlug(slug)) {
		return new Response(JSON.stringify({ error: 'Invalid slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
	}

	try {
		const page = await getPageDocument(slug);
		if (!page) {
			return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
		}
		return new Response(JSON.stringify({ page: page.doc }), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load page';
		return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
	}
};

export const PUT: APIRoute = async ({ params, request }) => {
	const originalSlug = params.slug ?? '';
	const body = (await request.json()) as PageDocument;

	if (!isValidSlug(body.meta?.slug ?? '')) {
		return new Response(JSON.stringify({ error: 'Invalid slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
	}

	try {
		if (originalSlug === 'new') {
			if (await pageDocumentExists(body.meta.slug)) {
				return new Response(JSON.stringify({ error: 'A page with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
			}
			await savePageDocument(body);
		} else {
			if (!isValidSlug(originalSlug)) {
				return new Response(JSON.stringify({ error: 'Invalid slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
			}
			const existing = await getPageDocument(originalSlug);
			if (!existing) {
				return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
			}
			if (originalSlug !== body.meta.slug && (await pageDocumentExists(body.meta.slug))) {
				return new Response(JSON.stringify({ error: 'A page with this slug already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
			}
			body.meta.menuLabel = body.meta.menuLabel ?? existing.doc.meta.menuLabel;
			body.meta.showInMenu = body.meta.showInMenu ?? existing.doc.meta.showInMenu;
			body.meta.menuOrder = body.meta.menuOrder ?? existing.doc.meta.menuOrder;
			await savePageDocument(body, originalSlug);
		}

		return new Response(JSON.stringify({ ok: true, slug: body.meta.slug }), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to save page';
		return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
	}
};

export const POST: APIRoute = PUT;
