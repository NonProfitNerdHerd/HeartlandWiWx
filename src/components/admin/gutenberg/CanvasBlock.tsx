import { memo, useEffect, useState } from 'react';
import { getBlockDefinition } from '../../../lib/blocks/registry';
import { getBlockSpacingStyle, isColumnsBlock, normalizeColumnsBlock } from '../../../lib/blocks/columns';
import {
	blockWidthClass,
	getBlockWidth,
	getTextAlign,
	getVerticalAlign,
	heroBackgroundPosition,
} from '../../../lib/blocks/layout';
import { typographyStyleObject } from '../../../lib/blocks/typography';
import type { Block, EditorMode } from '../../../types/blocks';
import InlineRichText from './InlineRichText';
import ColumnsCanvas from './ColumnsCanvas';
import CardCanvas from './CardCanvas';
import FormCanvas from './FormCanvas';

const TEXT_BLOCKS = new Set([
	'paragraph', 'heading', 'bulletList', 'orderedList', 'quote', 'codeBlock',
	'alert', 'callout', 'featureCard', 'html', 'markdown',
]);

const LAYOUT_WITH_CHILDREN = new Set([
	'container', 'oneColumn', 'twoColumns', 'threeColumns', 'fourColumns',
	'cardGrid', 'tabs', 'accordion', 'stickySection',
]);

interface Props {
	block: Block;
	isSelected: boolean;
	structureMode: EditorMode;
	autoFocus?: boolean;
	onSelect: (id: string) => void;
	onChange: (block: Block) => void;
	onRemove: (id: string) => void;
	onDuplicate: (id: string) => void;
	onEnterAfter: (afterId: string) => void;
	onSlash: (blockId: string, query: string, rect: DOMRect) => void;
	onSlashClose: () => void;
	onDragStart: (id: string, e: React.DragEvent) => void;
	onDragOver: (id: string, position: 'before' | 'after', e: React.DragEvent) => void;
	onDrop: (targetId: string, position: 'before' | 'after', e: React.DragEvent) => void;
	renderBlockList?: (blockList: Block[], parentId: string | null) => React.ReactNode;
	onInsertInColumn?: (columnId: string, index: number, anchor: DOMRect) => void;
	globalBlockOptions: { id: string; name: string }[];
}

function CanvasBlockInner({
	block,
	isSelected,
	structureMode,
	autoFocus = false,
	onSelect,
	onChange,
	onRemove,
	onDuplicate,
	onEnterAfter,
	onSlash,
	onSlashClose,
	onDragStart,
	onDragOver,
	onDrop,
	renderBlockList,
	onInsertInColumn,
	globalBlockOptions,
}: Props) {
	const [menuOpen, setMenuOpen] = useState(false);
	const def = getBlockDefinition(block.type);
	const showChrome = isSelected || structureMode === 'structure';

	useEffect(() => {
		if (!isColumnsBlock(block.type)) return;
		const needsNormalize = block.children?.some((c) => c.type !== 'column');
		if (needsNormalize) {
			onChange(normalizeColumnsBlock(block));
		}
	}, [block.id]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onSelect(block.id);
	};

	const renderContent = () => {
		if (block.type === 'paragraph' || block.type === 'heading') {
			return (
				<div className={`gb-typography-wrap gb-block-${block.type}`} style={typographyStyleObject(block.props)}>
					<InlineRichText
						content={block.content ?? def?.defaultContent ?? (block.type === 'heading' ? '<h2>Heading</h2>' : '<p></p>')}
						onChange={(html) => onChange({ ...block, content: html })}
						onEnter={() => onEnterAfter(block.id)}
						onSlash={(q, rect) => onSlash(block.id, q, rect)}
						onSlashClose={onSlashClose}
						onFocus={() => onSelect(block.id)}
						placeholder={block.type === 'heading' ? 'Heading' : 'Type / to choose a block'}
						className={`gb-block-${block.type}`}
						autoFocus={autoFocus}
					/>
				</div>
			);
		}

		if (block.type === 'card') {
			return <CardCanvas block={block} />;
		}

		if (block.type === 'form') {
			return <FormCanvas formId={String(block.props.formId ?? '')} />;
		}

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
					autoFocus={autoFocus}
				/>
			);
		}

		if (block.type === 'button') {
			const variant = String(block.props.variant ?? 'primary');
			const align = String(block.props.align ?? 'left');
			const target = block.props.target === 'new' ? '_blank' : undefined;
			const rel = target ? 'noopener noreferrer' : undefined;
			return (
				<div className={`block-button-wrap block-button-align-${align}`}>
					<a
						className={`btn btn-${variant} gb-canvas-button`}
						href={String(block.props.href ?? '#')}
						target={target}
						rel={rel}
						onClick={(e) => e.preventDefault()}
					>
						{String(block.props.label ?? 'Button')}
					</a>
				</div>
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
			const align = getTextAlign(block.props.align);
			const valign = getVerticalAlign(block.props.valign);
			const focusX = Number(block.props.imageFocusX ?? 50);
			const focusY = Number(block.props.imageFocusY ?? 50);
			const heroStyle: React.CSSProperties = {
				...(image ? { backgroundImage: `url(${image})` } : {}),
				backgroundPosition: heroBackgroundPosition(focusX, focusY),
			};

			if (block.type === 'splitHero' && image) {
				return (
					<section className={`block-hero gb-canvas-hero splitHero block-hero-align-${align} block-hero-valign-${valign}`}>
						<div className="block-hero-split-image" style={{ backgroundImage: `url(${image})`, backgroundPosition: heroBackgroundPosition(focusX, focusY) }} />
						<div className="block-hero-inner">
							<h1 contentEditable suppressContentEditableWarning onBlur={(e) => onChange({ ...block, props: { ...block.props, title: e.currentTarget.textContent ?? '' } })}>
								{String(block.props.title ?? 'Hero Title')}
							</h1>
							<p contentEditable suppressContentEditableWarning onBlur={(e) => onChange({ ...block, props: { ...block.props, subtitle: e.currentTarget.textContent ?? '' } })}>
								{String(block.props.subtitle ?? '')}
							</p>
						</div>
					</section>
				);
			}

			return (
				<section
					className={`block-hero gb-canvas-hero ${block.type} block-hero-align-${align} block-hero-valign-${valign}`}
					style={heroStyle}
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

		if (isColumnsBlock(block.type)) {
			return (
				<ColumnsCanvas
					block={block}
					structureMode={structureMode}
					isSelected={isSelected}
					renderColumnBlocks={(column) =>
						renderBlockList ? renderBlockList(column.children ?? [], column.id) : null
					}
					onInsertInColumn={(columnId, index, anchor) =>
						onInsertInColumn?.(columnId, index, anchor)
					}
				/>
			);
		}

		if (LAYOUT_WITH_CHILDREN.has(block.type)) {
			return (
				<div className="block-container">
					{renderBlockList
						? renderBlockList(block.children ?? [], block.id)
						: (block.children ?? []).map((child) => (
							<div key={child.id} className="block-column">{child.type}</div>
						))}
				</div>
			);
		}

		return <div className="gb-canvas-placeholder">{def?.label ?? block.type}</div>;
	};

	const widthClass = blockWidthClass(getBlockWidth(block.props.width));

	return (
		<div
			className={`gb-canvas-block ${widthClass} ${showChrome ? 'is-visible' : ''} ${isSelected ? 'is-selected' : ''} ${structureMode === 'structure' ? 'is-structure' : ''}`}
			data-block-id={block.id}
			data-block-type={block.type}
			style={getBlockSpacingStyle(block.props)}
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
