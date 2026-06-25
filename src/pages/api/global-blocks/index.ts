import type { APIRoute } from 'astro';
import { getGlobalBlocks, saveGlobalBlocks, type GlobalBlocksConfig } from '../../../lib/global-blocks';

export const prerender = false;

export const GET: APIRoute = async () => {
	const { config, sha } = await getGlobalBlocks();
	return new Response(JSON.stringify({ config, sha }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
	const body = (await request.json()) as { config: GlobalBlocksConfig; sha?: string };
	await saveGlobalBlocks(body.config, body.sha);
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
