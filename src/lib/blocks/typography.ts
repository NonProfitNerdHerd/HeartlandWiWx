export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type FontSizePreset = 'small' | 'medium' | 'large' | 'xlarge' | 'custom';
export type FontWeightPreset = 'normal' | 'medium' | 'semibold' | 'bold';
export type BlockAlign = 'left' | 'center' | 'right';
export type LinkTarget = 'same' | 'new';

const FONT_SIZE_MAP: Record<Exclude<FontSizePreset, 'custom'>, string> = {
	small: '14px',
	medium: '18px',
	large: '22px',
	xlarge: '28px',
};

const FONT_WEIGHT_MAP: Record<FontWeightPreset, string> = {
	normal: '400',
	medium: '500',
	semibold: '600',
	bold: '700',
};

export function getTextAlign(value: unknown): TextAlign {
	if (value === 'center' || value === 'right' || value === 'justify') return value;
	return 'left';
}

export function getBlockAlign(value: unknown): BlockAlign {
	if (value === 'center' || value === 'right') return value;
	return 'left';
}

export function getLinkTarget(value: unknown): LinkTarget {
	return value === 'new' ? 'new' : 'same';
}

export function getFontSizePreset(value: unknown): FontSizePreset {
	if (value === 'small' || value === 'large' || value === 'xlarge' || value === 'custom') return value;
	return 'medium';
}

export function getFontWeightPreset(value: unknown): FontWeightPreset {
	if (value === 'medium' || value === 'semibold' || value === 'bold') return value;
	return 'normal';
}

function resolveFontSize(props: Record<string, unknown>): string | undefined {
	const preset = getFontSizePreset(props.fontSize);
	if (preset === 'custom') {
		const custom = Number(props.fontSizeCustom);
		return Number.isFinite(custom) && custom > 0 ? `${custom}px` : undefined;
	}
	if (preset === 'medium') return undefined;
	return FONT_SIZE_MAP[preset];
}

function resolveFontWeight(props: Record<string, unknown>): string | undefined {
	const preset = getFontWeightPreset(props.fontWeight);
	if (preset === 'normal') return undefined;
	return FONT_WEIGHT_MAP[preset];
}

export function typographyStyleAttr(props: Record<string, unknown>): string {
	const parts: string[] = [];
	const align = props.textAlign;
	if (align && align !== 'left') parts.push(`text-align:${align}`);

	const fontSize = resolveFontSize(props);
	if (fontSize) parts.push(`font-size:${fontSize}`);

	const fontWeight = resolveFontWeight(props);
	if (fontWeight) parts.push(`font-weight:${fontWeight}`);

	if (props.color) parts.push(`color:${props.color}`);
	if (props.backgroundColor) parts.push(`background-color:${props.backgroundColor}`);

	const lineHeight = Number(props.lineHeight);
	if (Number.isFinite(lineHeight) && lineHeight > 0) parts.push(`line-height:${lineHeight}`);

	const letterSpacing = Number(props.letterSpacing);
	if (Number.isFinite(letterSpacing)) parts.push(`letter-spacing:${letterSpacing}px`);

	const marginTop = props.marginTop;
	if (marginTop !== undefined && marginTop !== '' && marginTop !== null) {
		parts.push(`margin-top:${typeof marginTop === 'number' ? `${marginTop}px` : marginTop}`);
	}

	const marginBottom = props.marginBottom;
	if (marginBottom !== undefined && marginBottom !== '' && marginBottom !== null) {
		parts.push(`margin-bottom:${typeof marginBottom === 'number' ? `${marginBottom}px` : marginBottom}`);
	}

	return parts.join(';');
}

export function typographyStyleObject(props: Record<string, unknown>): Record<string, string> {
	const attr = typographyStyleAttr(props);
	if (!attr) return {};
	return Object.fromEntries(
		attr.split(';').filter(Boolean).map((pair) => {
			const [key, ...rest] = pair.split(':');
			return [key.trim(), rest.join(':').trim()];
		}),
	);
}

export function blockAlignClass(prefix: string, align: unknown): string {
	return `${prefix}-align-${getBlockAlign(align)}`;
}

export function linkTargetAttrs(target: unknown): string {
	if (getLinkTarget(target) === 'new') {
		return ' target="_blank" rel="noopener noreferrer"';
	}
	return '';
}
