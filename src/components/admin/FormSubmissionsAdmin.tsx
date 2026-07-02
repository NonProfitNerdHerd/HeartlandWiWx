import { useCallback, useEffect, useState } from 'react';
import type { FormSubmission } from '../../types/forms';

export default function FormSubmissionsAdmin() {
	const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
	const [sha, setSha] = useState<string | undefined>();
	const [formFilter, setFormFilter] = useState('');
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<FormSubmission | null>(null);
	const [message, setMessage] = useState('');

	const load = useCallback(async () => {
		const params = new URLSearchParams();
		if (formFilter) params.set('formId', formFilter);
		if (search) params.set('q', search);
		const res = await fetch(`/api/form-submissions?${params}`);
		const data = await res.json();
		setSubmissions(data.submissions ?? []);
		setSha(data.sha);
	}, [formFilter, search]);

	useEffect(() => {
		load();
	}, [load]);

	const formNames = [...new Map(submissions.map((s) => [s.formId, s.formName])).entries()];

	const updateStatus = async (id: string, status: 'read' | 'unread') => {
		await fetch(`/api/form-submissions/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status }),
		});
		await load();
		if (selected?.id === id) setSelected((s) => (s ? { ...s, status } : s));
	};

	const remove = async (id: string) => {
		if (!confirm('Delete this submission?')) return;
		await fetch(`/api/form-submissions/${id}`, { method: 'DELETE' });
		setMessage('Submission deleted.');
		if (selected?.id === id) setSelected(null);
		await load();
	};

	return (
		<div className="submissions-admin">
			<div className="forms-admin-header">
				<h1>Form Submissions</h1>
				<div className="admin-actions">
					<a className="admin-button-secondary" href={`/api/form-submissions/export${formFilter ? `?formId=${formFilter}` : ''}`}>Export CSV</a>
				</div>
			</div>
			{message ? <p className="admin-message success">{message}</p> : null}

			<div className="submissions-filters">
				<label>Filter by form
					<select value={formFilter} onChange={(e) => setFormFilter(e.target.value)}>
						<option value="">All forms</option>
						{formNames.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
					</select>
				</label>
				<label>Search
					<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search values…" />
				</label>
				<button type="button" className="admin-button-secondary" onClick={load}>Apply</button>
			</div>

			<div className="submissions-admin-layout">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Date</th>
							<th>Form</th>
							<th>Page</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{submissions.map((s) => (
							<tr key={s.id} className={selected?.id === s.id ? 'is-selected' : ''}>
								<td>{new Date(s.submittedAt).toLocaleString()}</td>
								<td>{s.formName}</td>
								<td>{s.pageSlug ?? '—'}</td>
								<td><span className={`submission-status is-${s.status}`}>{s.status}</span></td>
								<td>
									<button type="button" onClick={() => setSelected(s)}>View</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{selected ? (
					<aside className="submission-detail">
						<h2>Submission</h2>
						<p><strong>Form:</strong> {selected.formName}</p>
						<p><strong>Date:</strong> {new Date(selected.submittedAt).toLocaleString()}</p>
						{selected.pageSlug ? <p><strong>Page:</strong> {selected.pageSlug}</p> : null}
						{selected.ip ? <p><strong>IP:</strong> {selected.ip}</p> : null}
						<dl className="submission-values">
							{Object.entries(selected.values).map(([key, val]) => (
								<div key={key}>
									<dt>{key}</dt>
									<dd>{Array.isArray(val) ? val.join(', ') : String(val)}</dd>
								</div>
							))}
						</dl>
						<div className="admin-actions">
							{selected.status === 'unread' ? (
								<button type="button" className="admin-button-secondary" onClick={() => updateStatus(selected.id, 'read')}>Mark Read</button>
							) : (
								<button type="button" className="admin-button-secondary" onClick={() => updateStatus(selected.id, 'unread')}>Mark Unread</button>
							)}
							<button type="button" className="admin-button-secondary" onClick={() => remove(selected.id)}>Delete</button>
						</div>
					</aside>
				) : null}
			</div>
		</div>
	);
}
