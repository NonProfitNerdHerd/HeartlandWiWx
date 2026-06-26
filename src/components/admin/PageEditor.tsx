import { useCallback, useEffect, useState } from 'react';
import type { PageDocument, PreviewDevice, EditorMode } from '../../types/blocks';
import GutenbergEditor from './gutenberg/GutenbergEditor';
import { useEditorHistory } from './gutenberg/hooks/useEditorHistory';
import { saveManualRevision } from './gutenberg/hooks/useAutosave';

interface Props {
	initialDocument: PageDocument;
	originalSlug: string;
	backUrl?: string;
	globalBlockOptions?: { id: string; name: string }[];
}

export default function PageEditor({ initialDocument, originalSlug, backUrl = '/admin/pages', globalBlockOptions = [] }: Props) {
	const { state: doc, setState: setDoc, undo, redo, canUndo, canRedo } = useEditorHistory(initialDocument);
	const [device, setDevice] = useState<PreviewDevice>('desktop');
	const [structureMode, setStructureMode] = useState<EditorMode>('edit');
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [saving, setSaving] = useState(false);
	const [autoSaveLabel, setAutoSaveLabel] = useState('');

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
			saveManualRevision(originalSlug === 'new' ? doc.meta.slug : originalSlug, payload);
			setMessage({ type: 'success', text: asDraft ? 'Draft saved.' : 'Page saved. Vercel will redeploy shortly.' });
			setAutoSaveLabel(`Saved ${new Date().toLocaleTimeString()}`);
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
			setAutoSaveLabel((prev) => prev || 'Changes auto-save locally while you edit');
		}, 30000);
		return () => clearInterval(timer);
	}, []);

	const slug = originalSlug === 'new' ? doc.meta.slug || 'new' : originalSlug;

	return (
		<div className="gb-page-editor">
			<header className="gb-header">
				<div className="gb-header-left">
					<a href={backUrl} className="gb-header-back">← Back</a>
					<h1 className="gb-header-title">{doc.meta.title || 'Untitled'}</h1>
					{autoSaveLabel ? <span className="gb-header-status">{autoSaveLabel}</span> : null}
				</div>
				<div className="gb-header-center">
					<button type="button" className="gb-header-btn" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">↶</button>
					<button type="button" className="gb-header-btn" onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">↷</button>
					<span className="gb-header-sep" />
					<button
						type="button"
						className={`gb-header-btn ${structureMode === 'edit' ? 'is-active' : ''}`}
						onClick={() => setStructureMode('edit')}
						title="Edit mode"
					>
						Edit
					</button>
					<button
						type="button"
						className={`gb-header-btn ${structureMode === 'structure' ? 'is-active' : ''}`}
						onClick={() => setStructureMode('structure')}
						title="Structure mode"
					>
						Structure
					</button>
				</div>
				<div className="gb-header-right">
					<div className="gb-device-toggle">
						<button type="button" className={device === 'desktop' ? 'is-active' : ''} onClick={() => setDevice('desktop')} title="Desktop">🖥</button>
						<button type="button" className={device === 'tablet' ? 'is-active' : ''} onClick={() => setDevice('tablet')} title="Tablet">📱</button>
						<button type="button" className={device === 'phone' ? 'is-active' : ''} onClick={() => setDevice('phone')} title="Phone">📲</button>
					</div>
					<button type="button" className="gb-btn-secondary" onClick={() => save(true)} disabled={saving}>Save Draft</button>
					<button type="button" className="gb-btn-primary" onClick={() => save(false)} disabled={saving}>
						{saving ? 'Saving…' : 'Save'}
					</button>
				</div>
			</header>

			{message ? <div className={`gb-message gb-message-${message.type}`}>{message.text}</div> : null}

			<GutenbergEditor
				document={doc}
				onDocumentChange={setDoc}
				slug={slug}
				globalBlockOptions={globalBlockOptions}
				device={device}
				onDeviceChange={setDevice}
				structureMode={structureMode}
				onStructureModeChange={setStructureMode}
				canUndo={canUndo}
				canRedo={canRedo}
				onUndo={undo}
				onRedo={redo}
			/>
		</div>
	);
}
