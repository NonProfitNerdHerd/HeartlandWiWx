import type { ReactNode } from 'react';
import { getBlockDefinition } from '../../../lib/blocks/registry';
import { isColumnsBlock } from '../../../lib/blocks/columns';
import type { Block } from '../../../types/blocks';
import ButtonSettings from './ButtonSettings';
import CardSettings from './CardSettings';
import ColumnsSettings from './ColumnsSettings';
import FormBlockSettings from './FormBlockSettings';
import HeadingSettings from './HeadingSettings';
import HeroSettings from './HeroSettings';
import ParagraphSettings from './ParagraphSettings';
import SpacingSettings from './SpacingSettings';
import MediaPicker from './MediaPicker';

const RICH_TEXT_BLOCKS = new Set([
	'bulletList', 'orderedList', 'quote', 'codeBlock',
	'alert', 'callout', 'featureCard', 'html', 'markdown',
]);

interface Props {
	block: Block;
	onChange: (block: Block) => void;
	globalBlockOptions: { id: string; name: string }[];
	formOptions?: { id: string; name: string }[];
}

function withSpacing(content: ReactNode, block: Block, onChange: (block: Block) => void) {
	if (isColumnsBlock(block.type)) {
		return (
			<>
				{content}
				<ColumnsSettings block={block} onChange={onChange} />
			</>
		);
	}
	return (
		<>
			{content}
			<SpacingSettings block={block} onChange={onChange} />
		</>
	);
}

export default function BlockSettings({ block, onChange, globalBlockOptions, formOptions = [] }: Props) {
	const def = getBlockDefinition(block.type);

	if (block.type === 'paragraph') {
		return <ParagraphSettings block={block} onChange={onChange} />;
	}

	if (block.type === 'heading') {
		return <HeadingSettings block={block} onChange={onChange} />;
	}

	if (block.type === 'button') {
		return <ButtonSettings block={block} onChange={onChange} />;
	}

	if (block.type === 'card') {
		return <CardSettings block={block} onChange={onChange} />;
	}

	if (block.type === 'form') {
		return <FormBlockSettings block={block} onChange={onChange} formOptions={formOptions} />;
	}

	if (block.type === 'image') {
		return withSpacing(
			<div className="gb-settings-fields">
				<MediaPicker label="Image" value={String(block.props.src ?? '')} onChange={(url) => onChange({ ...block, props: { ...block.props, src: url } })} />
				<label>Alt text <input value={String(block.props.alt ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, alt: e.target.value } })} /></label>
				<label>Caption <input value={String(block.props.caption ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, caption: e.target.value } })} /></label>
			</div>,
			block,
			onChange,
		);
	}

	if (block.type === 'hero' || block.type === 'splitHero' || block.type === 'minimalHero') {
		return <HeroSettings block={block} onChange={onChange} />;
	}

	if (block.type === 'ctaBanner') {
		return withSpacing(
			<div className="gb-settings-fields">
				<label>Title <input value={String(block.props.title ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, title: e.target.value } })} /></label>
				<label>Button <input value={String(block.props.buttonLabel ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, buttonLabel: e.target.value } })} /></label>
				<label>Link <input value={String(block.props.href ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, href: e.target.value } })} /></label>
			</div>,
			block,
			onChange,
		);
	}

	if (block.type === 'globalBlock') {
		return withSpacing(
			<div className="gb-settings-fields">
				<label>Global Block
					<select value={String(block.props.blockId ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, blockId: e.target.value } })}>
						<option value="">Select...</option>
						{globalBlockOptions.map((opt) => (
							<option key={opt.id} value={opt.id}>{opt.name}</option>
						))}
					</select>
				</label>
			</div>,
			block,
			onChange,
		);
	}

	if (block.type === 'embed' || block.type === 'video') {
		return withSpacing(
			<div className="gb-settings-fields">
				<label>URL <input value={String(block.props.url ?? block.props.src ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, url: e.target.value, src: e.target.value } })} /></label>
			</div>,
			block,
			onChange,
		);
	}

	if (block.type === 'spacer') {
		return withSpacing(
			<div className="gb-settings-fields">
				<label>Height (px) <input type="number" value={Number(block.props.height ?? 48)} onChange={(e) => onChange({ ...block, props: { ...block.props, height: Number(e.target.value) } })} /></label>
			</div>,
			block,
			onChange,
		);
	}

	if (isColumnsBlock(block.type)) {
		return <ColumnsSettings block={block} onChange={onChange} />;
	}

	if (RICH_TEXT_BLOCKS.has(block.type)) {
		return withSpacing(
			<p className="gb-settings-hint">Edit content directly on the canvas. Use the floating toolbar for formatting.</p>,
			block,
			onChange,
		);
	}

	return withSpacing(
		<p className="gb-settings-hint">
			{def?.label ?? block.type} block. Configure available options above or edit on canvas.
		</p>,
		block,
		onChange,
	);
}
