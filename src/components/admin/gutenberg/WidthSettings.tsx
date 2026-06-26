import type { Block } from '../../../types/blocks';
import { BLOCK_WIDTHS, getBlockWidth } from '../../../lib/blocks/layout';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

const LABELS: Record<string, string> = {
	standard: 'Standard width',
	wide: 'Wide width',
	full: 'Full width',
};

export default function WidthSettings({ block, onChange }: Props) {
	const width = getBlockWidth(block.props.width);

	return (
		<label>
			Width
			<select
				value={width}
				onChange={(e) => onChange({ ...block, props: { ...block.props, width: e.target.value } })}
			>
				{BLOCK_WIDTHS.map((w) => (
					<option key={w} value={w}>{LABELS[w]}</option>
				))}
			</select>
		</label>
	);
}
