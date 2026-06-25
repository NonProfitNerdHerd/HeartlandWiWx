import type { APIRoute } from 'astro';
import { getSiteText, saveSiteText, type SiteTextLabels } from '../../../lib/site-text';

export const prerender = false;

export const GET: APIRoute = async () => {
	const { labels, sha } = await getSiteText();
	return new Response(JSON.stringify({ labels, sha }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
	const body = (await request.json()) as { labels: SiteTextLabels; sha?: string };
	await saveSiteText(body.labels, body.sha);
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
