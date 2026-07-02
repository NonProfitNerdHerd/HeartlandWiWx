import type { APIRoute } from 'astro';
import { getFormSubmissions, saveFormSubmissions } from '../../../lib/form-submissions';

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
	}

	const body = (await request.json()) as { status?: 'read' | 'unread' };
	const { store, sha } = await getFormSubmissions();
	const idx = store.submissions.findIndex((s) => s.id === id);
	if (idx === -1) {
		return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
	}

	if (body.status) {
		store.submissions[idx] = { ...store.submissions[idx], status: body.status };
	}

	await saveFormSubmissions(store, sha);
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};

export const DELETE: APIRoute = async ({ params }) => {
	const id = params.id;
	if (!id) {
		return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
	}

	const { store, sha } = await getFormSubmissions();
	store.submissions = store.submissions.filter((s) => s.id !== id);
	await saveFormSubmissions(store, sha);
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
