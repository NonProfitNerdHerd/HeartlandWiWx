import { useMemo, useState } from 'react';
import {
	BLOCK_DEFINITIONS,
	GUTENBERG_CATEGORIES,
	searchBlocks,
	type GutenbergCategory,
} from '../../../lib/blocks/registry';
import type { BlockDefinition } from '../../../types/blocks';

interface Props {
	onInsert: (type: string) => void;
	onDragStart: (type: string, e: React.DragEvent) => void;
	favorites: string[];
	recent: string[];
	onToggleFavorite: (type: string) => void;
	globalBlockOptions?: { id: string; name: string }[];
}

export default function BlockInserter({
	onInsert,
	onDragStart,
	favorites,
	recent,
	onToggleFavorite,
	globalBlockOptions = [],
}: Props) {
	const [search, setSearch] = useState('');
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

	const globalDefs: BlockDefinition[] = useMemo(
		() =>
			globalBlockOptions.map((g) => ({
				type: `global:${g.id}`,
				label: g.name,
				category: 'Global Blocks',
				icon: '⊕',
				description: 'Reusable global block synced across the site.',
				keywords: ['global', 'reusable'],
			})),
		[globalBlockOptions],
	);

	const allBlocks = useMemo(() => [...BLOCK_DEFINITIONS, ...globalDefs], [globalDefs]);

	const filtered = useMemo(() => {
		if (!search.trim()) return allBlocks;
		const q = search.toLowerCase();
		return allBlocks.filter(
			(b) =>
				b.label.toLowerCase().includes(q) ||
				b.type.toLowerCase().includes(q) ||
				b.description?.toLowerCase().includes(q) ||
				b.keywords?.some((k) => k.includes(q)),
		);
	}, [allBlocks, search]);

	const favoriteBlocks = useMemo(
		() => allBlocks.filter((b) => favorites.includes(b.type)),
		[allBlocks, favorites],
	);

	const recentBlocks = useMemo(
		() => recent.map((t) => allBlocks.find((b) => b.type === t)).filter(Boolean) as BlockDefinition[],
		[allBlocks, recent],
	);

	const toggleCategory = (cat: string) => {
		setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
	};

	const renderBlock = (block: BlockDefinition) => (
		<div
			key={block.type}
			className="gb-inserter-block"
			draggable
			onDragStart={(e) => onDragStart(block.type, e)}
			onClick={() => onInsert(block.type)}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === 'Enter' && onInsert(block.type)}
		>
			<span className="gb-inserter-block-icon">{block.icon}</span>
			<span className="gb-inserter-block-info">
				<span className="gb-inserter-block-name">{block.label}</span>
				<span className="gb-inserter-block-desc">{block.description}</span>
			</span>
			<button
				type="button"
				className={`gb-inserter-fav ${favorites.includes(block.type) ? 'is-fav' : ''}`}
				onClick={(e) => {
					e.stopPropagation();
					onToggleFavorite(block.type);
				}}
				title={favorites.includes(block.type) ? 'Remove from favorites' : 'Add to favorites'}
			>
				★
			</button>
		</div>
	);

	return (
		<div className="gb-inserter">
			<div className="gb-inserter-search-wrap">
				<input
					type="search"
					className="gb-inserter-search"
					placeholder="Search blocks..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					autoFocus
				/>
			</div>

			<div className="gb-inserter-scroll">
				{search.trim() ? (
					<div className="gb-inserter-section">
						<div className="gb-inserter-section-title">Results</div>
						{filtered.map(renderBlock)}
					</div>
				) : (
					<>
						{recentBlocks.length > 0 && (
							<div className="gb-inserter-section">
								<button type="button" className="gb-inserter-section-title" onClick={() => toggleCategory('__recent')}>
									<span className={`gb-chevron ${collapsed.__recent ? '' : 'open'}`}>›</span> Recently used
								</button>
								{!collapsed.__recent && recentBlocks.map(renderBlock)}
							</div>
						)}
						{favoriteBlocks.length > 0 && (
							<div className="gb-inserter-section">
								<button type="button" className="gb-inserter-section-title" onClick={() => toggleCategory('__favorites')}>
									<span className={`gb-chevron ${collapsed.__favorites ? '' : 'open'}`}>›</span> Favorites
								</button>
								{!collapsed.__favorites && favoriteBlocks.map(renderBlock)}
							</div>
						)}
						{GUTENBERG_CATEGORIES.map((cat) => {
							const blocks = filtered.filter((b) => b.category === cat);
							if (blocks.length === 0) return null;
							return (
								<div key={cat} className="gb-inserter-section">
									<button type="button" className="gb-inserter-section-title" onClick={() => toggleCategory(cat)}>
										<span className={`gb-chevron ${collapsed[cat] ? '' : 'open'}`}>›</span> {cat}
									</button>
									{!collapsed[cat] && blocks.map(renderBlock)}
								</div>
							);
						})}
					</>
				)}
			</div>
		</div>
	);
}
