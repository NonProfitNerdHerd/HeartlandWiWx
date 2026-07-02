import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
	ContentType,
	EditorDocument,
	InsertContext,
	LeftSidebarTab,
	PreviewDevice,
	EditorMode,
} from '../../../types/blocks';
import {
	ensureParagraphIfEmpty,
	findBlockLocation,
	insertBlockAt,
	moveBlockInTree,
	removeBlockFromTree,
	updateBlockInTree,
} from './utils/blockTree';
import { makeBlockFromType, normalizeRecentType } from './utils/insertBlock';
import { useBlockPreferences } from './hooks/useBlockPreferences';
import { getDraftRecovery, getRevisions, useAutosave } from './hooks/useAutosave';
import LeftSidebar from './LeftSidebar';
import EditorCanvas from './EditorCanvas';
import RightSidebar from './RightSidebar';

interface Props {
	document: EditorDocument;
	onDocumentChange: (doc: EditorDocument) => void;
	contentType: ContentType;
	slug: string;
	globalBlockOptions?: { id: string; name: string }[];
	formOptions?: { id: string; name: string }[];
	device: PreviewDevice;
	structureMode: EditorMode;
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
}

export default function GutenbergEditor({
	document: doc,
	onDocumentChange,
	contentType,
	slug,
	globalBlockOptions = [],
	formOptions: formOptionsProp = [],
	device,
	structureMode,
	canUndo,
	canRedo,
	onUndo,
	onRedo,
}: Props) {
	const [leftTab, setLeftTab] = useState<LeftSidebarTab>('inserter');
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
	const [sidebarInsertIndex, setSidebarInsertIndex] = useState<number | null>(null);
	const [dragBlockType, setDragBlockType] = useState<string | null>(null);
	const [dirty, setDirty] = useState(false);
	const [formOptions, setFormOptions] = useState(formOptionsProp);
	const [recoveryPrompt, setRecoveryPrompt] = useState<{ savedAt: number; doc: EditorDocument } | null>(null);

	const { favorites, recent, toggleFavorite, recordRecent } = useBlockPreferences();
	useAutosave(slug, doc, dirty);

	const blocks = useMemo(() => ensureParagraphIfEmpty(doc.blocks), [doc.blocks]);

	useEffect(() => {
		if (formOptionsProp.length) {
			setFormOptions(formOptionsProp);
			return;
		}
		fetch('/api/forms')
			.then((r) => r.json())
			.then((data) => {
				const opts = (data.library?.forms ?? []).map((f: { id: string; name: string }) => ({
					id: f.id,
					name: f.name,
				}));
				setFormOptions(opts);
			})
			.catch(() => {});
	}, [formOptionsProp]);

	useEffect(() => {
		const draft = getDraftRecovery(slug);
		if (draft && draft.savedAt > Date.now() - 7 * 24 * 60 * 60 * 1000) {
			setRecoveryPrompt(draft);
		}
	}, [slug]);

	useEffect(() => {
		if (!focusBlockId) return;
		const timer = setTimeout(() => setFocusBlockId(null), 150);
		return () => clearTimeout(timer);
	}, [focusBlockId]);

	const setBlocks = useCallback(
		(nextBlocks: typeof blocks) => {
			setDirty(true);
			onDocumentChange({ ...doc, blocks: nextBlocks });
		},
		[doc, onDocumentChange],
	);

	const setMeta = useCallback(
		(meta: typeof doc.meta) => {
			setDirty(true);
			onDocumentChange({ ...doc, meta } as EditorDocument);
		},
		[doc, onDocumentChange],
	);

	const insertBlockAtContext = useCallback(
		(type: string, context: InsertContext) => {
			recordRecent(normalizeRecentType(type));
			const newBlock = makeBlockFromType(type);

			let next = blocks;
			if (context.replaceBlockId) {
				const loc = findBlockLocation(blocks, context.replaceBlockId);
				if (!loc) return;
				next = insertBlockAt(
					removeBlockFromTree(blocks, context.replaceBlockId),
					loc.parentId,
					loc.index,
					newBlock,
				);
			} else {
				next = insertBlockAt(blocks, context.parentId, context.index, newBlock);
			}

			setBlocks(next);
			setSelectedId(newBlock.id);
			setFocusBlockId(newBlock.id);
			setSidebarInsertIndex(null);
		},
		[blocks, recordRecent, setBlocks],
	);

	const insertFromSidebar = useCallback(
		(type: string) => {
			const index = sidebarInsertIndex ?? blocks.length;
			const rect = new DOMRect(window.innerWidth / 2, 200, 0, 0);
			insertBlockAtContext(type, { parentId: null, index, anchor: rect });
		},
		[blocks.length, insertBlockAtContext, sidebarInsertIndex],
	);

	const handleBlockChange = useCallback(
		(id: string, block: import('../../../types/blocks').Block) => {
			setBlocks(updateBlockInTree(blocks, id, () => block));
		},
		[blocks, setBlocks],
	);

	const handleMove = useCallback(
		(blockId: string, targetParentId: string | null, targetIndex: number) => {
			setBlocks(moveBlockInTree(blocks, blockId, targetParentId, targetIndex));
		},
		[blocks, setBlocks],
	);

	const revisions = useMemo(() => getRevisions(slug).map((r) => ({ timestamp: r.timestamp, label: r.label })), [slug]);

	const restoreRevision = useCallback(
		(timestamp: number) => {
			const rev = getRevisions(slug).find((r) => r.timestamp === timestamp);
			if (rev) {
				onDocumentChange(rev.document);
				setDirty(true);
			}
		},
		[onDocumentChange, slug],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
				e.preventDefault();
				if (e.shiftKey) onRedo();
				else onUndo();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onUndo, onRedo]);

	const contentLabel = contentType === 'post' ? 'Post' : 'Page';

	return (
		<>
			{recoveryPrompt && (
				<div className="gb-recovery-banner">
					<span>A newer draft was found ({new Date(recoveryPrompt.savedAt).toLocaleString()}).</span>
					<button type="button" onClick={() => { onDocumentChange(recoveryPrompt.doc); setRecoveryPrompt(null); }}>Recover</button>
					<button type="button" onClick={() => setRecoveryPrompt(null)}>Dismiss</button>
				</div>
			)}

			<div className="gb-editor">
			<LeftSidebar
				tab={leftTab}
				onTabChange={setLeftTab}
				blocks={blocks}
				selectedId={selectedId}
				onSelectBlock={(id) => setSelectedId(id === '__page__' ? null : id)}
				onInsert={insertFromSidebar}
				onDragStart={(type, e) => {
					setDragBlockType(type);
					e.dataTransfer.setData('text/block-type', type);
					e.dataTransfer.effectAllowed = 'copy';
				}}
				onMove={handleMove}
				pageTitle={doc.meta.title || contentLabel}
				favorites={favorites}
				recent={recent}
				onToggleFavorite={toggleFavorite}
				globalBlockOptions={globalBlockOptions}
			/>

			<main className={`gb-center device-${device}`}>
				<EditorCanvas
					blocks={blocks}
					onChange={setBlocks}
					selectedId={selectedId}
					onSelect={setSelectedId}
					structureMode={structureMode}
					onInsertBlock={insertBlockAtContext}
					focusBlockId={focusBlockId}
					onFocusBlock={setFocusBlockId}
					recent={recent}
					globalBlockOptions={globalBlockOptions}
					dragBlockType={dragBlockType}
					onDragBlockType={setDragBlockType}
				/>
			</main>

			<RightSidebar
				contentType={contentType}
				meta={doc.meta}
				onMetaChange={setMeta}
				blocks={blocks}
				selectedId={selectedId}
				onBlockChange={handleBlockChange}
				globalBlockOptions={globalBlockOptions}
				formOptions={formOptions}
				revisions={revisions}
				onRestoreRevision={restoreRevision}
			/>
			</div>
		</>
	);
}
