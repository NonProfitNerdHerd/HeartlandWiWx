import {
	getColumnsCount,
	getColumnsLayoutStyle,
	isColumnsBlock,
	normalizeColumnsBlock,
} from '../../../lib/blocks/columns';
import { blockWidthClass, getBlockWidth } from '../../../lib/blocks/layout';
import type { Block, EditorMode } from '../../../types/blocks';

interface Props {
	block: Block;
	structureMode: EditorMode;
	isSelected: boolean;
	renderColumnBlocks: (column: Block) => React.ReactNode;
	onInsertInColumn: (columnId: string, index: number, anchor: DOMRect) => void;
}

export default function ColumnsCanvas({
	block,
	structureMode,
	isSelected,
	renderColumnBlocks,
	onInsertInColumn,
}: Props) {
	if (!isColumnsBlock(block.type)) return null;

	const normalized = normalizeColumnsBlock(block);
	const count = getColumnsCount(normalized);
	const layoutStyle = getColumnsLayoutStyle(normalized);
	const widthClass = blockWidthClass(getBlockWidth(normalized.props.width));
	const showOutline = isSelected || structureMode === 'structure';

	return (
		<div
			className={`gb-columns-layout block-columns block-columns-${count} ${widthClass} ${showOutline ? 'is-visible' : ''}`}
			style={layoutStyle}
		>
			{(normalized.children ?? []).map((column, colIndex) => (
				<div key={column.id} className="gb-column-cell" data-column-index={colIndex + 1}>
					{showOutline && <div className="gb-column-label">Column {colIndex + 1}</div>}
					<div className="gb-column-blocks">{renderColumnBlocks(column)}</div>
					<div className="gb-column-inserter">
						<button
							type="button"
							className="gb-inserter-plus gb-column-plus"
							onClick={(e) => {
								e.stopPropagation();
								const childCount = column.children?.length ?? 0;
								onInsertInColumn(column.id, childCount, e.currentTarget.getBoundingClientRect());
							}}
							title="Add block to column"
						>
							+
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
