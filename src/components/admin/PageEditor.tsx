import { useCallback, useEffect, useMemo, useState } from 'react';
import { renderBlocks } from '../../lib/blocks/render';
import type { PageDocument, PreviewDevice } from '../../types/blocks';
import BlockListEditor from './BlockListEditor';
import MetadataPanel from './MetadataPanel';

interface Props {
	initialDocument: PageDocument;
	originalSlug: string;
	backUrl?: string;
	globalBlockOptions?: { id: string; name: string }[];
}

export default function PageEditor({ initialDocument, originalSlug, backUrl = '/admin/pages', globalBlockOptions = [] }: Props) {
	const [doc, setDoc] = useState<PageDocument>(initialDocument);
	const [device, setDevice] = useState<PreviewDevice>('desktop');
	const [previewOpen, setPreviewOpen] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [saving, setSaving] = useState(false);
	const [autoSaveStatus, setAutoSaveStatus] = useState('');

	const previewHtml = useMemo(() => renderBlocks(doc.blocks), [doc.blocks]);

	const save = useCallback(async (asDraft = false) => {
		setSaving(true);
		setMessage(null);
		const payload: PageDocument = {
			...doc,
			meta: {
				...doc.meta,
				draft: asDraft ? true : doc.meta.draft,
				published: asDraft ? false : doc.meta.published,
				seoTitle: doc.meta.seoTitle || doc.meta.title,
			},
		};

		const endpoint = originalSlug === 'new' ? '/api/pages/new' : `/api/pages/${encodeURIComponent(originalSlug)}`;
		try {
			const response = await fetch(endpoint, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || 'Save failed');
			setMessage({ type: 'success', text: asDraft ? 'Draft saved.' : 'Page saved. Vercel will redeploy shortly.' });
			if (result.slug && result.slug !== originalSlug && originalSlug === 'new') {
				window.location.href = `/admin/pages/${result.slug}`;
			}
		} catch (error) {
			setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Save failed' });
		} finally {
			setSaving(false);
		}
	}, [doc, originalSlug]);

	useEffect(() => {
		const timer = setInterval(() => {
			if (doc.meta.draft) {
				setAutoSaveStatus('Draft — auto-save on manual save');
			}
		}, 30000);
		return () => clearInterval(timer);
	}, [doc.meta.draft]);

	return (
		<div className="page-editor">
			<div className="page-editor-toolbar">
				<div className="page-editor-toolbar-left">
					<a href={backUrl} className="admin-button-secondary">← Back</a>
					<h1>{doc.meta.title || 'Untitled Page'}</h1>
				</div>
				<div className="page-editor-toolbar-right">
					<div className="device-toggle">
						<button type="button" className={device === 'phone' ? 'active' : ''} onClick={() => setDevice('phone')}>Phone</button>
						<button type="button" className={device === 'tablet' ? 'active' : ''} onClick={() => setDevice('tablet')}>Tablet</button>
						<button type="button" className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')}>Desktop</button>
					</div>
					<button type="button" className="admin-button-secondary" onClick={() => setPreviewOpen(!previewOpen)}>Preview</button>
					<button type="button" className="admin-button-secondary" onClick={() => save(true)} disabled={saving}>Save Draft</button>
					<button type="button" className="admin-button" onClick={() => save(false)} disabled={saving}>{saving ? 'Saving...' : 'Save & Publish'}</button>
				</div>
			</div>

			{message ? <div className={`admin-message ${message.type}`}>{message.text}</div> : null}
			{autoSaveStatus ? <p className="admin-help">{autoSaveStatus}</p> : null}

			<div className="page-editor-layout">
				<div className={`page-editor-canvas device-${device}`}>
					<BlockListEditor
						blocks={doc.blocks}
						onChange={(blocks) => setDoc((prev) => ({ ...prev, blocks }))}
						globalBlockOptions={globalBlockOptions}
					/>
				</div>
				<MetadataPanel meta={doc.meta} onChange={(meta) => setDoc((prev) => ({ ...prev, meta }))} />
			</div>

			{previewOpen ? (
				<div className="page-preview-modal" onClick={() => setPreviewOpen(false)}>
					<div className={`page-preview-frame device-${device}`} onClick={(e) => e.stopPropagation()}>
						<div className="cms-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
					</div>
				</div>
			) : null}
		</div>
	);
}
