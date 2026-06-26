import { useCallback, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { createFormDefinition } from '../../lib/forms-utils';
import type { FormDefinition, FormField, FormFieldType, FormsLibrary } from '../../types/forms';

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
	{ value: 'text', label: 'Text' },
	{ value: 'email', label: 'Email' },
	{ value: 'phone', label: 'Phone' },
	{ value: 'number', label: 'Number' },
	{ value: 'textarea', label: 'Textarea' },
	{ value: 'dropdown', label: 'Dropdown' },
	{ value: 'checkbox', label: 'Checkbox' },
	{ value: 'radio', label: 'Radio Buttons' },
	{ value: 'date', label: 'Date Picker' },
	{ value: 'hidden', label: 'Hidden Field' },
];

function createField(type: FormFieldType = 'text'): FormField {
	return {
		id: nanoid(8),
		type,
		label: 'New Field',
		placeholder: '',
		required: false,
		helpText: '',
		options: type === 'dropdown' || type === 'radio' || type === 'checkbox' ? [{ label: 'Option 1', value: 'option-1' }] : undefined,
	};
}

function contactTemplate(): FormDefinition {
	const form = createFormDefinition('Contact Us');
	form.fields = [
		{ ...createField('text'), id: 'name', label: 'Name', required: true },
		{ ...createField('email'), id: 'email', label: 'Email', required: true },
		{ ...createField('phone'), id: 'phone', label: 'Phone' },
		{ ...createField('textarea'), id: 'message', label: 'Message', required: true },
	];
	return form;
}

export default function FormBuilder() {
	const [library, setLibrary] = useState<FormsLibrary>({ forms: [] });
	const [sha, setSha] = useState<string | undefined>();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [message, setMessage] = useState('');
	const [saving, setSaving] = useState(false);

	const selected = library.forms.find((f) => f.id === selectedId) ?? null;

	const load = useCallback(async () => {
		const res = await fetch('/api/forms');
		const data = await res.json();
		setLibrary(data.library);
		setSha(data.sha);
		if (!selectedId && data.library.forms.length) {
			setSelectedId(data.library.forms[0].id);
		}
	}, [selectedId]);

	useEffect(() => {
		load();
	}, []);

	const save = async () => {
		setSaving(true);
		setMessage('');
		try {
			const res = await fetch('/api/forms', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ library, sha }),
			});
			if (!res.ok) throw new Error('Save failed');
			setMessage('Forms saved.');
			await load();
		} catch {
			setMessage('Save failed.');
		} finally {
			setSaving(false);
		}
	};

	const updateSelected = (patch: Partial<FormDefinition>) => {
		if (!selected) return;
		setLibrary({
			forms: library.forms.map((f) =>
				f.id === selected.id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f,
			),
		});
	};

	const updateField = (fieldId: string, patch: Partial<FormField>) => {
		if (!selected) return;
		updateSelected({
			fields: selected.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
		});
	};

	const moveField = (index: number, dir: -1 | 1) => {
		if (!selected) return;
		const next = [...selected.fields];
		const target = index + dir;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		updateSelected({ fields: next });
	};

	return (
		<div className="forms-admin">
			<div className="forms-admin-header">
				<h1>Forms</h1>
				<div className="admin-actions">
					<button type="button" className="admin-button-secondary" onClick={() => {
						const form = createFormDefinition('New Form');
						setLibrary({ forms: [...library.forms, form] });
						setSelectedId(form.id);
					}}>Create Form</button>
					<button type="button" className="admin-button-secondary" onClick={() => {
						const form = contactTemplate();
						setLibrary({ forms: [...library.forms, form] });
						setSelectedId(form.id);
					}}>Contact Template</button>
					<button type="button" className="admin-button" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
				</div>
			</div>
			{message ? <p className="admin-message success">{message}</p> : null}

			<div className="forms-admin-layout">
				<aside className="forms-admin-list">
					{library.forms.map((form) => (
						<div key={form.id} className={`forms-admin-list-item ${selectedId === form.id ? 'is-active' : ''}`}>
							<button type="button" onClick={() => setSelectedId(form.id)}>{form.name}</button>
							<div className="forms-admin-list-actions">
								<button type="button" title="Duplicate" onClick={() => {
									const dup = { ...structuredClone(form), id: nanoid(10), name: `${form.name} Copy`, updatedAt: new Date().toISOString() };
									setLibrary({ forms: [...library.forms, dup] });
									setSelectedId(dup.id);
								}}>⧉</button>
								<button type="button" title="Delete" onClick={() => {
									if (!confirm(`Delete "${form.name}"?`)) return;
									setLibrary({ forms: library.forms.filter((f) => f.id !== form.id) });
									if (selectedId === form.id) setSelectedId(null);
								}}>🗑</button>
							</div>
						</div>
					))}
					{library.forms.length === 0 ? <p className="admin-help">No forms yet. Create one to get started.</p> : null}
				</aside>

				{selected ? (
					<div className="forms-admin-editor">
						<label>Form Name<input value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })} /></label>
						<label>Submit Button<input value={selected.submitLabel} onChange={(e) => updateSelected({ submitLabel: e.target.value })} /></label>
						<label>Success Message<textarea rows={2} value={selected.successMessage} onChange={(e) => updateSelected({ successMessage: e.target.value })} /></label>

						<div className="forms-admin-fields-header">
							<h2>Fields</h2>
							<select defaultValue="" onChange={(e) => {
								if (!e.target.value) return;
								updateSelected({ fields: [...selected.fields, createField(e.target.value as FormFieldType)] });
								e.target.value = '';
							}}>
								<option value="">+ Add field…</option>
								{FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
							</select>
						</div>

						{selected.fields.map((field, index) => (
							<div key={field.id} className="forms-admin-field-card">
								<div className="forms-admin-field-toolbar">
									<strong>{field.label}</strong>
									<span className="forms-admin-field-type">{field.type}</span>
									<button type="button" disabled={index === 0} onClick={() => moveField(index, -1)}>↑</button>
									<button type="button" disabled={index === selected.fields.length - 1} onClick={() => moveField(index, 1)}>↓</button>
									<button type="button" onClick={() => updateSelected({ fields: selected.fields.filter((f) => f.id !== field.id) })}>Remove</button>
								</div>
								<div className="forms-admin-field-grid">
									<label>Label<input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} /></label>
									<label>Field ID<input value={field.id} onChange={(e) => updateField(field.id, { id: e.target.value })} /></label>
									<label>Placeholder<input value={field.placeholder ?? ''} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} /></label>
									<label className="gb-checkbox"><input type="checkbox" checked={!!field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} /> Required</label>
									<label>Help Text<input value={field.helpText ?? ''} onChange={(e) => updateField(field.id, { helpText: e.target.value })} /></label>
									<label>Default Value<input value={field.defaultValue ?? ''} onChange={(e) => updateField(field.id, { defaultValue: e.target.value })} /></label>
								</div>
								{(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
									<label>Options (one per line: Label|value)
										<textarea
											rows={3}
											value={(field.options ?? []).map((o) => `${o.label}|${o.value}`).join('\n')}
											onChange={(e) => {
												const options = e.target.value.split('\n').filter(Boolean).map((line) => {
													const [label, value] = line.split('|');
													return { label: (label ?? '').trim(), value: (value ?? label ?? '').trim() };
												});
												updateField(field.id, { options });
											}}
										/>
									</label>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="admin-help">Select or create a form to edit its fields.</p>
				)}
			</div>
		</div>
	);
}
