import type { APIRoute } from 'astro';
import { ADMIN_ONLY_PAGE_SLUGS } from '../../../lib/content';
import { listPageDocuments } from '../../../lib/page-document';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const pages = await listPageDocuments(ADMIN_ONLY_PAGE_SLUGS);
		return new Response(JSON.stringify({ pages }), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to list pages';
		return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
	}
};
