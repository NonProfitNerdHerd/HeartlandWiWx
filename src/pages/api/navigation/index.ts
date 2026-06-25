import type { APIRoute } from 'astro';
import { getNavigation, saveNavigation, type NavMenu, type NavigationConfig } from '../../../lib/navigation';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const menu = (url.searchParams.get('menu') ?? 'header') as NavMenu;
	const { nav, sha } = await getNavigation(menu);
	return new Response(JSON.stringify({ nav, sha, menu }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, url }) => {
	const menu = (url.searchParams.get('menu') ?? 'header') as NavMenu;
	const body = (await request.json()) as { nav: NavigationConfig; sha?: string };
	await saveNavigation(menu, body.nav, body.sha);
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
