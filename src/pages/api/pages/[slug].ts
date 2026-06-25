import type { APIRoute } from 'astro';
import { getPage, pageExists, savePage, type PageRecord } from '../../../lib/pages';
import { isValidSlug } from '../../../lib/slug';

export const prerender = false;

function parsePagePayload(body: unknown): PageRecord {
	const data = body as Partial<PageRecord>;
	return {
		title: String(data.title ?? '').trim(),
		slug: String(data.slug ?? '').trim(),
		seoTitle: String(data.seoTitle ?? '').trim(),
		description: String(data.description ?? '').trim(),
		body: String(data.body ?? ''),
		published: data.published !== false,
		updatedAt: String(data.updatedAt ?? new Date().toISOString().slice(0, 10)),
		menuLabel: data.menuLabel ? String(data.menuLabel) : undefined,
		showInMenu: data.showInMenu === true,
		menuOrder: data.menuOrder !== undefined ? Number(data.menuOrder) : undefined,
	};
}

export const GET: APIRoute = async ({ params }) => {
	const slug = params.slug ?? '';
	if (!isValidSlug(slug)) {
		return new Response(JSON.stringify({ error: 'Invalid slug' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const page = await getPage(slug);
		if (!page) {
			return new Response(JSON.stringify({ error: 'Page not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ page }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load page';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const PUT: APIRoute = async ({ params, request }) => {
	const originalSlug = params.slug ?? '';
	const body = await request.json();
	const page = parsePagePayload(body);

	if (!isValidSlug(page.slug)) {
		return new Response(JSON.stringify({ error: 'Invalid slug' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		if (originalSlug === 'new') {
			if (await pageExists(page.slug)) {
				return new Response(JSON.stringify({ error: 'A page with this slug already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			await savePage(page);
		} else {
			if (!isValidSlug(originalSlug)) {
				return new Response(JSON.stringify({ error: 'Invalid slug' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const existing = await getPage(originalSlug);
			if (!existing) {
				return new Response(JSON.stringify({ error: 'Page not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			if (originalSlug !== page.slug && (await pageExists(page.slug))) {
				return new Response(JSON.stringify({ error: 'A page with this slug already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			page.menuLabel = page.menuLabel ?? existing.menuLabel;
			page.showInMenu = page.showInMenu ?? existing.showInMenu;
			page.menuOrder = page.menuOrder ?? existing.menuOrder;
			await savePage(page, originalSlug);
		}

		return new Response(JSON.stringify({ ok: true, slug: page.slug }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to save page';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const POST: APIRoute = PUT;
