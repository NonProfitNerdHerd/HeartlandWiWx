import { memo, useState } from 'react';
import { getBlockDefinition, getColumnCount } from '../../../lib/blocks/registry';
import type { Block, EditorMode } from '../../../types/blocks';
import InlineRichText from './InlineRichText';

const TEXT_BLOCKS = new Set([
	'paragraph', 'heading', 'bulletList', 'orderedList', 'quote', 'codeBlock',
	'alert', 'callout', 'card', 'featureCard', 'html', 'markdown',
]);

const LAYOUT_WITH_CHILDREN = new Set([
	'container', 'oneColumn', 'twoColumns', 'threeColumns', 'fourColumns',
	'cardGrid', 'tabs', 'accordion', 'stickySection',
]);

interface Props {
	block: Block;
	isSelected: boolean;
	structureMode: EditorMode;
	onSelect: (id: string) => void;
	onChange: (block: Block) => void;
	onRemove: (id: string) => void;
	onDuplicate: (id: string) => void;
	onInsertAfter: (afterId: string) => void;
	onEnterAfter: (afterId: string) => void;
	onSlash: (blockId: string, query: string, rect: DOMRect) => void;
	onSlashClose: () => void;
	onDragStart: (id: string, e: React.DragEvent) => void;
	onDragOver: (id: string, position: 'before' | 'after', e: React.DragEvent) => void;
	onDrop: (targetId: string, position: 'before' | 'after', e: React.DragEvent) => void;
	renderChild?: (child: Block, index: number) => React.ReactNode;
	globalBlockOptions: { id: string; name: string }[];
}

function CanvasBlockInner({
	block,
	isSelected,
	structureMode,
	onSelect,
	onChange,
	onRemove,
	onDuplicate,
	onInsertAfter,
	onEnterAfter,
	onSlash,
	onSlashClose,
	onDragStart,
	onDragOver,
	onDrop,
	renderChild,
	globalBlockOptions,
}: Props) {
	const [menuOpen, setMenuOpen] = useState(false);
	const def = getBlockDefinition(block.type);
	const showChrome = isSelected || structureMode === 'structure';

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onSelect(block.id);
	};

	const renderContent = () => {
		if (TEXT_BLOCKS.has(block.type)) {
			return (
				<InlineRichText
					content={block.content ?? def?.defaultContent ?? '<p></p>'}
					onChange={(html) => onChange({ ...block, content: html })}
					onEnter={() => onEnterAfter(block.id)}
					onSlash={(q, rect) => onSlash(block.id, q, rect)}
					onSlashClose={onSlashClose}
					onFocus={() => onSelect(block.id)}
					placeholder={block.type === 'heading' ? 'Heading' : 'Type / to choose a block'}
					className={`gb-block-${block.type}`}
				/>
			);
		}

		if (block.type === 'button') {
			const variant = String(block.props.variant ?? 'primary');
			return (
				<a className={`btn btn-${variant} gb-canvas-button`} href={String(block.props.href ?? '#')} onClick={(e) => e.preventDefault()}>
					{String(block.props.label ?? 'Button')}
				</a>
			);
		}

		if (block.type === 'image') {
			const src = String(block.props.src ?? '');
			if (!src) {
				return <div className="gb-canvas-placeholder">Click settings to add an image, or drag one in.</div>;
			}
			return (
				<figure className="block-image">
					<img src={src} alt={String(block.props.alt ?? '')} />
					{block.props.caption ? <figcaption>{String(block.props.caption)}</figcaption> : null}
				</figure>
			);
		}

		if (block.type === 'hero' || block.type === 'splitHero' || block.type === 'minimalHero') {
			const image = String(block.props.image ?? '');
			return (
				<section
					className={`block-hero gb-canvas-hero ${block.type}`}
					style={image ? { backgroundImage: `url(${image})` } : undefined}
				>
					<div className="block-hero-inner">
						<h1 contentEditable suppressContentEditableWarning onBlur={(e) => onChange({ ...block, props: { ...block.props, title: e.currentTarget.textContent ?? '' } })}>
							{String(block.props.title ?? 'Hero Title')}
						</h1>
						{(block.type !== 'minimalHero') && (
							<p contentEditable suppressContentEditableWarning onBlur={(e) => onChange({ ...block, props: { ...block.props, subtitle: e.currentTarget.textContent ?? '' } })}>
								{String(block.props.subtitle ?? '')}
							</p>
						)}
					</div>
				</section>
			);
		}

		if (block.type === 'ctaBanner') {
			return (
				<section className="block-cta gb-canvas-cta">
					<h2>{String(block.props.title ?? 'Call to action')}</h2>
					<a className="btn btn-primary" href={String(block.props.href ?? '/')} onClick={(e) => e.preventDefault()}>
						{String(block.props.buttonLabel ?? 'Learn more')}
					</a>
				</section>
			);
		}

		if (block.type === 'divider') {
			return <hr className="block-divider" />;
		}

		if (block.type === 'spacer') {
			return <div className="block-spacer" style={{ height: Number(block.props.height ?? 48) }} aria-hidden="true" />;
		}

		if (block.type === 'globalBlock') {
			const name = globalBlockOptions.find((g) => g.id === block.props.blockId)?.name ?? 'Global Block';
			return <div className="gb-canvas-global">⊕ {name || 'Select a global block'}</div>;
		}

		if (block.type === 'embed' || block.type === 'video') {
			const url = String(block.props.url ?? block.props.src ?? '');
			if (!url) return <div className="gb-canvas-placeholder">Add a {block.type} URL in settings</div>;
			return <div className="gb-canvas-embed">{block.type}: {url}</div>;
		}

		if (LAYOUT_WITH_CHILDREN.has(block.type)) {
			const colCount = getColumnCount(block.type);
			const className = colCount > 0 ? `block-columns block-columns-${colCount}` : 'block-container';
			return (
				<div className={className}>
					{(block.children ?? []).map((child, i) =>
						renderChild ? renderChild(child, i) : (
							<div key={child.id} className="block-column">{child.type}</div>
						),
					)}
				</div>
			);
		}

		return <div className="gb-canvas-placeholder">{def?.label ?? block.type}</div>;
	};

	return (
		<div
			className={`gb-canvas-block ${showChrome ? 'is-visible' : ''} ${isSelected ? 'is-selected' : ''} ${structureMode === 'structure' ? 'is-structure' : ''}`}
			data-block-id={block.id}
			data-block-type={block.type}
			onClick={handleClick}
			onDragOver={(e) => {
				e.preventDefault();
				const rect = e.currentTarget.getBoundingClientRect();
				const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
				onDragOver(block.id, position, e);
			}}
			onDrop={(e) => {
				e.preventDefault();
				const rect = e.currentTarget.getBoundingClientRect();
				const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
				onDrop(block.id, position, e);
			}}
		>
			{showChrome && (
				<div className="gb-block-toolbar">
					<button type="button" className="gb-drag-handle" draggable onDragStart={(e) => onDragStart(block.id, e)} title="Drag">⠿</button>
					<span className="gb-block-type-label">{def?.icon} {def?.label}</span>
					<div className="gb-block-toolbar-actions">
						<button type="button" onClick={() => onDuplicate(block.id)} title="Duplicate">⧉</button>
						<button type="button" onClick={() => setMenuOpen(!menuOpen)} title="Options">⋮</button>
						<button type="button" onClick={() => onRemove(block.id)} title="Delete" className="danger">🗑</button>
					</div>
					{menuOpen && (
						<div className="gb-block-menu">
							<button type="button" onClick={() => { onDuplicate(block.id); setMenuOpen(false); }}>Duplicate</button>
							<button type="button" onClick={() => { onRemove(block.id); setMenuOpen(false); }}>Delete</button>
						</div>
					)}
				</div>
			)}
			<div className="gb-block-content cms-content">{renderContent()}</div>
		</div>
	);
}

const CanvasBlock = memo(CanvasBlockInner);
export default CanvasBlock;
