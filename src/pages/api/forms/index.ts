import type { APIRoute } from 'astro';
import { getFormsLibrary, saveFormsLibrary, type FormsLibrary } from '../../../lib/forms';

export const prerender = false;

export const GET: APIRoute = async () => {
	const { library, sha } = await getFormsLibrary();
	return new Response(JSON.stringify({ library, sha }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};

export const PUT: APIRoute = async ({ request }) => {
	const body = (await request.json()) as { library: FormsLibrary; sha?: string };
	await saveFormsLibrary(body.library, body.sha);
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
