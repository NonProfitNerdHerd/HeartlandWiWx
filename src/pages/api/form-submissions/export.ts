import type { APIRoute } from 'astro';
import { getFormSubmissions } from '../../../lib/form-submissions';

export const prerender = false;

function csvEscape(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export const GET: APIRoute = async ({ url }) => {
	const formId = url.searchParams.get('formId');
	const { store } = await getFormSubmissions();
	let submissions = store.submissions;
	if (formId) submissions = submissions.filter((s) => s.formId === formId);

	const fieldKeys = new Set<string>();
	for (const s of submissions) {
		Object.keys(s.values).forEach((k) => fieldKeys.add(k));
	}
	const keys = [...fieldKeys];
	const header = ['id', 'formId', 'formName', 'pageSlug', 'submittedAt', 'status', 'ip', ...keys].join(',');
	const rows = submissions.map((s) => {
		const base = [
			s.id,
			s.formId,
			s.formName,
			s.pageSlug ?? '',
			s.submittedAt,
			s.status,
			s.ip ?? '',
		];
		const vals = keys.map((k) => {
			const v = s.values[k];
			if (Array.isArray(v)) return csvEscape(v.join('; '));
			return csvEscape(String(v ?? ''));
		});
		return [...base, ...vals].map((c) => csvEscape(String(c))).join(',');
	});

	const csv = [header, ...rows].join('\n');
	return new Response(csv, {
		status: 200,
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="form-submissions${formId ? `-${formId}` : ''}.csv"`,
		},
	});
};
