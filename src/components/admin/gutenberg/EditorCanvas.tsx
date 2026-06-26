import { useCallback, useRef, useState } from 'react';
import type { Block, EditorMode, InsertContext } from '../../../types/blocks';
import {
	duplicateBlock,
	findBlockLocation,
	insertBlockAt,
	moveBlockInTree,
	removeBlockFromTree,
	updateBlockInTree,
} from './utils/blockTree';
import CanvasBlock from './CanvasBlock';
import BlockInserterPopover from './BlockInserterPopover';

interface Props {
	blocks: Block[];
	onChange: (blocks: Block[]) => void;
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	structureMode: EditorMode;
	onInsertBlock: (type: string, context: InsertContext) => void;
	focusBlockId: string | null;
	onFocusBlock: (id: string | null) => void;
	recent: string[];
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
	onInsertBlock,
	focusBlockId,
	onFocusBlock,
	recent,
	globalBlockOptions,
	dragBlockType,
	onDragBlockType,
}: Props) {
	const [insertIndicator, setInsertIndicator] = useState<{ parentId: string | null; index: number } | null>(null);
	const [popover, setPopover] = useState<InsertContext | null>(null);

	const closePopover = useCallback(() => setPopover(null), []);

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
			onFocusBlock(dup.id);
		},
		[blocks, onChange, onFocusBlock, onSelect],
	);

	const insertBlockType = useCallback(
		(type: string, parentId: string | null, index: number) => {
			const rect = canvasRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0);
			onInsertBlock(type, { parentId, index, anchor: rect });
		},
		[onInsertBlock],
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

	const handlePopoverSelect = (type: string) => {
		if (!popover) return;
		onInsertBlock(type, popover);
		closePopover();
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
							onClick={(e) => {
								e.stopPropagation();
								const rect = e.currentTarget.getBoundingClientRect();
								openPopover(parentId, index, rect);
							}}
							title="Add block"
						>
							+
						</button>
					</div>
					<CanvasBlock
						block={block}
						isSelected={selectedId === block.id}
						structureMode={structureMode}
						autoFocus={focusBlockId === block.id}
						onSelect={onSelect}
						onChange={updateBlock}
						onRemove={removeBlock}
						onDuplicate={duplicateBlockById}
						onEnterAfter={insertAfter}
						onSlash={(id, query, rect) => {
							const loc = findBlockLocation(blocks, id);
							if (!loc) return;
							openPopover(loc.parentId, loc.index, rect, id, query);
						}}
						onSlashClose={closePopover}
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
								autoFocus={focusBlockId === child.id}
								onSelect={onSelect}
								onChange={(b) => onChange(updateBlockInTree(blocks, child.id, () => b))}
								onRemove={removeBlock}
								onDuplicate={duplicateBlockById}
								onEnterAfter={() => insertAfter(child.id)}
								onSlash={(id, query, rect) => {
									const loc = findBlockLocation(blocks, id);
									if (!loc) return;
									openPopover(loc.parentId, loc.index, rect, id, query);
								}}
								onSlashClose={closePopover}
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
				<button
					type="button"
					className="gb-inserter-plus"
					onClick={(e) => {
						e.stopPropagation();
						const rect = e.currentTarget.getBoundingClientRect();
						openPopover(parentId, blockList.length, rect);
					}}
					title="Add block"
				>
					+
				</button>
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
						<button
							type="button"
							className="gb-empty-add"
							onClick={(e) => {
								const rect = e.currentTarget.getBoundingClientRect();
								openPopover(null, 0, rect);
							}}
						>
							+ Add block
						</button>
					</div>
				) : (
					renderBlockList(blocks)
				)}
			</div>
			{popover && (
				<BlockInserterPopover
					query={popover.query ?? ''}
					position={popover.anchor}
					recent={recent}
					onSelect={handlePopoverSelect}
					onClose={closePopover}
					autoFocusSearch={!popover.query}
				/>
			)}
		</div>
	);
}
