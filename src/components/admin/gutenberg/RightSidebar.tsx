import { findBlockLocation } from './utils/blockTree';
import { getBlockDefinition } from '../../../lib/blocks/registry';
import type { Block, ContentType, EditorDocument, PageMeta, PostMeta } from '../../../types/blocks';
import BlockSettings from './BlockSettings';

interface Props {
	contentType: ContentType;
	meta: PageMeta | PostMeta;
	onMetaChange: (meta: PageMeta | PostMeta) => void;
	blocks: Block[];
	selectedId: string | null;
	onBlockChange: (id: string, block: Block) => void;
	globalBlockOptions: { id: string; name: string }[];
	formOptions?: { id: string; name: string }[];
	revisions?: { timestamp: number; label: string }[];
	onRestoreRevision?: (timestamp: number) => void;
}

function parseList(value: string): string[] {
	return value
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

function formatList(values: string[]): string {
	return values.join(', ');
}

export default function RightSidebar({
	contentType,
	meta,
	onMetaChange,
	blocks,
	selectedId,
	onBlockChange,
	globalBlockOptions,
	formOptions = [],
	revisions = [],
	onRestoreRevision,
}: Props) {
	const updateMeta = (patch: Partial<PageMeta & PostMeta>) =>
		onMetaChange({ ...meta, ...patch } as PageMeta | PostMeta);

	const location =
		selectedId && selectedId !== '__page__' ? findBlockLocation(blocks, selectedId) : null;
	const selectedBlock = location ? location.blocks[location.index] : null;
	const def = selectedBlock ? getBlockDefinition(selectedBlock.type) : null;
	const settingsLabel = contentType === 'post' ? 'Post' : 'Page';
	const postMeta = contentType === 'post' ? (meta as PostMeta) : null;

	return (
		<aside className="gb-right-sidebar">
			<div className="gb-right-header">
				<h2>{selectedBlock ? (def?.label ?? selectedBlock.type) : settingsLabel}</h2>
				{selectedBlock ? (
					<span className="gb-right-sub">Block settings</span>
				) : (
					<span className="gb-right-sub">{settingsLabel} settings</span>
				)}
			</div>
			<div className="gb-right-content">
				{selectedBlock ? (
					<BlockSettings
						block={selectedBlock}
						onChange={(b) => onBlockChange(selectedBlock.id, b)}
						globalBlockOptions={globalBlockOptions}
						formOptions={formOptions}
					/>
				) : (
					<div className="gb-settings-fields">
						<label>Title <input value={meta.title} onChange={(e) => updateMeta({ title: e.target.value })} /></label>
						<label>Slug <input value={meta.slug} onChange={(e) => updateMeta({ slug: e.target.value })} pattern="[a-z0-9-]+" /></label>
						<label className="gb-checkbox"><input type="checkbox" checked={meta.published} onChange={(e) => updateMeta({ published: e.target.checked, draft: !e.target.checked ? meta.draft : false })} /> Published</label>
						<label className="gb-checkbox"><input type="checkbox" checked={meta.draft} onChange={(e) => updateMeta({ draft: e.target.checked, published: e.target.checked ? false : meta.published })} /> Save as Draft</label>
						<label>SEO Title <input value={meta.seoTitle} onChange={(e) => updateMeta({ seoTitle: e.target.value })} /></label>
						<label>Meta Description <textarea rows={3} value={meta.description} onChange={(e) => updateMeta({ description: e.target.value })} /></label>
						<label>Featured Image <input value={meta.featuredImage} onChange={(e) => updateMeta({ featuredImage: e.target.value })} placeholder="/uploads/image.jpg" /></label>
						{contentType === 'page' ? (
							<label>Template
								<select value={(meta as PageMeta).template} onChange={(e) => updateMeta({ template: e.target.value })}>
									<option value="default">Default</option>
									<option value="full-width">Full Width</option>
									<option value="landing">Landing</option>
								</select>
							</label>
						) : null}
						<label>Author <input value={meta.author} onChange={(e) => updateMeta({ author: e.target.value })} /></label>
						<label>Publish Date <input type="date" value={meta.publishDate} onChange={(e) => updateMeta({ publishDate: e.target.value })} /></label>
						{contentType === 'page' ? (
							<label>Last Modified <input type="date" value={meta.updatedAt} readOnly /></label>
						) : null}
						{postMeta ? (
							<>
								<label>Excerpt <textarea rows={2} value={postMeta.excerpt} onChange={(e) => updateMeta({ excerpt: e.target.value })} /></label>
								<label>Categories <input value={formatList(postMeta.categories)} onChange={(e) => updateMeta({ categories: parseList(e.target.value) })} placeholder="storms, chase-reports" /></label>
								<label>Tags <input value={formatList(postMeta.tags)} onChange={(e) => updateMeta({ tags: parseList(e.target.value) })} placeholder="tornado, wisconsin" /></label>
							</>
						) : null}
					</div>
				)}

				{revisions.length > 0 && (
					<div className="gb-revisions">
						<h3>Revision History</h3>
						<ul>
							{revisions.slice(0, 10).map((rev) => (
								<li key={rev.timestamp}>
									<button type="button" onClick={() => onRestoreRevision?.(rev.timestamp)}>
										{new Date(rev.timestamp).toLocaleString()} — {rev.label}
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</aside>
	);
}
