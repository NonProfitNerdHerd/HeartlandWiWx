import type { BlockDefinition } from '../types/blocks';

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
	{ type: 'paragraph', label: 'Paragraph', category: 'Content', icon: '¶', defaultContent: '<p></p>' },
	{ type: 'heading', label: 'Heading', category: 'Content', icon: 'H', defaultProps: { level: 2 }, defaultContent: '<h2>Heading</h2>' },
	{ type: 'bulletList', label: 'Bullet List', category: 'Content', icon: '•', defaultContent: '<ul><li>Item</li></ul>' },
	{ type: 'orderedList', label: 'Numbered List', category: 'Content', icon: '1.', defaultContent: '<ol><li>Item</li></ol>' },
	{ type: 'quote', label: 'Quote', category: 'Content', icon: '"', defaultContent: '<blockquote><p>Quote text</p></blockquote>' },
	{ type: 'codeBlock', label: 'Code Block', category: 'Content', icon: '</>', defaultProps: { language: 'text' }, defaultContent: '<pre><code>code</code></pre>' },
	{ type: 'table', label: 'Table', category: 'Content', icon: '⊞', defaultContent: '<table><tr><th>Col</th></tr><tr><td>Data</td></tr></table>' },
	{ type: 'divider', label: 'Divider', category: 'Content', icon: '—' },
	{ type: 'spacer', label: 'Spacer', category: 'Content', icon: '↕', defaultProps: { height: 48 } },
	{ type: 'button', label: 'Button', category: 'Content', icon: 'Btn', defaultProps: { label: 'Click me', href: '/', variant: 'primary' } },
	{ type: 'alert', label: 'Alert', category: 'Content', icon: '!', defaultProps: { variant: 'info' }, defaultContent: '<p>Alert message</p>' },
	{ type: 'callout', label: 'Callout', category: 'Content', icon: '💡', defaultProps: { title: 'Note' }, defaultContent: '<p>Callout text</p>' },
	{ type: 'image', label: 'Image', category: 'Media', icon: '🖼', defaultProps: { src: '', alt: '', caption: '' } },
	{ type: 'gallery', label: 'Gallery', category: 'Media', icon: '▦', defaultProps: { images: [] } },
	{ type: 'carousel', label: 'Carousel', category: 'Media', icon: '◫', defaultProps: { slides: [] } },
	{ type: 'video', label: 'Video', category: 'Media', icon: '▶', defaultProps: { src: '', poster: '' } },
	{ type: 'embed', label: 'Embed', category: 'Media', icon: '⧉', defaultProps: { url: '', height: 400 } },
	{ type: 'fileDownload', label: 'File Download', category: 'Media', icon: '↓', defaultProps: { url: '', label: 'Download' } },
	{ type: 'pdfViewer', label: 'PDF Viewer', category: 'Media', icon: 'PDF', defaultProps: { url: '' } },
	{ type: 'container', label: 'Container', category: 'Layout', icon: '□', defaultProps: { maxWidth: '1200px' }, children: [] },
	{ type: 'oneColumn', label: 'One Column', category: 'Layout', icon: '▢', children: [] },
	{ type: 'twoColumns', label: 'Two Columns', category: 'Layout', icon: '▥', children: [] },
	{ type: 'threeColumns', label: 'Three Columns', category: 'Layout', icon: '▦', children: [] },
	{ type: 'fourColumns', label: 'Four Columns', category: 'Layout', icon: '▩', children: [] },
	{ type: 'cardGrid', label: 'Card Grid', category: 'Layout', icon: '⊞', defaultProps: { columns: 3 }, children: [] },
	{ type: 'tabs', label: 'Tabs', category: 'Layout', icon: '⊟', defaultProps: { tabs: [{ label: 'Tab 1', id: '1' }] }, children: [] },
	{ type: 'accordion', label: 'Accordion', category: 'Layout', icon: '≡', defaultProps: { items: [{ title: 'Section', id: '1' }] }, children: [] },
	{ type: 'stickySection', label: 'Sticky Section', category: 'Layout', icon: '📌', children: [] },
	{ type: 'hero', label: 'Hero Banner', category: 'Hero', icon: '★', defaultProps: { title: 'Hero Title', subtitle: '', image: '', align: 'center' } },
	{ type: 'splitHero', label: 'Split Hero', category: 'Hero', icon: '◧', defaultProps: { title: 'Hero', image: '' } },
	{ type: 'minimalHero', label: 'Minimal Hero', category: 'Hero', icon: '—', defaultProps: { title: 'Hero' } },
	{ type: 'card', label: 'Card', category: 'Cards', icon: '▭', defaultProps: { title: 'Card' }, defaultContent: '<p>Card body</p>' },
	{ type: 'featureCard', label: 'Feature Card', category: 'Cards', icon: '✦', defaultProps: { title: 'Feature', icon: '★' }, defaultContent: '<p>Description</p>' },
	{ type: 'ctaBanner', label: 'CTA Banner', category: 'Cards', icon: '→', defaultProps: { title: 'Call to action', buttonLabel: 'Learn more', href: '/' } },
	{ type: 'featuredPosts', label: 'Featured Posts', category: 'Blog', icon: '★', defaultProps: { count: 3 } },
	{ type: 'recentPosts', label: 'Recent Posts', category: 'Blog', icon: '📰', defaultProps: { count: 5 } },
	{ type: 'relatedPosts', label: 'Related Posts', category: 'Blog', icon: '↔', defaultProps: { count: 3 } },
	{ type: 'authorBox', label: 'Author Box', category: 'Blog', icon: '👤', defaultProps: { name: '', bio: '', avatar: '' } },
	{ type: 'categories', label: 'Categories', category: 'Blog', icon: '🏷' },
	{ type: 'tags', label: 'Tags', category: 'Blog', icon: '#' },
	{ type: 'documentLibrary', label: 'Document Library', category: 'Organization', icon: '📁', defaultProps: { documents: [] } },
	{ type: 'resourceList', label: 'Resource List', category: 'Organization', icon: '📋', defaultProps: { items: [] } },
	{ type: 'downloadList', label: 'Download List', category: 'Organization', icon: '↓', defaultProps: { items: [] } },
	{ type: 'faq', label: 'FAQ Block', category: 'Organization', icon: '?', defaultProps: { items: [{ q: 'Question?', a: 'Answer.' }] } },
	{ type: 'poll', label: 'Poll', category: 'Interactive', icon: '📊', defaultProps: { question: '', options: [] } },
	{ type: 'survey', label: 'Survey', category: 'Interactive', icon: '📝', defaultProps: { fields: [] } },
	{ type: 'countdown', label: 'Countdown Timer', category: 'Interactive', icon: '⏱', defaultProps: { targetDate: '' } },
	{ type: 'eventCalendar', label: 'Event Calendar', category: 'Interactive', icon: '📅', defaultProps: { events: [] } },
	{ type: 'tableOfContents', label: 'Table of Contents', category: 'Utility', icon: '≡' },
	{ type: 'anchorLink', label: 'Anchor Link', category: 'Utility', icon: '#', defaultProps: { id: 'section', label: 'Jump to section' } },
	{ type: 'searchBlock', label: 'Search Block', category: 'Utility', icon: '🔍' },
	{ type: 'html', label: 'HTML Block', category: 'Custom', icon: '</>', defaultContent: '<div></div>' },
	{ type: 'markdown', label: 'Markdown Block', category: 'Custom', icon: 'MD', defaultContent: '## Markdown' },
	{ type: 'globalBlock', label: 'Global Block', category: 'Custom', icon: '⊕', defaultProps: { blockId: '' } },
];

export const BLOCK_CATEGORIES = [...new Set(BLOCK_DEFINITIONS.map((b) => b.category))];

export function getBlockDefinition(type: string): BlockDefinition | undefined {
	return BLOCK_DEFINITIONS.find((b) => b.type === type);
}

export function createBlock(type: string, id: string): import('../types/blocks').Block {
	const def = getBlockDefinition(type);
	const childrenTypes = ['container', 'oneColumn', 'twoColumns', 'threeColumns', 'fourColumns', 'cardGrid', 'tabs', 'accordion', 'stickySection'];
	return {
		id,
		type,
		props: { ...(def?.defaultProps ?? {}) },
		content: def?.defaultContent,
		children: childrenTypes.includes(type) ? [] : undefined,
	};
}
