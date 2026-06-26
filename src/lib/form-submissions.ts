import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { readJsonFile, writeJsonFile } from './json-store';
import type { FormSubmission, FormSubmissionsStore } from '../types/forms';

export const DEFAULT_SUBMISSIONS: FormSubmissionsStore = { submissions: [] };

const SUBMISSIONS_PATH = 'content/form-submissions/submissions.json';

export async function getFormSubmissions(): Promise<{ store: FormSubmissionsStore; sha?: string }> {
	const { data, sha } = await readJsonFile(SUBMISSIONS_PATH, DEFAULT_SUBMISSIONS);
	return { store: data, sha };
}

export async function saveFormSubmissions(store: FormSubmissionsStore, sha?: string): Promise<void> {
	await writeJsonFile(SUBMISSIONS_PATH, store, 'Update form submissions', sha);
}

export function getFormSubmissionsForBuild(): FormSubmissionsStore {
	const file = path.join(process.cwd(), SUBMISSIONS_PATH);
	if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
	return DEFAULT_SUBMISSIONS;
}

export function createSubmission(input: {
	formId: string;
	formName: string;
	pageSlug?: string;
	ip?: string;
	values: Record<string, string | string[]>;
}): FormSubmission {
	return {
		id: nanoid(12),
		formId: input.formId,
		formName: input.formName,
		pageSlug: input.pageSlug,
		submittedAt: new Date().toISOString(),
		ip: input.ip,
		values: input.values,
		status: 'unread',
	};
}
