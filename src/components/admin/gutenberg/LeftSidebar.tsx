import type { LeftSidebarTab } from '../../../types/blocks';
import BlockInserter from './BlockInserter';
import ListView from './ListView';
import type { Block } from '../../../types/blocks';

interface Props {
	tab: LeftSidebarTab;
	onTabChange: (tab: LeftSidebarTab) => void;
	blocks: Block[];
	selectedId: string | null;
	onSelectBlock: (id: string) => void;
	onInsert: (type: string) => void;
	onDragStart: (type: string, e: React.DragEvent) => void;
	onMove: (blockId: string, targetParentId: string | null, targetIndex: number) => void;
	pageTitle: string;
	favorites: string[];
	recent: string[];
	onToggleFavorite: (type: string) => void;
	globalBlockOptions?: { id: string; name: string }[];
}

export default function LeftSidebar({
	tab,
	onTabChange,
	blocks,
	selectedId,
	onSelectBlock,
	onInsert,
	onDragStart,
	onMove,
	pageTitle,
	favorites,
	recent,
	onToggleFavorite,
	globalBlockOptions,
}: Props) {
	return (
		<aside className="gb-left-sidebar">
			<div className="gb-left-tabs">
				<button
					type="button"
					className={tab === 'inserter' ? 'is-active' : ''}
					onClick={() => onTabChange('inserter')}
					title="Block Inserter"
				>
					<span className="gb-tab-icon">+</span>
					<span className="gb-tab-label">Blocks</span>
				</button>
				<button
					type="button"
					className={tab === 'list' ? 'is-active' : ''}
					onClick={() => onTabChange('list')}
					title="List View"
				>
					<span className="gb-tab-icon">☰</span>
					<span className="gb-tab-label">List</span>
				</button>
			</div>
			<div className="gb-left-content">
				{tab === 'inserter' ? (
					<BlockInserter
						onInsert={onInsert}
						onDragStart={onDragStart}
						favorites={favorites}
						recent={recent}
						onToggleFavorite={onToggleFavorite}
						globalBlockOptions={globalBlockOptions}
					/>
				) : (
					<ListView
						blocks={blocks}
						selectedId={selectedId}
						onSelect={onSelectBlock}
						onMove={onMove}
						pageTitle={pageTitle}
					/>
				)}
			</div>
		</aside>
	);
}
