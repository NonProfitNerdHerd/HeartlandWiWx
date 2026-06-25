import { useState } from 'react';
import { nanoid } from 'nanoid';
import { BLOCK_CATEGORIES, BLOCK_DEFINITIONS, createBlock, getBlockDefinition } from '../../lib/blocks/registry';
import type { Block } from '../../types/blocks';
import RichTextEditor from './RichTextEditor';

interface Props {
	blocks: Block[];
	onChange: (blocks: Block[]) => void;
	globalBlockOptions?: { id: string; name: string }[];
}

const TEXT_BLOCKS = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'quote', 'codeBlock', 'alert', 'callout', 'card', 'featureCard', 'html', 'markdown']);

function BlockFields({
	block,
	onChange,
	globalBlockOptions,
}: {
	block: Block;
	onChange: (block: Block) => void;
	globalBlockOptions: { id: string; name: string }[];
}) {
	const def = getBlockDefinition(block.type);

	if (TEXT_BLOCKS.has(block.type)) {
		return (
			<RichTextEditor
				content={block.content ?? def?.defaultContent ?? ''}
				onChange={(html) => onChange({ ...block, content: html })}
				placeholder={`Edit ${def?.label ?? block.type}...`}
			/>
		);
	}

	if (block.type === 'button') {
		return (
			<div className="block-fields">
				<label>Label <input value={String(block.props.label ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, label: e.target.value } })} /></label>
				<label>Link <input value={String(block.props.href ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, href: e.target.value } })} /></label>
				<label>Style
					<select value={String(block.props.variant ?? 'primary')} onChange={(e) => onChange({ ...block, props: { ...block.props, variant: e.target.value } })}>
						<option value="primary">Primary</option>
						<option value="secondary">Secondary</option>
						<option value="outline">Outline</option>
						<option value="ghost">Ghost</option>
						<option value="danger">Danger</option>
					</select>
				</label>
			</div>
		);
	}

	if (block.type === 'image') {
		return (
			<div className="block-fields">
				<label>Image URL <input value={String(block.props.src ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, src: e.target.value } })} /></label>
				<label>Alt text <input value={String(block.props.alt ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, alt: e.target.value } })} /></label>
				<label>Caption <input value={String(block.props.caption ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, caption: e.target.value } })} /></label>
				{block.props.src ? <img src={String(block.props.src)} alt={String(block.props.alt ?? '')} className="block-preview-image" /> : null}
			</div>
		);
	}

	if (block.type === 'hero' || block.type === 'splitHero' || block.type === 'minimalHero') {
		return (
			<div className="block-fields">
				<label>Title <input value={String(block.props.title ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, title: e.target.value } })} /></label>
				<label>Subtitle <input value={String(block.props.subtitle ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, subtitle: e.target.value } })} /></label>
				<label>Background Image <input value={String(block.props.image ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, image: e.target.value } })} /></label>
			</div>
		);
	}

	if (block.type === 'ctaBanner') {
		return (
			<div className="block-fields">
				<label>Title <input value={String(block.props.title ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, title: e.target.value } })} /></label>
				<label>Button <input value={String(block.props.buttonLabel ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, buttonLabel: e.target.value } })} /></label>
				<label>Link <input value={String(block.props.href ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, href: e.target.value } })} /></label>
			</div>
		);
	}

	if (block.type === 'globalBlock') {
		return (
			<div className="block-fields">
				<label>Global Block
					<select value={String(block.props.blockId ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, blockId: e.target.value } })}>
						<option value="">Select...</option>
						{globalBlockOptions.map((opt) => (
							<option key={opt.id} value={opt.id}>{opt.name}</option>
						))}
					</select>
				</label>
			</div>
		);
	}

	if (block.type === 'embed' || block.type === 'video') {
		return (
			<div className="block-fields">
				<label>URL <input value={String(block.props.url ?? block.props.src ?? '')} onChange={(e) => onChange({ ...block, props: { ...block.props, url: e.target.value, src: e.target.value } })} /></label>
			</div>
		);
	}

	if (block.type === 'spacer') {
		return (
			<div className="block-fields">
				<label>Height (px) <input type="number" value={Number(block.props.height ?? 48)} onChange={(e) => onChange({ ...block, props: { ...block.props, height: Number(e.target.value) } })} /></label>
			</div>
		);
	}

	if (block.type === 'divider') {
		return <hr className="block-divider-preview" />;
	}

	return <p className="block-fields-hint">Block type: {block.type}. Use props in advanced mode or switch block type.</p>;
}

export default function BlockListEditor({ blocks, onChange, globalBlockOptions = [] }: Props) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickerCategory, setPickerCategory] = useState(BLOCK_CATEGORIES[0]);

	const updateBlock = (index: number, block: Block) => {
		const next = [...blocks];
		next[index] = block;
		onChange(next);
	};

	const removeBlock = (index: number) => onChange(blocks.filter((_, i) => i !== index));

	const moveBlock = (index: number, dir: -1 | 1) => {
		const next = [...blocks];
		const target = index + dir;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		onChange(next);
	};

	const addBlock = (type: string) => {
		onChange([...blocks, createBlock(type, nanoid(8))]);
		setPickerOpen(false);
	};

	return (
		<div className="block-list-editor">
			{blocks.map((block, index) => {
				const def = getBlockDefinition(block.type);
				return (
					<div key={block.id} className="block-card">
						<div className="block-card-header">
							<span className="block-card-type">{def?.icon} {def?.label ?? block.type}</span>
							<div className="block-card-actions">
								<button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0}>↑</button>
								<button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}>↓</button>
								<button type="button" onClick={() => removeBlock(index)} className="danger">✕</button>
							</div>
						</div>
						<BlockFields block={block} onChange={(b) => updateBlock(index, b)} globalBlockOptions={globalBlockOptions} />
					</div>
				);
			})}

			<div className="block-picker-wrap">
				<button type="button" className="admin-button" onClick={() => setPickerOpen(!pickerOpen)}>+ Add Block</button>
				{pickerOpen ? (
					<div className="block-picker">
						<div className="block-picker-categories">
							{BLOCK_CATEGORIES.map((cat) => (
								<button key={cat} type="button" className={pickerCategory === cat ? 'active' : ''} onClick={() => setPickerCategory(cat)}>{cat}</button>
							))}
						</div>
						<div className="block-picker-grid">
							{BLOCK_DEFINITIONS.filter((b) => b.category === pickerCategory).map((b) => (
								<button key={b.type} type="button" className="block-picker-item" onClick={() => addBlock(b.type)}>
									<span>{b.icon}</span>
									{b.label}
								</button>
							))}
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
