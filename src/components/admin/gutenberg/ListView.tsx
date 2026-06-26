import { useMemo, useState } from 'react';
import { getBlockDefinition } from '../../../lib/blocks/registry';
import type { Block } from '../../../types/blocks';
import { flattenBlocks } from './utils/blockTree';

interface Props {
	blocks: Block[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	onMove: (blockId: string, targetParentId: string | null, targetIndex: number) => void;
	pageTitle: string;
}

export default function ListView({ blocks, selectedId, onSelect, onMove, pageTitle }: Props) {
	const [search, setSearch] = useState('');
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
	const [dragId, setDragId] = useState<string | null>(null);

	const flat = useMemo(() => flattenBlocks(blocks), [blocks]);

	const visible = useMemo(() => {
		if (!search.trim()) return flat;
		const q = search.toLowerCase();
		return flat.filter((node) => {
			const def = getBlockDefinition(node.block.type);
			return (
				def?.label.toLowerCase().includes(q) ||
				node.block.type.toLowerCase().includes(q)
			);
		});
	}, [flat, search]);

	const isHiddenByCollapse = (node: (typeof flat)[0]) => {
		for (let d = 0; d < node.depth; d++) {
			const ancestor = flat.find((n) => n.depth === d && node.path[d] === n.path[d] && n.depth < node.depth);
			if (ancestor && collapsed[ancestor.block.id]) return true;
		}
		return false;
	};

	const hasChildren = (id: string) => flat.some((n) => n.parentId === id);

	return (
		<div className="gb-list-view">
			<input
				type="search"
				className="gb-list-search"
				placeholder="Search blocks..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<div className="gb-list-tree">
				<button
					type="button"
					className={`gb-list-item gb-list-page ${selectedId === null ? 'is-selected' : ''}`}
					onClick={() => onSelect('__page__')}
					style={{ paddingLeft: 8 }}
				>
					<span className="gb-list-icon">📄</span>
					<span>{pageTitle || 'Page'}</span>
				</button>
				{visible.map((node) => {
					if (isHiddenByCollapse(node)) return null;
					const def = getBlockDefinition(node.block.type);
					const isCollapsed = collapsed[node.block.id];
					const child = hasChildren(node.block.id);
					return (
						<div
							key={node.block.id}
							className={`gb-list-item ${selectedId === node.block.id ? 'is-selected' : ''}`}
							style={{ paddingLeft: 8 + node.depth * 16 }}
							draggable
							onDragStart={() => setDragId(node.block.id)}
							onDragEnd={() => setDragId(null)}
							onDragOver={(e) => e.preventDefault()}
							onDrop={(e) => {
								e.preventDefault();
								if (dragId && dragId !== node.block.id) {
									onMove(dragId, node.parentId, node.index);
								}
								setDragId(null);
							}}
						>
							{child ? (
								<button
									type="button"
									className={`gb-list-chevron ${isCollapsed ? '' : 'open'}`}
									onClick={(e) => {
										e.stopPropagation();
										setCollapsed((prev) => ({ ...prev, [node.block.id]: !prev[node.block.id] }));
									}}
								>
									›
								</button>
							) : (
								<span className="gb-list-chevron-spacer" />
							)}
							<button type="button" className="gb-list-item-btn" onClick={() => onSelect(node.block.id)}>
								<span className="gb-list-icon">{def?.icon ?? '▢'}</span>
								<span>{def?.label ?? node.block.type}</span>
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
