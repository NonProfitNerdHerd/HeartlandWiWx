import type { APIRoute } from 'astro';
import { getMediaLibrary, saveMediaLibrary, type MediaLibrary } from '../../../lib/media';

export const prerender = false;

export const GET: APIRoute = async () => {
	const { library, sha } = await getMediaLibrary();
	return new Response(JSON.stringify({ library, sha }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
	const body = (await request.json()) as { library: MediaLibrary; sha?: string };
	await saveMediaLibrary(body.library, body.sha);
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
