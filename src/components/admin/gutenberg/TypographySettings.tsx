import type { Block } from '../../../types/blocks';
import {
	getFontSizePreset,
	getFontWeightPreset,
	getTextAlign,
	type FontSizePreset,
	type FontWeightPreset,
	type TextAlign,
} from '../../../lib/blocks/typography';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
	showHeadingLevel?: boolean;
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

function updateProp(block: Block, onChange: (b: Block) => void, key: string, value: unknown) {
	const props = { ...block.props };
	if (value === '' || value === undefined || value === null) delete props[key];
	else props[key] = value;
	onChange({ ...block, props });
}

export default function TypographySettings({ block, onChange, showHeadingLevel }: Props) {
	const align = getTextAlign(block.props.textAlign);
	const fontSize = getFontSizePreset(block.props.fontSize);
	const fontWeight = getFontWeightPreset(block.props.fontWeight);

	return (
		<div className="gb-settings-section">
			<h3 className="gb-settings-section-title">Typography</h3>
			<div className="gb-settings-fields">
				{showHeadingLevel ? (
					<label>
						Heading Level
						<select
							value={Number(block.props.level ?? 2)}
							onChange={(e) => {
								const level = Number(e.target.value);
								const text = (block.content ?? '').replace(/<[^>]+>/g, '').trim() || 'Heading';
								onChange({
									...block,
									props: { ...block.props, level },
									content: `<h${level}>${text}</h${level}>`,
								});
							}}
						>
							{[1, 2, 3, 4, 5, 6].map((l) => (
								<option key={l} value={l}>H{l}</option>
							))}
						</select>
					</label>
				) : null}
				<label>
					Text Alignment
					<select
						value={align}
						onChange={(e) => updateProp(block, onChange, 'textAlign', e.target.value as TextAlign)}
					>
						<option value="left">Left</option>
						<option value="center">Center</option>
						<option value="right">Right</option>
						<option value="justify">Justify</option>
					</select>
				</label>
				<label>
					Font Size
					<select
						value={fontSize}
						onChange={(e) => updateProp(block, onChange, 'fontSize', e.target.value as FontSizePreset)}
					>
						<option value="small">Small</option>
						<option value="medium">Medium</option>
						<option value="large">Large</option>
						<option value="xlarge">Extra Large</option>
						<option value="custom">Custom</option>
					</select>
				</label>
				{fontSize === 'custom' ? (
					<label>
						Custom Size (px)
						<input
							type="number"
							min={10}
							value={numProp(block.props.fontSizeCustom)}
							onChange={(e) => updateProp(block, onChange, 'fontSizeCustom', parseNum(e.target.value))}
						/>
					</label>
				) : null}
				<label>
					Font Weight
					<select
						value={fontWeight}
						onChange={(e) => updateProp(block, onChange, 'fontWeight', e.target.value as FontWeightPreset)}
					>
						<option value="normal">Normal</option>
						<option value="medium">Medium</option>
						<option value="semibold">Semi Bold</option>
						<option value="bold">Bold</option>
					</select>
				</label>
				<label>
					Text Color
					<input
						type="color"
						value={String(block.props.color || '#ffffff')}
						onChange={(e) => updateProp(block, onChange, 'color', e.target.value)}
					/>
				</label>
				<label>
					Background Color
					<input
						type="color"
						value={String(block.props.backgroundColor || '#000000')}
						onChange={(e) => updateProp(block, onChange, 'backgroundColor', e.target.value)}
					/>
				</label>
				<label>
					Line Height
					<input
						type="number"
						min={1}
						step={0.1}
						placeholder="1.6"
						value={numProp(block.props.lineHeight)}
						onChange={(e) => updateProp(block, onChange, 'lineHeight', parseNum(e.target.value))}
					/>
				</label>
				<label>
					Letter Spacing (px)
					<input
						type="number"
						step={0.5}
						placeholder="0"
						value={numProp(block.props.letterSpacing)}
						onChange={(e) => updateProp(block, onChange, 'letterSpacing', parseNum(e.target.value))}
					/>
				</label>
			</div>
			<h3 className="gb-settings-section-title">Spacing</h3>
			<div className="gb-settings-fields">
				<label>
					Top Margin (px)
					<input
						type="number"
						min={0}
						value={numProp(block.props.marginTop)}
						onChange={(e) => updateProp(block, onChange, 'marginTop', parseNum(e.target.value))}
					/>
				</label>
				<label>
					Bottom Margin (px)
					<input
						type="number"
						min={0}
						value={numProp(block.props.marginBottom)}
						onChange={(e) => updateProp(block, onChange, 'marginBottom', parseNum(e.target.value))}
					/>
				</label>
			</div>
		</div>
	);
}
