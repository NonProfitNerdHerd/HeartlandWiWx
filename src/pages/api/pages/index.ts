import type { APIRoute } from 'astro';
import { listPages } from '../../../lib/pages';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const pages = await listPages();
		return new Response(JSON.stringify({ pages }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to list pages';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
