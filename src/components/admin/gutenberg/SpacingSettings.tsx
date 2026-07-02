import type { Block } from '../../../types/blocks';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

function numProp(value: unknown): string {
	if (value === undefined || value === null || value === '') return '';
	return String(value);
}

function parseNum(value: string): number | '' {
	if (value.trim() === '') return '';
	const n = Number(value);
	return Number.isFinite(n) ? n : '';
}

export default function SpacingSettings({ block, onChange }: Props) {
	const update = (key: string, value: number | '') => {
		const props = { ...block.props };
		if (value === '') delete props[key];
		else props[key] = value;
		onChange({ ...block, props });
	};

	return (
		<div className="gb-settings-section">
			<h3 className="gb-settings-section-title">Spacing</h3>
			<div className="gb-settings-fields">
				<label>
					Margin (px)
					<input
						type="number"
						min={0}
						placeholder="0"
						value={numProp(block.props.margin)}
						onChange={(e) => update('margin', parseNum(e.target.value))}
					/>
				</label>
				<label>
					Padding (px)
					<input
						type="number"
						min={0}
						placeholder="0"
						value={numProp(block.props.padding)}
						onChange={(e) => update('padding', parseNum(e.target.value))}
					/>
				</label>
			</div>
		</div>
	);
}
