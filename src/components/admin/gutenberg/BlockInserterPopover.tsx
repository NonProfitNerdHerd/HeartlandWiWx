import { useEffect, useMemo, useRef, useState } from 'react';
import {
	BLOCK_DEFINITIONS,
	COMMON_BLOCK_TYPES,
	searchBlocks,
} from '../../../lib/blocks/registry';
import type { BlockDefinition } from '../../../types/blocks';

interface DisplaySection {
	title: string;
	blocks: BlockDefinition[];
}

interface Props {
	query?: string;
	position: DOMRect | null;
	recent: string[];
	onSelect: (type: string) => void;
	onClose: () => void;
	autoFocusSearch?: boolean;
}

export default function BlockInserterPopover({
	query: externalQuery = '',
	position,
	recent,
	onSelect,
	onClose,
	autoFocusSearch = true,
}: Props) {
	const menuRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const [search, setSearch] = useState(externalQuery);
	const [highlighted, setHighlighted] = useState(0);

	useEffect(() => {
		setSearch(externalQuery);
		setHighlighted(0);
	}, [externalQuery]);

	useEffect(() => {
		if (autoFocusSearch) {
			searchRef.current?.focus();
			if (externalQuery) {
				searchRef.current?.setSelectionRange(externalQuery.length, externalQuery.length);
			}
		}
	}, [autoFocusSearch, externalQuery]);

	const allDefs = useMemo(() => {
		const map = new Map(BLOCK_DEFINITIONS.map((b) => [b.type, b]));
		return { map, list: BLOCK_DEFINITIONS };
	}, []);

	const recentBlocks = useMemo(
		() => recent.map((t) => allDefs.map.get(t)).filter((b): b is BlockDefinition => Boolean(b)),
		[allDefs.map, recent],
	);

	const commonBlocks = useMemo(
		() =>
			COMMON_BLOCK_TYPES.map((t) => allDefs.map.get(t)).filter(
				(b): b is BlockDefinition => Boolean(b) && !recent.includes(b.type),
			),
		[allDefs.map, recent],
	);

	const sections: DisplaySection[] = useMemo(() => {
		const q = search.trim();
		if (q) {
			return [{ title: 'Results', blocks: searchBlocks(q) }];
		}
		const recentSet = new Set(recent);
		const commonSet = new Set(COMMON_BLOCK_TYPES);
		const other = allDefs.list.filter((b) => !recentSet.has(b.type) && !commonSet.has(b.type as (typeof COMMON_BLOCK_TYPES)[number]));
		const result: DisplaySection[] = [];
		if (recentBlocks.length > 0) result.push({ title: 'Recently used', blocks: recentBlocks });
		if (commonBlocks.length > 0) result.push({ title: 'Common blocks', blocks: commonBlocks });
		result.push({ title: 'All blocks', blocks: other });
		return result;
	}, [allDefs.list, commonBlocks, recent, recentBlocks, search]);

	const flatList = useMemo(() => sections.flatMap((s) => s.blocks), [sections]);

	useEffect(() => {
		setHighlighted(0);
	}, [flatList.length, search]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
				return;
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setHighlighted((h) => Math.min(h + 1, flatList.length - 1));
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				setHighlighted((h) => Math.max(h - 1, 0));
				return;
			}
			if (e.key === 'Enter' && flatList[highlighted]) {
				e.preventDefault();
				onSelect(flatList[highlighted].type);
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [flatList, highlighted, onClose, onSelect]);

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
		};
		document.addEventListener('mousedown', onClick);
		return () => document.removeEventListener('mousedown', onClick);
	}, [onClose]);

	if (!position) return null;

	const style: React.CSSProperties = {
		position: 'fixed',
		top: position.bottom + 4,
		left: Math.max(8, position.left),
		zIndex: 200,
	};

	let itemIndex = 0;

	return (
		<div ref={menuRef} className="gb-inserter-popover" style={style} role="listbox">
			<div className="gb-inserter-popover-search-wrap">
				<input
					ref={searchRef}
					type="search"
					className="gb-inserter-popover-search"
					placeholder="Search blocks..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>
			<div className="gb-inserter-popover-scroll">
				{flatList.length === 0 ? (
					<div className="gb-inserter-popover-empty">No blocks found</div>
				) : (
					sections.map((section) => (
						<div key={section.title} className="gb-inserter-popover-section">
							<div className="gb-inserter-popover-section-title">{section.title}</div>
							{section.blocks.map((block) => {
								const idx = itemIndex++;
								return (
									<button
										key={block.type}
										type="button"
										className={`gb-inserter-popover-item ${idx === highlighted ? 'is-highlighted' : ''}`}
										onMouseEnter={() => setHighlighted(idx)}
										onClick={() => onSelect(block.type)}
									>
										<span className="gb-inserter-popover-icon">{block.icon}</span>
										<span className="gb-inserter-popover-text">
											<strong>{block.label}</strong>
											<small>{block.description}</small>
										</span>
									</button>
								);
							})}
						</div>
					))
				)}
			</div>
		</div>
	);
}
