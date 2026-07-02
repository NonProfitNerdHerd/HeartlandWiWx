import { nanoid } from 'nanoid';
import type { FormDefinition } from '../types/forms';

export function createFormDefinition(name: string): FormDefinition {
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '') || 'form';
	const now = new Date().toISOString();
	return {
		id: nanoid(10),
		name,
		slug,
		fields: [],
		submitLabel: 'Submit',
		successMessage: 'Thank you! Your submission has been received.',
		createdAt: now,
		updatedAt: now,
	};
}

export function getFormById(forms: FormDefinition[], id: string): FormDefinition | undefined {
	return forms.find((f) => f.id === id);
}
