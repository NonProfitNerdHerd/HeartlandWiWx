import type { Block } from '../../../types/blocks';
import {
	CARD_STYLES,
	getCardShadow,
	getCardStyle,
	getImageStyle,
	normalizeCardBlock,
	type CardShadow,
} from '../../../lib/blocks/card';
import { getBlockAlign, getLinkTarget, type BlockAlign, type LinkTarget } from '../../../lib/blocks/typography';
import MediaPicker from './MediaPicker';
import SpacingSettings from './SpacingSettings';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

export default function CardSettings({ block, onChange }: Props) {
	const normalized = normalizeCardBlock(block);
	const props = normalized.props;
	const cardStyle = getCardStyle(props.cardStyle);

	const update = (patch: Record<string, unknown>) => {
		onChange({ ...normalized, props: { ...props, ...patch } });
	};

	return (
		<div className="gb-settings-fields">
			<label>
				Card Style
				<select
					value={cardStyle}
					onChange={(e) => update({ cardStyle: e.target.value })}
				>
					{CARD_STYLES.map((s) => (
						<option key={s.id} value={s.id}>{s.label}</option>
					))}
				</select>
			</label>
			<label>
				Title
				<input value={String(props.title ?? '')} onChange={(e) => update({ title: e.target.value })} />
			</label>
			<label>
				Subtitle
				<input value={String(props.subtitle ?? '')} onChange={(e) => update({ subtitle: e.target.value })} />
			</label>
			<MediaPicker label="Card image" value={String(props.image ?? '')} onChange={(url) => update({ image: url })} />
			<label>
				Text
				<textarea
					rows={4}
					value={String(props.text ?? '')}
					onChange={(e) => update({ text: e.target.value })}
				/>
			</label>
			<label>
				Button Text
				<input value={String(props.buttonText ?? '')} onChange={(e) => update({ buttonText: e.target.value })} />
			</label>
			<label>
				Button URL
				<input value={String(props.buttonUrl ?? '')} onChange={(e) => update({ buttonUrl: e.target.value })} />
			</label>
			<label>
				Button Target
				<select
					value={getLinkTarget(props.buttonTarget)}
					onChange={(e) => update({ buttonTarget: e.target.value as LinkTarget })}
				>
					<option value="same">Same Tab</option>
					<option value="new">New Tab</option>
				</select>
			</label>
			<label>
				Image Style
				<select
					value={getImageStyle(props.imageStyle)}
					onChange={(e) => update({ imageStyle: e.target.value })}
				>
					<option value="square">Square</option>
					<option value="rounded">Rounded Corners</option>
					<option value="circle">Circle</option>
				</select>
			</label>
			<label>
				Title Alignment
				<select
					value={getBlockAlign(props.titleAlign)}
					onChange={(e) => update({ titleAlign: e.target.value as BlockAlign })}
				>
					<option value="left">Left</option>
					<option value="center">Center</option>
					<option value="right">Right</option>
				</select>
			</label>
			<label>
				Text Alignment
				<select
					value={getBlockAlign(props.textAlign)}
					onChange={(e) => update({ textAlign: e.target.value as BlockAlign })}
				>
					<option value="left">Left</option>
					<option value="center">Center</option>
					<option value="right">Right</option>
				</select>
			</label>
			<label>
				Button Alignment
				<select
					value={String(props.buttonAlign ?? 'left')}
					onChange={(e) => update({ buttonAlign: e.target.value })}
				>
					<option value="left">Left</option>
					<option value="center">Center</option>
					<option value="right">Right</option>
					<option value="full">Full Width</option>
				</select>
			</label>
			<label>
				Internal Padding (px)
				<input
					type="number"
					min={0}
					value={Number(props.padding ?? 24)}
					onChange={(e) => update({ padding: Number(e.target.value) })}
				/>
			</label>
			<label>
				Border Radius (px)
				<input
					type="number"
					min={0}
					value={Number(props.borderRadius ?? 8)}
					onChange={(e) => update({ borderRadius: Number(e.target.value) })}
				/>
			</label>
			<label>
				Shadow
				<select
					value={getCardShadow(props.shadow)}
					onChange={(e) => update({ shadow: e.target.value as CardShadow })}
				>
					<option value="none">None</option>
					<option value="small">Small</option>
					<option value="medium">Medium</option>
					<option value="large">Large</option>
				</select>
			</label>
			<SpacingSettings block={normalized} onChange={onChange} />
		</div>
	);
}
