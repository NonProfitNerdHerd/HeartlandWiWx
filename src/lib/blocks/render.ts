import { marked } from 'marked';
import type { Block } from '../types/blocks';

marked.setOptions({ gfm: true, breaks: true });

export function markdownToBlocks(markdown: string): Block[] {
	const lines = markdown.split('\n');
	const blocks: Block[] = [];
	let paragraphLines: string[] = [];
	let blockIndex = 0;

	const flushParagraph = () => {
		const text = paragraphLines.join('\n').trim();
		if (text) {
			blocks.push({
				id: `migrated-${blockIndex++}`,
				type: 'paragraph',
				props: {},
				content: `<p>${escapeHtml(text).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
			});
		}
		paragraphLines = [];
	};

	for (const line of lines) {
		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			flushParagraph();
			const level = headingMatch[1].length;
			const text = headingMatch[2];
			blocks.push({
				id: `migrated-${blockIndex++}`,
				type: 'heading',
				props: { level },
				content: `<h${level}>${escapeHtml(text)}</h${level}>`,
			});
			continue;
		}

		if (line.trim() === '') {
			flushParagraph();
			continue;
		}

		paragraphLines.push(line);
	}

	flushParagraph();
	return blocks;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function blocksToMarkdown(blocks: Block[]): string {
	return blocks
		.map((block) => {
			if (block.type === 'heading') {
				const level = Number(block.props.level ?? 2);
				const text = stripTags(block.content ?? '');
				return `${'#'.repeat(level)} ${text}`;
			}
			if (block.type === 'markdown') {
				return String(block.content ?? block.props.markdown ?? '');
			}
			if (block.content) {
				return stripTags(block.content);
			}
			return '';
		})
		.filter(Boolean)
		.join('\n\n');
}

function stripTags(html: string): string {
	return html.replace(/<[^>]+>/g, '').trim();
}

export function renderBlockHtml(block: Block, globalBlocks?: Record<string, Block[]>): string {
	if (block.type === 'globalBlock' && globalBlocks) {
		const blockId = String(block.props.blockId ?? '');
		const nested = globalBlocks[blockId] ?? [];
		return nested.map((b) => renderBlockHtml(b, globalBlocks)).join('\n');
	}

	if (block.type === 'markdown') {
		const md = String(block.content ?? block.props.markdown ?? '');
		return marked.parse(md) as string;
	}

	if (block.type === 'html') {
		return String(block.content ?? block.props.html ?? '');
	}

	if (block.type === 'divider') {
		return '<hr class="block-divider" />';
	}

	if (block.type === 'spacer') {
		const height = Number(block.props.height ?? 48);
		return `<div class="block-spacer" style="height:${height}px" aria-hidden="true"></div>`;
	}

	if (block.type === 'button') {
		const label = String(block.props.label ?? 'Button');
		const href = String(block.props.href ?? '#');
		const variant = String(block.props.variant ?? 'primary');
		return `<a class="btn btn-${variant}" href="${href}">${escapeHtml(label)}</a>`;
	}

	if (block.type === 'image') {
		const src = String(block.props.src ?? '');
		const alt = String(block.props.alt ?? '');
		const caption = String(block.props.caption ?? '');
		if (!src) return '';
		return `<figure class="block-image"><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
	}

	if (block.type === 'hero') {
		const title = String(block.props.title ?? '');
		const subtitle = String(block.props.subtitle ?? '');
		const image = String(block.props.image ?? '');
		return `<section class="block-hero" ${image ? `style="background-image:url(${image})"` : ''}><div class="block-hero-inner"><h1>${escapeHtml(title)}</h1>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}</div></section>`;
	}

	if (block.type === 'alert' || block.type === 'callout') {
		const variant = String(block.props.variant ?? 'info');
		const title = block.props.title ? `<strong>${escapeHtml(String(block.props.title))}</strong>` : '';
		return `<div class="block-${block.type} block-${variant}">${title}${block.content ?? ''}</div>`;
	}

	if (block.type === 'ctaBanner') {
		const title = String(block.props.title ?? '');
		const buttonLabel = String(block.props.buttonLabel ?? 'Learn more');
		const href = String(block.props.href ?? '/');
		return `<section class="block-cta"><h2>${escapeHtml(title)}</h2><a class="btn btn-primary" href="${href}">${escapeHtml(buttonLabel)}</a></section>`;
	}

	if (block.type === 'twoColumns' || block.type === 'threeColumns' || block.type === 'fourColumns') {
		const cols = block.type === 'twoColumns' ? 2 : block.type === 'threeColumns' ? 3 : 4;
		const children = block.children ?? [];
		const cells = Array.from({ length: cols }, (_, i) => children[i] ?? { id: `empty-${i}`, type: 'paragraph', props: {}, content: '' });
		return `<div class="block-columns block-columns-${cols}">${cells.map((c) => `<div class="block-column">${renderBlockHtml(c, globalBlocks)}</div>`).join('')}</div>`;
	}

	if (block.type === 'container' || block.type === 'oneColumn') {
		const inner = (block.children ?? []).map((c) => renderBlockHtml(c, globalBlocks)).join('');
		return `<div class="block-container">${inner}</div>`;
	}

	if (block.content) {
		return block.content;
	}

	return '';
}

export function renderBlocks(blocks: Block[], globalBlocks?: Record<string, Block[]>): string {
	return blocks.map((b) => renderBlockHtml(b, globalBlocks)).join('\n');
}
