import type { Block } from '../../../types/blocks';
import { getBlockAlign, getLinkTarget, type BlockAlign, type LinkTarget } from '../../../lib/blocks/typography';
import SpacingSettings from './SpacingSettings';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

export default function ButtonSettings({ block, onChange }: Props) {
	const align = getBlockAlign(block.props.align);
	const target = getLinkTarget(block.props.target);

	return (
		<div className="gb-settings-fields">
			<label>
				Button Text
				<input
					value={String(block.props.label ?? '')}
					onChange={(e) => onChange({ ...block, props: { ...block.props, label: e.target.value } })}
				/>
			</label>
			<label>
				Button URL
				<input
					value={String(block.props.href ?? '')}
					onChange={(e) => onChange({ ...block, props: { ...block.props, href: e.target.value } })}
				/>
			</label>
			<label>
				Alignment
				<select
					value={align}
					onChange={(e) => onChange({ ...block, props: { ...block.props, align: e.target.value as BlockAlign } })}
				>
					<option value="left">Left</option>
					<option value="center">Center</option>
					<option value="right">Right</option>
				</select>
			</label>
			<label>
				Link Target
				<select
					value={target}
					onChange={(e) => onChange({ ...block, props: { ...block.props, target: e.target.value as LinkTarget } })}
				>
					<option value="same">Same Tab</option>
					<option value="new">New Tab</option>
				</select>
			</label>
			<label>
				Style
				<select
					value={String(block.props.variant ?? 'primary')}
					onChange={(e) => onChange({ ...block, props: { ...block.props, variant: e.target.value } })}
				>
					<option value="primary">Primary</option>
					<option value="secondary">Secondary</option>
					<option value="outline">Outline</option>
					<option value="ghost">Ghost</option>
					<option value="danger">Danger</option>
				</select>
			</label>
			<SpacingSettings block={block} onChange={onChange} />
		</div>
	);
}
