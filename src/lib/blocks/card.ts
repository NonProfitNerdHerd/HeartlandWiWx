import type { Block } from '../../types/blocks';
import { blockAlignClass, getBlockAlign, getLinkTarget, linkTargetAttrs } from './typography';

export const CARD_STYLES = [
	{ id: 'title-image-text-button', label: 'Title → Image → Text → Button' },
	{ id: 'image-title-text-button', label: 'Image → Title → Text → Button' },
	{ id: 'image-left', label: 'Image Left, Content Right' },
	{ id: 'centered', label: 'Centered Card' },
	{ id: 'circle-centered', label: 'Circle Image, Centered' },
	{ id: 'hero', label: 'Large Hero Card' },
	{ id: 'minimal', label: 'Minimal Card' },
] as const;

export type CardStyleId = (typeof CARD_STYLES)[number]['id'];

export type ImageStyle = 'square' | 'rounded' | 'circle';
export type CardShadow = 'none' | 'small' | 'medium' | 'large';

export const DEFAULT_CARD_PROPS: Record<string, unknown> = {
	cardStyle: 'title-image-text-button',
	title: 'Card Title',
	subtitle: '',
	image: '',
	text: '',
	buttonText: '',
	buttonUrl: '',
	buttonTarget: 'same',
	imageStyle: 'rounded',
	titleAlign: 'left',
	textAlign: 'left',
	buttonAlign: 'left',
	padding: 24,
	borderRadius: 8,
	shadow: 'small',
};

export function getCardStyle(value: unknown): CardStyleId {
	const match = CARD_STYLES.find((s) => s.id === value);
	return match?.id ?? 'title-image-text-button';
}

export function getImageStyle(value: unknown): ImageStyle {
	if (value === 'square' || value === 'circle') return value;
	return 'rounded';
}

export function getCardShadow(value: unknown): CardShadow {
	if (value === 'none' || value === 'medium' || value === 'large') return value;
	return 'small';
}

export function normalizeCardBlock(block: Block): Block {
	const props = { ...DEFAULT_CARD_PROPS, ...block.props };
	let text = String(props.text ?? '');
	if (!text && block.content) {
		text = block.content.replace(/<[^>]+>/g, '').trim();
	}
	return {
		...block,
		props: { ...props, text },
		content: undefined,
	};
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function cardStyleAttr(props: Record<string, unknown>): string {
	const parts: string[] = [];
	const padding = Number(props.padding);
	if (Number.isFinite(padding)) parts.push(`padding:${padding}px`);
	const radius = Number(props.borderRadius);
	if (Number.isFinite(radius)) parts.push(`border-radius:${radius}px`);
	return parts.join(';');
}

function imageClass(imageStyle: ImageStyle): string {
	return `block-card-image block-card-image-${imageStyle}`;
}

function buttonHtml(props: Record<string, unknown>): string {
	const text = String(props.buttonText ?? '').trim();
	if (!text) return '';
	const href = String(props.buttonUrl ?? '#');
	const align = getBlockAlign(props.buttonAlign);
	const fullWidth = props.buttonAlign === 'full';
	const cls = fullWidth ? 'btn btn-primary block-card-btn-full' : 'btn btn-primary';
	return `<div class="block-card-button ${blockAlignClass('block-card-button', align)}${fullWidth ? ' is-full' : ''}"><a class="${cls}" href="${escapeHtml(href)}"${linkTargetAttrs(props.buttonTarget)}>${escapeHtml(text)}</a></div>`;
}

function imageHtml(image: string, imageStyle: ImageStyle, alt: string): string {
	if (!image) return '';
	return `<div class="${imageClass(imageStyle)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" /></div>`;
}

function titleHtml(props: Record<string, unknown>): string {
	const title = String(props.title ?? '').trim();
	const subtitle = String(props.subtitle ?? '').trim();
	if (!title && !subtitle) return '';
	const align = getBlockAlign(props.titleAlign);
	return `<div class="block-card-titles ${blockAlignClass('block-card-titles', align)}">${title ? `<h3 class="block-card-title">${escapeHtml(title)}</h3>` : ''}${subtitle ? `<p class="block-card-subtitle">${escapeHtml(subtitle)}</p>` : ''}</div>`;
}

function textHtml(props: Record<string, unknown>): string {
	const text = String(props.text ?? '').trim();
	if (!text) return '';
	const align = getBlockAlign(props.textAlign);
	return `<div class="block-card-text ${blockAlignClass('block-card-text', align)}"><p>${escapeHtml(text).replace(/\n/g, '<br>')}</p></div>`;
}

export function renderCardHtml(block: Block): string {
	const normalized = normalizeCardBlock(block);
	const props = normalized.props;
	const style = getCardStyle(props.cardStyle);
	const shadow = getCardShadow(props.shadow);
	const image = String(props.image ?? '');
	const imageStyle = getImageStyle(props.imageStyle);
	const alt = String(props.title ?? 'Card image');

	const img = imageHtml(image, imageStyle, alt);
	const titles = titleHtml(props);
	const text = textHtml(props);
	const button = buttonHtml(props);
	const inlineStyle = cardStyleAttr(props);

	const parts: Record<CardStyleId, string> = {
		'title-image-text-button': `${titles}${img}${text}${button}`,
		'image-title-text-button': `${img}${titles}${text}${button}`,
		'image-left': `<div class="block-card-split">${img}<div class="block-card-split-body">${titles}${text}${button}</div></div>`,
		centered: `<div class="block-card-centered">${img}${titles}${text}${button}</div>`,
		'circle-centered': `<div class="block-card-centered block-card-circle-layout">${img}${titles}${text}${button}</div>`,
		hero: `<div class="block-card-hero-layout">${image ? `<div class="block-card-hero-bg" style="background-image:url(${escapeHtml(image)})"></div>` : ''}<div class="block-card-hero-body">${titles}${text}${button}</div></div>`,
		minimal: `<div class="block-card-minimal">${titles}${text}${button}</div>`,
	};

	return `<article class="block-card block-card-style-${style} block-card-shadow-${shadow}"${inlineStyle ? ` style="${inlineStyle}"` : ''}>${parts[style]}</article>`;
}
