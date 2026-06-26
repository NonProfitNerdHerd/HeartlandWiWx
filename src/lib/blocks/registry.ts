import type { BlockDefinition } from '../types/blocks';
import { createColumnWrapper } from './columns';
import { DEFAULT_CARD_PROPS } from './card';

export const GUTENBERG_CATEGORIES = [
	'Basic',
	'Media',
	'Layout',
	'Blog',
	'Organization',
	'Interactive',
	'Utility',
	'Global Blocks',
] as const;

export type GutenbergCategory = (typeof GUTENBERG_CATEGORIES)[number];

/** Blocks shown first in inline inserter and slash menu */
export const COMMON_BLOCK_TYPES = [
	'paragraph',
	'heading',
	'image',
	'button',
	'twoColumns',
	'bulletList',
	'quote',
	'divider',
	'spacer',
	'form',
	'card',
	'embed',
] as const;

export const RECENT_BLOCKS_LIMIT = 6;

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
	{ type: 'paragraph', label: 'Paragraph', category: 'Basic', icon: '¶', description: 'Start with the building block of all narrative.', keywords: ['text', 'p'], defaultProps: { textAlign: 'left', fontSize: 'medium' }, defaultContent: '<p></p>' },
	{ type: 'heading', label: 'Heading', category: 'Basic', icon: 'H', description: 'Introduce new sections and organize content.', keywords: ['title', 'h1', 'h2'], defaultProps: { level: 2, textAlign: 'left', fontSize: 'medium' }, defaultContent: '<h2>Heading</h2>' },
	{ type: 'bulletList', label: 'List', category: 'Basic', icon: '•', description: 'Create a bulleted or numbered list.', keywords: ['ul', 'ol'], defaultContent: '<ul><li>Item</li></ul>' },
	{ type: 'orderedList', label: 'Numbered List', category: 'Basic', icon: '1.', description: 'An ordered list of items.', keywords: ['ol'], defaultContent: '<ol><li>Item</li></ol>' },
	{ type: 'quote', label: 'Quote', category: 'Basic', icon: '"', description: 'Give quoted text visual emphasis.', keywords: ['blockquote'], defaultContent: '<blockquote><p>Quote text</p></blockquote>' },
	{ type: 'codeBlock', label: 'Code', category: 'Basic', icon: '</>', description: 'Display code snippets with syntax highlighting.', keywords: ['pre'], defaultProps: { language: 'text' }, defaultContent: '<pre><code>code</code></pre>' },
	{ type: 'table', label: 'Table', category: 'Basic', icon: '⊞', description: 'Insert a table for sharing data.', keywords: ['grid'], defaultContent: '<table><tr><th>Col</th></tr><tr><td>Data</td></tr></table>' },
	{ type: 'divider', label: 'Separator', category: 'Basic', icon: '—', description: 'Create a break between ideas with a horizontal line.', keywords: ['hr', 'line'] },
	{ type: 'spacer', label: 'Spacer', category: 'Basic', icon: '↕', description: 'Add white space between blocks.', keywords: ['space'], defaultProps: { height: 48 } },
	{ type: 'button', label: 'Button', category: 'Basic', icon: 'Btn', description: 'Prompt visitors to take action with a button.', keywords: ['cta', 'link'], defaultProps: { label: 'Click me', href: '/', variant: 'primary', align: 'left', target: 'same' } },
	{ type: 'alert', label: 'Notice', category: 'Basic', icon: '!', description: 'Highlight important information.', keywords: ['info', 'warning'], defaultProps: { variant: 'info' }, defaultContent: '<p>Notice message</p>' },
	{ type: 'callout', label: 'Callout', category: 'Basic', icon: '💡', description: 'Draw attention to a key detail.', keywords: ['note', 'tip'], defaultProps: { title: 'Note' }, defaultContent: '<p>Callout text</p>' },
	{ type: 'card', label: 'Card', category: 'Basic', icon: '▭', description: 'A flexible card with image, text, and button.', keywords: ['box'], defaultProps: { ...DEFAULT_CARD_PROPS } },
	{ type: 'featureCard', label: 'Feature', category: 'Basic', icon: '✦', description: 'Highlight a feature with icon and text.', keywords: ['icon'], defaultProps: { title: 'Feature', icon: '★' }, defaultContent: '<p>Description</p>' },
	{ type: 'ctaBanner', label: 'Call to Action', category: 'Basic', icon: '→', description: 'A banner prompting visitors to act.', keywords: ['cta'], defaultProps: { title: 'Call to action', buttonLabel: 'Learn more', href: '/' } },
	{ type: 'hero', label: 'Cover', category: 'Basic', icon: '★', description: 'A hero section with title and background.', keywords: ['banner', 'cover'], defaultProps: { title: 'Hero Title', subtitle: '', image: '', align: 'center', valign: 'middle', width: 'standard', imageFocusX: 50, imageFocusY: 50 } },
	{ type: 'splitHero', label: 'Split Cover', category: 'Basic', icon: '◧', description: 'Hero with side-by-side image and text.', keywords: ['split'], defaultProps: { title: 'Hero', subtitle: '', image: '', align: 'center', valign: 'middle', width: 'standard', imageFocusX: 50, imageFocusY: 50 } },
	{ type: 'minimalHero', label: 'Minimal Cover', category: 'Basic', icon: '—', description: 'A simple text-only hero section.', keywords: ['minimal'], defaultProps: { title: 'Hero', align: 'center', valign: 'middle', width: 'standard' } },
	{ type: 'image', label: 'Image', category: 'Media', icon: '🖼', description: 'Insert an image to make a visual statement.', keywords: ['photo', 'picture'], defaultProps: { src: '', alt: '', caption: '' } },
	{ type: 'gallery', label: 'Gallery', category: 'Media', icon: '▦', description: 'Display multiple images in a grid.', keywords: ['photos'], defaultProps: { images: [] } },
	{ type: 'carousel', label: 'Carousel', category: 'Media', icon: '◫', description: 'Display images in a sliding carousel.', keywords: ['slider'], defaultProps: { slides: [] } },
	{ type: 'video', label: 'Video', category: 'Media', icon: '▶', description: 'Embed a video from your media library or URL.', keywords: ['movie'], defaultProps: { src: '', poster: '' } },
	{ type: 'embed', label: 'Embed', category: 'Media', icon: '⧉', description: 'Embed videos, tweets, or other content.', keywords: ['iframe', 'youtube'], defaultProps: { url: '', height: 400 } },
	{ type: 'fileDownload', label: 'File', category: 'Media', icon: '↓', description: 'Add a downloadable file.', keywords: ['download'], defaultProps: { url: '', label: 'Download' } },
	{ type: 'pdfViewer', label: 'PDF', category: 'Media', icon: 'PDF', description: 'Embed a PDF document.', keywords: ['document'], defaultProps: { url: '' } },
	{ type: 'container', label: 'Group', category: 'Layout', icon: '□', description: 'Gather blocks in a layout container.', keywords: ['wrapper'], defaultProps: { maxWidth: '1200px' } },
	{ type: 'oneColumn', label: 'Row', category: 'Layout', icon: '▢', description: 'A single row for nested blocks.', keywords: ['row'] },
	{ type: 'twoColumns', label: 'Columns', category: 'Layout', icon: '▥', description: 'Add a block that displays content in columns.', keywords: ['column', 'grid'], defaultProps: { columns: 2, width: 'standard' } },
	{ type: 'threeColumns', label: '3 Columns', category: 'Layout', icon: '▦', description: 'Three equal columns side by side.', keywords: ['column'], defaultProps: { columns: 3, width: 'standard' } },
	{ type: 'fourColumns', label: '4 Columns', category: 'Layout', icon: '▩', description: 'Four equal columns side by side.', keywords: ['column'], defaultProps: { columns: 4, width: 'standard' } },
	{ type: 'cardGrid', label: 'Card Grid', category: 'Layout', icon: '⊞', description: 'Display cards in a responsive grid.', keywords: ['grid'], defaultProps: { columns: 3 } },
	{ type: 'tabs', label: 'Tabs', category: 'Layout', icon: '⊟', description: 'Organize content in tabbed sections.', keywords: ['tab'], defaultProps: { tabs: [{ label: 'Tab 1', id: '1' }] } },
	{ type: 'accordion', label: 'Accordion', category: 'Layout', icon: '≡', description: 'Collapsible sections of content.', keywords: ['collapse'], defaultProps: { items: [{ title: 'Section', id: '1' }] } },
	{ type: 'stickySection', label: 'Sticky Section', category: 'Layout', icon: '📌', description: 'A section that sticks while scrolling.', keywords: ['sticky'] },
	{ type: 'featuredPosts', label: 'Featured Posts', category: 'Blog', icon: '★', description: 'Showcase selected blog posts.', keywords: ['posts'], defaultProps: { count: 3 } },
	{ type: 'recentPosts', label: 'Latest Posts', category: 'Blog', icon: '📰', description: 'Display your most recent posts.', keywords: ['posts'], defaultProps: { count: 5 } },
	{ type: 'relatedPosts', label: 'Related Posts', category: 'Blog', icon: '↔', description: 'Show posts related to the current page.', keywords: ['posts'], defaultProps: { count: 3 } },
	{ type: 'authorBox', label: 'Author', category: 'Blog', icon: '👤', description: 'Display author name, bio, and avatar.', keywords: ['bio'], defaultProps: { name: '', bio: '', avatar: '' } },
	{ type: 'categories', label: 'Categories', category: 'Blog', icon: '🏷', description: 'List post categories.', keywords: ['taxonomy'] },
	{ type: 'tags', label: 'Tags', category: 'Blog', icon: '#', description: 'Display post tags.', keywords: ['taxonomy'] },
	{ type: 'documentLibrary', label: 'Documents', category: 'Organization', icon: '📁', description: 'A browsable document library.', keywords: ['files'], defaultProps: { documents: [] } },
	{ type: 'resourceList', label: 'Resources', category: 'Organization', icon: '📋', description: 'A list of linked resources.', keywords: ['links'], defaultProps: { items: [] } },
	{ type: 'downloadList', label: 'Downloads', category: 'Organization', icon: '↓', description: 'A list of downloadable files.', keywords: ['files'], defaultProps: { items: [] } },
	{ type: 'faq', label: 'FAQ', category: 'Organization', icon: '?', description: 'Frequently asked questions in accordion style.', keywords: ['questions'], defaultProps: { items: [{ q: 'Question?', a: 'Answer.' }] } },
	{ type: 'form', label: 'Form', category: 'Interactive', icon: '📝', description: 'Insert a form created in the Forms builder.', keywords: ['contact', 'survey'], defaultProps: { formId: '' } },
	{ type: 'poll', label: 'Poll', category: 'Interactive', icon: '📊', description: 'Let visitors vote on a question.', keywords: ['vote'], defaultProps: { question: '', options: [] } },
	{ type: 'survey', label: 'Survey', category: 'Interactive', icon: '📝', description: 'Collect responses with a form.', keywords: ['form'], defaultProps: { fields: [] } },
	{ type: 'countdown', label: 'Countdown', category: 'Interactive', icon: '⏱', description: 'Display a countdown to a date.', keywords: ['timer'], defaultProps: { targetDate: '' } },
	{ type: 'eventCalendar', label: 'Events', category: 'Interactive', icon: '📅', description: 'Show upcoming events.', keywords: ['calendar'], defaultProps: { events: [] } },
	{ type: 'tableOfContents', label: 'Table of Contents', category: 'Utility', icon: '≡', description: 'A list of links to headings on the page.', keywords: ['toc', 'nav'] },
	{ type: 'anchorLink', label: 'Anchor', category: 'Utility', icon: '#', description: 'Link to a section on this page.', keywords: ['jump'], defaultProps: { id: 'section', label: 'Jump to section' } },
	{ type: 'searchBlock', label: 'Search', category: 'Utility', icon: '🔍', description: 'Add a search field.', keywords: ['find'] },
	{ type: 'html', label: 'Custom HTML', category: 'Utility', icon: '</>', description: 'Add custom HTML code.', keywords: ['code'], defaultContent: '<div></div>' },
	{ type: 'markdown', label: 'Markdown', category: 'Utility', icon: 'MD', description: 'Write content in Markdown format.', keywords: ['md'], defaultContent: '## Markdown' },
	{ type: 'globalBlock', label: 'Global Block', category: 'Global Blocks', icon: '⊕', description: 'Insert a reusable block synced across the site.', keywords: ['reusable', 'synced'], defaultProps: { blockId: '' } },
];

export const BLOCK_CATEGORIES = [...GUTENBERG_CATEGORIES];

const LAYOUT_CHILD_TYPES = new Set([
	'container', 'oneColumn', 'twoColumns', 'threeColumns', 'fourColumns',
	'cardGrid', 'tabs', 'accordion', 'stickySection',
]);

const COLUMN_TYPES = new Set(['twoColumns', 'threeColumns', 'fourColumns']);

export function getColumnCount(type: string): number {
	if (type === 'twoColumns') return 2;
	if (type === 'threeColumns') return 3;
	if (type === 'fourColumns') return 4;
	return 0;
}

export function getBlockDefinition(type: string): BlockDefinition | undefined {
	return BLOCK_DEFINITIONS.find((b) => b.type === type);
}

export function createBlock(type: string, id: string): import('../types/blocks').Block {
	const def = getBlockDefinition(type);
	const colCount = getColumnCount(type);
	const children = LAYOUT_CHILD_TYPES.has(type)
		? colCount > 0
			? Array.from({ length: colCount }, (_, i) => createColumnWrapper(`${id}-col-${i}`))
			: []
		: undefined;
	return {
		id,
		type,
		props: { ...(def?.defaultProps ?? {}), ...(colCount > 0 ? { gap: 24 } : {}) },
		content: def?.defaultContent,
		children,
	};
}

export function searchBlocks(query: string): BlockDefinition[] {
	const q = query.toLowerCase().trim();
	if (!q) return BLOCK_DEFINITIONS;
	return BLOCK_DEFINITIONS.filter(
		(b) =>
			b.label.toLowerCase().includes(q) ||
			b.type.toLowerCase().includes(q) ||
			b.description?.toLowerCase().includes(q) ||
			b.keywords?.some((k) => k.includes(q)),
	);
}
