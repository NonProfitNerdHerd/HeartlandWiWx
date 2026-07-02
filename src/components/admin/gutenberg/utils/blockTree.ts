import { nanoid } from 'nanoid';
import { createBlock } from '../../../../lib/blocks/registry';
import type { Block, FlatBlockNode } from '../../../../types/blocks';

export function flattenBlocks(blocks: Block[], depth = 0, parentId: string | null = null, path: number[] = []): FlatBlockNode[] {
	const result: FlatBlockNode[] = [];
	blocks.forEach((block, index) => {
		const currentPath = [...path, index];
		result.push({ block, depth, parentId, index, path: currentPath });
		if (block.children?.length) {
			result.push(...flattenBlocks(block.children, depth + 1, block.id, currentPath));
		}
	});
	return result;
}

export function findBlockLocation(
	blocks: Block[],
	id: string,
	parentId: string | null = null,
	path: number[] = [],
): { blocks: Block[]; index: number; parentId: string | null; path: number[] } | null {
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		if (block.id === id) {
			return { blocks, index: i, parentId, path: [...path, i] };
		}
		if (block.children?.length) {
			const found = findBlockLocation(block.children, id, block.id, [...path, i]);
			if (found) return found;
		}
	}
	return null;
}

export function updateBlockInTree(blocks: Block[], id: string, updater: (block: Block) => Block): Block[] {
	return blocks.map((block) => {
		if (block.id === id) return updater(block);
		if (block.children?.length) {
			return { ...block, children: updateBlockInTree(block.children, id, updater) };
		}
		return block;
	});
}

export function removeBlockFromTree(blocks: Block[], id: string): Block[] {
	return blocks
		.filter((block) => block.id !== id)
		.map((block) => {
			if (block.children?.length) {
				return { ...block, children: removeBlockFromTree(block.children, id) };
			}
			return block;
		});
}

export function insertBlockAt(
	rootBlocks: Block[],
	parentId: string | null,
	index: number,
	newBlock: Block,
): Block[] {
	if (parentId === null) {
		const next = [...rootBlocks];
		next.splice(index, 0, newBlock);
		return next;
	}
	return rootBlocks.map((block) => {
		if (block.id === parentId) {
			const children = [...(block.children ?? [])];
			children.splice(index, 0, newBlock);
			return { ...block, children };
		}
		if (block.children?.length) {
			return { ...block, children: insertBlockAt(block.children, parentId, index, newBlock) };
		}
		return block;
	});
}

export function moveBlockInTree(
	rootBlocks: Block[],
	blockId: string,
	targetParentId: string | null,
	targetIndex: number,
): Block[] {
	const location = findBlockLocation(rootBlocks, blockId);
	if (!location) return rootBlocks;

	const block = location.blocks[location.index];
	let without = removeBlockFromTree(rootBlocks, blockId);

	if (targetParentId === location.parentId && targetIndex > location.index) {
		targetIndex -= 1;
	}

	return insertBlockAt(without, targetParentId, targetIndex, block);
}

export function duplicateBlock(block: Block): Block {
	const newId = nanoid(8);
	return {
		...structuredClone(block),
		id: newId,
		children: block.children?.map((child) => duplicateBlock(child)),
	};
}

export function getRootInsertIndex(blocks: Block[], afterBlockId: string | null): number {
	if (!afterBlockId) return blocks.length;
	const loc = findBlockLocation(blocks, afterBlockId);
	if (!loc || loc.parentId !== null) return blocks.length;
	return loc.index + 1;
}

export function ensureParagraphIfEmpty(blocks: Block[]): Block[] {
	if (blocks.length === 0) {
		return [createBlock('paragraph', nanoid(8))];
	}
	return blocks;
}
