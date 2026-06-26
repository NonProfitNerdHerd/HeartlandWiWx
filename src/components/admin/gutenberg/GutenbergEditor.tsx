import { useCallback, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { createBlock } from '../../../lib/blocks/registry';
import type { LeftSidebarTab, PageDocument, PreviewDevice, EditorMode } from '../../../types/blocks';
import {
	ensureParagraphIfEmpty,
	findBlockLocation,
	insertBlockAt,
	moveBlockInTree,
	updateBlockInTree,
} from './utils/blockTree';
import { useBlockPreferences } from './hooks/useBlockPreferences';
import { getDraftRecovery, getRevisions, useAutosave } from './hooks/useAutosave';
import LeftSidebar from './LeftSidebar';
import EditorCanvas from './EditorCanvas';
import RightSidebar from './RightSidebar';

interface Props {
	document: PageDocument;
	onDocumentChange: (doc: PageDocument) => void;
	slug: string;
	globalBlockOptions?: { id: string; name: string }[];
	device: PreviewDevice;
	onDeviceChange: (device: PreviewDevice) => void;
	structureMode: EditorMode;
	onStructureModeChange: (mode: EditorMode) => void;
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
}

export default function GutenbergEditor({
	document: doc,
	onDocumentChange,
	slug,
	globalBlockOptions = [],
	device,
	onDeviceChange,
	structureMode,
	onStructureModeChange,
	canUndo,
	canRedo,
	onUndo,
	onRedo,
}: Props) {
	const [leftTab, setLeftTab] = useState<LeftSidebarTab>('inserter');
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
	const [dragBlockType, setDragBlockType] = useState<string | null>(null);
	const [dirty, setDirty] = useState(false);
	const [recoveryPrompt, setRecoveryPrompt] = useState<{ savedAt: number; doc: PageDocument } | null>(null);

	const { favorites, recent, toggleFavorite, recordRecent } = useBlockPreferences();
	const { clearDraft } = useAutosave(slug, doc, dirty);

	const blocks = useMemo(() => ensureParagraphIfEmpty(doc.blocks), [doc.blocks]);

	useEffect(() => {
		const draft = getDraftRecovery(slug);
		if (draft && draft.savedAt > Date.now() - 7 * 24 * 60 * 60 * 1000) {
			setRecoveryPrompt(draft);
		}
	}, [slug]);

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
			onDocumentChange({ ...doc, meta });
		},
		[doc, onDocumentChange],
	);

	const insertBlock = useCallback(
		(type: string) => {
			recordRecent(type.startsWith('global:') ? 'globalBlock' : type);
			let newBlock;
			if (type.startsWith('global:')) {
				newBlock = createBlock('globalBlock', nanoid(8));
				newBlock.props = { blockId: type.slice(7) };
			} else {
				newBlock = createBlock(type, nanoid(8));
			}

			const parentId = null;
			let index: number;
			if (insertAfterId) {
				const loc = findBlockLocation(blocks, insertAfterId);
				index = loc ? loc.index + 1 : blocks.length;
			} else {
				index = blocks.length;
			}

			setBlocks(insertBlockAt(blocks, parentId, index, newBlock));
			setSelectedId(newBlock.id);
			setInsertAfterId(null);
		},
		[blocks, insertAfterId, recordRecent, setBlocks],
	);

	const handleOpenInserter = useCallback((afterId: string | null) => {
		setInsertAfterId(afterId);
		setLeftTab('inserter');
	}, []);

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

	return (
		<div className="gb-editor">
			{recoveryPrompt && (
				<div className="gb-recovery-banner">
					<span>A newer draft was found ({new Date(recoveryPrompt.savedAt).toLocaleString()}).</span>
					<button type="button" onClick={() => { onDocumentChange(recoveryPrompt.doc); setRecoveryPrompt(null); }}>Recover</button>
					<button type="button" onClick={() => setRecoveryPrompt(null)}>Dismiss</button>
				</div>
			)}

			<LeftSidebar
				tab={leftTab}
				onTabChange={setLeftTab}
				blocks={blocks}
				selectedId={selectedId}
				onSelectBlock={(id) => setSelectedId(id === '__page__' ? null : id)}
				onInsert={insertBlock}
				onDragStart={(type, e) => {
					setDragBlockType(type);
					e.dataTransfer.setData('text/block-type', type);
					e.dataTransfer.effectAllowed = 'copy';
				}}
				onMove={handleMove}
				pageTitle={doc.meta.title}
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
					onOpenInserter={handleOpenInserter}
					globalBlockOptions={globalBlockOptions}
					dragBlockType={dragBlockType}
					onDragBlockType={setDragBlockType}
				/>
			</main>

			<RightSidebar
				meta={doc.meta}
				onMetaChange={setMeta}
				blocks={blocks}
				selectedId={selectedId}
				onBlockChange={handleBlockChange}
				globalBlockOptions={globalBlockOptions}
				revisions={revisions}
				onRestoreRevision={restoreRevision}
			/>
		</div>
	);
}