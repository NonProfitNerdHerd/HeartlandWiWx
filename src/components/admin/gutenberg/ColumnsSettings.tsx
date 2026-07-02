import type { Block } from '../../../types/blocks';
import { getColumnsCount, getColumnGap, resizeColumnsBlock } from '../../../lib/blocks/columns';
import SpacingSettings from './SpacingSettings';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

export default function ColumnsSettings({ block, onChange }: Props) {
	const count = getColumnsCount(block);
	const gap = getColumnGap(block);

	return (
		<div className="gb-settings-fields">
			<label>
				Columns
				<select
					value={count}
					onChange={(e) => onChange(resizeColumnsBlock(block, Number(e.target.value)))}
				>
					<option value={2}>2 columns</option>
					<option value={3}>3 columns</option>
					<option value={4}>4 columns</option>
				</select>
			</label>
			<label>
				Column gap (px)
				<input
					type="number"
					min={0}
					value={gap}
					onChange={(e) =>
						onChange({ ...block, props: { ...block.props, gap: Number(e.target.value) || 0 } })
					}
				/>
			</label>
			<SpacingSettings block={block} onChange={onChange} />
		</div>
	);
}
