export type FormFieldType =
	| 'text'
	| 'email'
	| 'phone'
	| 'number'
	| 'textarea'
	| 'dropdown'
	| 'checkbox'
	| 'radio'
	| 'date'
	| 'hidden';

export interface FormFieldOption {
	label: string;
	value: string;
}

export interface FormField {
	id: string;
	type: FormFieldType;
	label: string;
	placeholder?: string;
	required?: boolean;
	helpText?: string;
	defaultValue?: string;
	options?: FormFieldOption[];
}

export interface FormDefinition {
	id: string;
	name: string;
	slug: string;
	fields: FormField[];
	submitLabel: string;
	successMessage: string;
	createdAt: string;
	updatedAt: string;
}

export interface FormsLibrary {
	forms: FormDefinition[];
}

export type SubmissionStatus = 'unread' | 'read';

export interface FormSubmission {
	id: string;
	formId: string;
	formName: string;
	pageSlug?: string;
	submittedAt: string;
	ip?: string;
	values: Record<string, string | string[]>;
	status: SubmissionStatus;
}

export interface FormSubmissionsStore {
	submissions: FormSubmission[];
}
