import type { APIRoute } from 'astro';
import { getTheme, saveTheme, type ThemeConfig } from '../../../lib/theme';

export const prerender = false;

export const GET: APIRoute = async () => {
	const { theme, sha } = await getTheme();
	return new Response(JSON.stringify({ theme, sha }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
	const body = (await request.json()) as { theme: ThemeConfig; sha?: string };
	await saveTheme(body.theme, body.sha);
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
