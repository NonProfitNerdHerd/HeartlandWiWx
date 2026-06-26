import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { createBlock } from '../../../lib/blocks/registry';
import type { Block, EditorMode } from '../../../types/blocks';
import {
	duplicateBlock,
	findBlockLocation,
	insertBlockAt,
	moveBlockInTree,
	removeBlockFromTree,
	updateBlockInTree,
} from './utils/blockTree';
import CanvasBlock from './CanvasBlock';
import SlashMenu from './SlashMenu';

interface Props {
	blocks: Block[];
	onChange: (blocks: Block[]) => void;
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	structureMode: EditorMode;
	onOpenInserter: (afterId: string | null) => void;
	globalBlockOptions: { id: string; name: string }[];
	dragBlockType: string | null;
	onDragBlockType: (type: string | null) => void;
}

export default function EditorCanvas({
	blocks,
	onChange,
	selectedId,
	onSelect,
	structureMode,
	onOpenInserter,
	globalBlockOptions,
	dragBlockType,
	onDragBlockType,
}: Props) {
	const [insertIndicator, setInsertIndicator] = useState<{ parentId: string | null; index: number } | null>(null);
	const [slash, setSlash] = useState<{ blockId: string; query: string; rect: DOMRect } | null>(null);
	const canvasRef = useRef<HTMLDivElement>(null);

	const updateBlock = useCallback(
		(id: string, block: Block) => onChange(updateBlockInTree(blocks, id, () => block)),
		[blocks, onChange],
	);

	const removeBlock = useCallback(
		(id: string) => {
			onChange(removeBlockFromTree(blocks, id));
			if (selectedId === id) onSelect(null);
		},
		[blocks, onChange, onSelect, selectedId],
	);

	const duplicateBlockById = useCallback(
		(id: string) => {
			const loc = findBlockLocation(blocks, id);
			if (!loc) return;
			const dup = duplicateBlock(loc.blocks[loc.index]);
			onChange(insertBlockAt(blocks, loc.parentId, loc.index + 1, dup));
			onSelect(dup.id);
		},
		[blocks, onChange, onSelect],
	);

	const insertBlockType = useCallback(
		(type: string, parentId: string | null, index: number, replaceId?: string) => {
			let newBlock: Block;
			if (type.startsWith('global:')) {
				const blockId = type.slice(7);
				newBlock = createBlock('globalBlock', nanoid(8));
				newBlock.props = { blockId };
			} else {
				newBlock = createBlock(type, nanoid(8));
			}

			let next = blocks;
			if (replaceId) {
				const loc = findBlockLocation(blocks, replaceId);
				if (!loc) return;
				next = insertBlockAt(
					removeBlockFromTree(blocks, replaceId),
					loc.parentId,
					loc.index,
					newBlock,
				);
			} else {
				next = insertBlockAt(blocks, parentId, index, newBlock);
			}
			onChange(next);
			onSelect(newBlock.id);
			return newBlock;
		},
		[blocks, onChange, onSelect],
	);

	const insertAfter = useCallback(
		(afterId: string) => {
			const loc = findBlockLocation(blocks, afterId);
			if (!loc) return;
			insertBlockType('paragraph', loc.parentId, loc.index + 1);
		},
		[blocks, insertBlockType],
	);

	const handleDrop = useCallback(
		(targetId: string, position: 'before' | 'after', e: React.DragEvent) => {
			e.preventDefault();
			setInsertIndicator(null);

			const loc = findBlockLocation(blocks, targetId);
			if (!loc) return;

			const index = position === 'before' ? loc.index : loc.index + 1;

			if (dragBlockType) {
				insertBlockType(dragBlockType, loc.parentId, index);
				onDragBlockType(null);
				return;
			}

			const draggedId = e.dataTransfer.getData('text/block-id');
			if (draggedId) {
				onChange(moveBlockInTree(blocks, draggedId, loc.parentId, index));
			}
		},
		[blocks, dragBlockType, insertBlockType, onChange, onDragBlockType],
	);

	const handleSlashSelect = (type: string) => {
		if (!slash) return;
		insertBlockType(type, null, 0, slash.blockId);
		setSlash(null);
	};

	const renderBlockList = (blockList: Block[], parentId: string | null = null) => (
		<>
			{blockList.map((block, index) => (
				<div key={block.id} className="gb-block-wrapper">
					{insertIndicator?.parentId === parentId && insertIndicator.index === index && (
						<div className="gb-insert-indicator" />
					)}
					<div className="gb-inserter-between">
						<button
							type="button"
							className="gb-inserter-plus"
							onClick={() => onOpenInserter(block.id)}
							title="Add block"
						>
							+
						</button>
					</div>
					<CanvasBlock
						block={block}
						isSelected={selectedId === block.id}
						structureMode={structureMode}
						onSelect={onSelect}
						onChange={updateBlock}
						onRemove={removeBlock}
						onDuplicate={duplicateBlockById}
						onInsertAfter={() => onOpenInserter(block.id)}
						onEnterAfter={insertAfter}
						onSlash={(id, query, rect) => setSlash({ blockId: id, query, rect })}
						onSlashClose={() => setSlash(null)}
						onDragStart={(id, e) => {
							e.dataTransfer.setData('text/block-id', id);
							e.dataTransfer.effectAllowed = 'move';
						}}
						onDragOver={(id, position, e) => {
							e.preventDefault();
							const loc = findBlockLocation(blocks, id);
							if (!loc) return;
							const idx = position === 'before' ? loc.index : loc.index + 1;
							setInsertIndicator({ parentId: loc.parentId, index: idx });
						}}
						onDrop={handleDrop}
						globalBlockOptions={globalBlockOptions}
						renderChild={(child) => (
							<CanvasBlock
								key={child.id}
								block={child}
								isSelected={selectedId === child.id}
								structureMode={structureMode}
								onSelect={onSelect}
								onChange={(b) => onChange(updateBlockInTree(blocks, child.id, () => b))}
								onRemove={removeBlock}
								onDuplicate={duplicateBlockById}
								onInsertAfter={() => onOpenInserter(child.id)}
								onEnterAfter={() => insertAfter(child.id)}
								onSlash={(id, query, rect) => setSlash({ blockId: id, query, rect })}
								onSlashClose={() => setSlash(null)}
								onDragStart={(id, e) => e.dataTransfer.setData('text/block-id', id)}
								onDragOver={(id, position, e) => {
									e.preventDefault();
									const loc = findBlockLocation(blocks, id);
									if (!loc) return;
									setInsertIndicator({ parentId: loc.parentId, index: position === 'before' ? loc.index : loc.index + 1 });
								}}
								onDrop={handleDrop}
								globalBlockOptions={globalBlockOptions}
							/>
						)}
					/>
				</div>
			))}
			{insertIndicator?.parentId === parentId && insertIndicator.index === blockList.length && (
				<div className="gb-insert-indicator" />
			)}
			<div className="gb-inserter-between gb-inserter-end">
				<button type="button" className="gb-inserter-plus" onClick={() => onOpenInserter(null)} title="Add block">+</button>
			</div>
		</>
	);

	return (
		<div
			ref={canvasRef}
			className={`gb-canvas ${structureMode === 'structure' ? 'is-structure' : ''}`}
			onClick={() => onSelect(null)}
			onDragOver={(e) => {
				if (dragBlockType) {
					e.preventDefault();
					setInsertIndicator({ parentId: null, index: blocks.length });
				}
			}}
			onDrop={(e) => {
				e.preventDefault();
				if (dragBlockType) {
					insertBlockType(dragBlockType, null, blocks.length);
					onDragBlockType(null);
					setInsertIndicator(null);
				}
			}}
		>
			<div className="gb-canvas-inner cms-content">
				{blocks.length === 0 ? (
					<div className="gb-canvas-empty">
						<p>Start writing or type <kbd>/</kbd> to choose a block</p>
						<button type="button" className="gb-empty-add" onClick={() => onOpenInserter(null)}>+ Add block</button>
					</div>
				) : (
					renderBlockList(blocks)
				)}
			</div>
			{slash && (
				<SlashMenu
					query={slash.query}
					position={slash.rect}
					onSelect={handleSlashSelect}
					onClose={() => setSlash(null)}
				/>
			)}
		</div>
	);
}
