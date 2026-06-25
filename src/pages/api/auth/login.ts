import type { APIRoute } from 'astro';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, verifyCredentials } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	const body = await request.json();
	const username = String(body.username ?? '');
	const password = String(body.password ?? '');

	if (!verifyCredentials(username, password)) {
		return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const token = createSessionToken(username);
	cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
