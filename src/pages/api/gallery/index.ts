import type { APIRoute } from 'astro';
import { getGalleryPage, saveGalleryPage } from '../../../lib/gallery';
import type { PageRecord } from '../../../lib/pages';

export const prerender = false;

function parseGalleryPayload(body: unknown): PageRecord {
	const data = body as Partial<PageRecord>;
	return {
		title: String(data.title ?? '').trim(),
		slug: 'gallery',
		seoTitle: String(data.seoTitle ?? '').trim() || String(data.title ?? '').trim(),
		description: String(data.description ?? '').trim(),
		body: String(data.body ?? ''),
		published: data.published !== false,
		updatedAt: String(data.updatedAt ?? new Date().toISOString().slice(0, 10)),
		menuLabel: data.menuLabel ? String(data.menuLabel) : 'Gallery',
		showInMenu: data.showInMenu !== false,
		menuOrder: data.menuOrder !== undefined ? Number(data.menuOrder) : 3,
	};
}

export const GET: APIRoute = async () => {
	try {
		const page = await getGalleryPage();
		if (!page) {
			return new Response(JSON.stringify({ error: 'Gallery page not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ page }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load gallery page';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.json();
	const page = parseGalleryPayload(body);

	try {
		await saveGalleryPage(page);
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to save gallery page';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
