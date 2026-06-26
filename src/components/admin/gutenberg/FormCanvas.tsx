import { useEffect, useState } from 'react';
import type { FormDefinition } from '../../types/forms';

interface Props {
	formId: string;
}

export default function FormCanvas({ formId }: Props) {
	const [form, setForm] = useState<FormDefinition | null>(null);

	useEffect(() => {
		if (!formId) {
			setForm(null);
			return;
		}
		fetch('/api/forms')
			.then((r) => r.json())
			.then((data) => {
				const found = (data.library?.forms ?? []).find((f: FormDefinition) => f.id === formId);
				setForm(found ?? null);
			})
			.catch(() => setForm(null));
	}, [formId]);

	if (!formId) {
		return <div className="gb-canvas-placeholder">Select a form in the block settings panel.</div>;
	}

	if (!form) {
		return <div className="gb-canvas-placeholder">Loading form preview…</div>;
	}

	return (
		<div className="cms-form-wrap cms-form-preview">
			<p className="gb-canvas-form-label">Form: {form.name}</p>
			<div className="cms-form">
				{form.fields.filter((f) => f.type !== 'hidden').map((field) => (
					<label key={field.id} className="cms-form-field">
						<span className="cms-form-label">
							{field.label}
							{field.required ? ' *' : ''}
						</span>
						{field.type === 'textarea' ? (
							<textarea rows={3} placeholder={field.placeholder} disabled />
						) : field.type === 'dropdown' ? (
							<select disabled>
								{(field.options ?? []).map((o) => (
									<option key={o.value}>{o.label}</option>
								))}
							</select>
						) : (
							<input
								type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'phone' ? 'tel' : 'text'}
								placeholder={field.placeholder}
								disabled
							/>
						)}
						{field.helpText ? <span className="cms-form-help">{field.helpText}</span> : null}
					</label>
				))}
				<button type="button" className="btn btn-primary cms-form-submit" disabled>
					{form.submitLabel}
				</button>
			</div>
		</div>
	);
}
