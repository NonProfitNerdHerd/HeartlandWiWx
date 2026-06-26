import type { APIRoute } from 'astro';
import { getFormById, getFormsLibrary } from '../../../lib/forms';
import { createSubmission, getFormSubmissions, saveFormSubmissions } from '../../../lib/form-submissions';
import type { FormSubmission } from '../../../types/forms';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const { store, sha } = await getFormSubmissions();
	const formId = url.searchParams.get('formId');
	const q = url.searchParams.get('q')?.toLowerCase().trim() ?? '';
	let submissions = store.submissions;
	if (formId) submissions = submissions.filter((s) => s.formId === formId);
	if (q) {
		submissions = submissions.filter(
			(s) =>
				s.formName.toLowerCase().includes(q) ||
				s.pageSlug?.toLowerCase().includes(q) ||
				JSON.stringify(s.values).toLowerCase().includes(q),
		);
	}
	return new Response(JSON.stringify({ submissions, sha }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
	const body = (await request.json()) as {
		formId: string;
		formName?: string;
		pageSlug?: string;
		values: Record<string, string | string[]>;
	};

	if (!body.formId || !body.values) {
		return new Response(JSON.stringify({ error: 'Invalid submission' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const { library } = await getFormsLibrary();
	const form = getFormById(library, body.formId);
	if (!form) {
		return new Response(JSON.stringify({ error: 'Form not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	for (const field of form.fields) {
		if (!field.required || field.type === 'hidden') continue;
		const val = body.values[field.id];
		const empty = val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
		if (empty) {
			return new Response(JSON.stringify({ error: `${field.label} is required` }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	const submission = createSubmission({
		formId: form.id,
		formName: form.name,
		pageSlug: body.pageSlug,
		ip: clientAddress,
		values: body.values,
	});

	const { store, sha } = await getFormSubmissions();
	store.submissions.unshift(submission);
	await saveFormSubmissions(store, sha);

	return new Response(JSON.stringify({ ok: true, message: form.successMessage }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
