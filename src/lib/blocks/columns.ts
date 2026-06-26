import { nanoid } from 'nanoid';
import type { Block } from '../../types/blocks';
import { createBlock } from './registry';

export const COLUMN_BLOCK_TYPES = new Set(['twoColumns', 'threeColumns', 'fourColumns', 'columns']);

const TYPE_BY_COUNT: Record<number, string> = {
	2: 'twoColumns',
	3: 'threeColumns',
	4: 'fourColumns',
};

export function isColumnsBlock(type: string): boolean {
	return COLUMN_BLOCK_TYPES.has(type);
}

export function getColumnsCount(block: Block): number {
	if (typeof block.props.columns === 'number') return block.props.columns as number;
	if (block.type === 'twoColumns') return 2;
	if (block.type === 'threeColumns') return 3;
	if (block.type === 'fourColumns') return 4;
	if (block.type === 'columns') return Number(block.props.columns ?? 2);
	return 0;
}

export function createColumnWrapper(id: string): Block {
	return {
		id,
		type: 'column',
		props: {},
		children: [createBlock('paragraph', `${id}-p`)],
	};
}

/** Normalize legacy single-block-per-column data into column wrappers. */
export function normalizeColumnsBlock(block: Block): Block {
	if (!isColumnsBlock(block.type)) return block;

	const count = getColumnsCount(block);
	const raw = block.children ?? [];
	const columns: Block[] = [];

	for (let i = 0; i < count; i++) {
		const child = raw[i];
		if (!child) {
			columns.push(createColumnWrapper(`${block.id}-col-${i}-${nanoid(4)}`));
		} else if (child.type === 'column') {
			columns.push({
				...child,
				children: child.children?.length ? child.children : [createBlock('paragraph', nanoid(8))],
			});
		} else {
			columns.push({
				id: `${block.id}-col-${i}`,
				type: 'column',
				props: {},
				children: [child],
			});
		}
	}

	return { ...block, children: columns };
}

export function resizeColumnsBlock(block: Block, newCount: number): Block {
	const count = Math.min(4, Math.max(2, newCount));
	const normalized = normalizeColumnsBlock(block);
	const columns = [...(normalized.children ?? [])];

	while (columns.length < count) {
		columns.push(createColumnWrapper(`${block.id}-col-${columns.length}-${nanoid(4)}`));
	}

	return {
		...normalized,
		type: TYPE_BY_COUNT[count] ?? 'twoColumns',
		props: { ...normalized.props, columns: count },
		children: columns.slice(0, count),
	};
}

export function getColumnGap(block: Block): number {
	return Number(block.props.gap ?? 24);
}

export function getBlockSpacingStyle(props: Record<string, unknown>): Record<string, string> {
	const style: Record<string, string> = {};
	const margin = props.margin;
	const padding = props.padding;
	if (margin !== undefined && margin !== '' && margin !== null) {
		style.margin = typeof margin === 'number' ? `${margin}px` : String(margin);
	}
	if (padding !== undefined && padding !== '' && padding !== null) {
		style.padding = typeof padding === 'number' ? `${padding}px` : String(padding);
	}
	return style;
}

export function getColumnsLayoutStyle(block: Block): Record<string, string> {
	return {
		gap: `${getColumnGap(block)}px`,
	};
}

export function spacingStyleAttr(props: Record<string, unknown>): string {
	const parts: string[] = [];
	const margin = props.margin;
	const padding = props.padding;
	if (margin !== undefined && margin !== '' && margin !== null) {
		parts.push(`margin:${typeof margin === 'number' ? `${margin}px` : margin}`);
	}
	if (padding !== undefined && padding !== '' && padding !== null) {
		parts.push(`padding:${typeof padding === 'number' ? `${padding}px` : padding}`);
	}
	return parts.join(';');
}
