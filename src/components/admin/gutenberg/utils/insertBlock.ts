import { nanoid } from 'nanoid';
import { createBlock } from '../../../../lib/blocks/registry';
import type { Block } from '../../../../types/blocks';

export function makeBlockFromType(type: string): Block {
	if (type.startsWith('global:')) {
		const block = createBlock('globalBlock', nanoid(8));
		block.props = { blockId: type.slice(7) };
		return block;
	}
	return createBlock(type, nanoid(8));
}

export function normalizeRecentType(type: string): string {
	return type.startsWith('global:') ? 'globalBlock' : type;
}
