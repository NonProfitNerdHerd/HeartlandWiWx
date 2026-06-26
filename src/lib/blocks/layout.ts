export type BlockWidth = 'standard' | 'wide' | 'full';
export type TextAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export const BLOCK_WIDTHS: BlockWidth[] = ['standard', 'wide', 'full'];

export function getBlockWidth(value: unknown): BlockWidth {
	if (value === 'wide' || value === 'full') return value;
	return 'standard';
}

export function blockWidthClass(width: BlockWidth): string {
	return `block-width-${width}`;
}

export function getTextAlign(value: unknown): TextAlign {
	if (value === 'left' || value === 'right') return value;
	return 'center';
}

export function getVerticalAlign(value: unknown): VerticalAlign {
	if (value === 'top' || value === 'bottom') return value;
	return 'middle';
}

export function clampFocus(value: unknown, fallback = 50): number {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(100, Math.max(0, Math.round(n)));
}

export function heroBackgroundPosition(focusX: unknown, focusY: unknown): string {
	return `${clampFocus(focusX)}% ${clampFocus(focusY)}%`;
}

export function heroClassAttr(align: unknown, valign: unknown, width: unknown): string {
	const w = getBlockWidth(width);
	const a = getTextAlign(align);
	const v = getVerticalAlign(valign);
	return `block-hero block-width-${w} block-hero-align-${a} block-hero-valign-${v}`;
}
