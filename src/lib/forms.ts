import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, writeJsonFile } from './json-store';
import type { FormDefinition, FormsLibrary } from '../types/forms';
import { getFormById as findForm } from './forms-utils';

export { createFormDefinition } from './forms-utils';

export const DEFAULT_FORMS: FormsLibrary = { forms: [] };

const FORMS_PATH = 'content/forms/definitions.json';

export async function getFormsLibrary(): Promise<{ library: FormsLibrary; sha?: string }> {
	const { data, sha } = await readJsonFile(FORMS_PATH, DEFAULT_FORMS);
	return { library: data, sha };
}

export async function saveFormsLibrary(library: FormsLibrary, sha?: string): Promise<void> {
	await writeJsonFile(FORMS_PATH, library, 'Update forms library', sha);
}

export function getFormsLibraryForBuild(): FormsLibrary {
	const file = path.join(process.cwd(), FORMS_PATH);
	if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
	return DEFAULT_FORMS;
}

export function getFormById(library: FormsLibrary, id: string): FormDefinition | undefined {
	return findForm(library.forms, id);
}
