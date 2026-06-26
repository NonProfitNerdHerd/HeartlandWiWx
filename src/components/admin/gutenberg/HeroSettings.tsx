import type { Block } from '../../../types/blocks';
import { clampFocus, getTextAlign, getVerticalAlign } from '../../../lib/blocks/layout';
import MediaPicker from './MediaPicker';
import SpacingSettings from './SpacingSettings';
import WidthSettings from './WidthSettings';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

export default function HeroSettings({ block, onChange }: Props) {
	const image = String(block.props.image ?? '');
	const align = getTextAlign(block.props.align);
	const valign = getVerticalAlign(block.props.valign);
	const focusX = clampFocus(block.props.imageFocusX);
	const focusY = clampFocus(block.props.imageFocusY);
	const showImage = block.type !== 'minimalHero';

	return (
		<div className="gb-settings-fields">
			<label>
				Title
				<input
					value={String(block.props.title ?? '')}
					onChange={(e) => onChange({ ...block, props: { ...block.props, title: e.target.value } })}
				/>
			</label>
			{block.type !== 'minimalHero' ? (
				<label>
					Subtitle
					<input
						value={String(block.props.subtitle ?? '')}
						onChange={(e) => onChange({ ...block, props: { ...block.props, subtitle: e.target.value } })}
					/>
				</label>
			) : null}
			<WidthSettings block={block} onChange={onChange} />
			<label>
				Text alignment
				<select
					value={align}
					onChange={(e) => onChange({ ...block, props: { ...block.props, align: e.target.value } })}
				>
					<option value="left">Left</option>
					<option value="center">Center</option>
					<option value="right">Right</option>
				</select>
			</label>
			<label>
				Vertical position
				<select
					value={valign}
					onChange={(e) => onChange({ ...block, props: { ...block.props, valign: e.target.value } })}
				>
					<option value="top">Top</option>
					<option value="middle">Middle</option>
					<option value="bottom">Bottom</option>
				</select>
			</label>
			{showImage ? (
				<>
					<MediaPicker
						label="Background image"
						value={image}
						onChange={(url) => onChange({ ...block, props: { ...block.props, image: url } })}
					/>
					{image ? (
						<div className="gb-settings-section">
							<h3 className="gb-settings-section-title">Image focus</h3>
							<label>
								Horizontal ({focusX}%)
								<input
									type="range"
									min={0}
									max={100}
									value={focusX}
									onChange={(e) =>
										onChange({ ...block, props: { ...block.props, imageFocusX: Number(e.target.value) } })
									}
								/>
							</label>
							<label>
								Vertical ({focusY}%)
								<input
									type="range"
									min={0}
									max={100}
									value={focusY}
									onChange={(e) =>
										onChange({ ...block, props: { ...block.props, imageFocusY: Number(e.target.value) } })
									}
								/>
							</label>
							{image ? (
								<div
									className="gb-hero-focus-preview"
									style={{
										backgroundImage: `url(${image})`,
										backgroundPosition: `${focusX}% ${focusY}%`,
									}}
								/>
							) : null}
						</div>
					) : null}
				</>
			) : null}
			<SpacingSettings block={block} onChange={onChange} />
		</div>
	);
}
