import type { PageMeta } from '../../types/blocks';

interface Props {
	meta: PageMeta;
	onChange: (meta: PageMeta) => void;
}

export default function MetadataPanel({ meta, onChange }: Props) {
	const update = (patch: Partial<PageMeta>) => onChange({ ...meta, ...patch });

	return (
		<aside className="metadata-panel">
			<h2>Page Settings</h2>
			<label>Title<input value={meta.title} onChange={(e) => update({ title: e.target.value })} /></label>
			<label>Slug<input value={meta.slug} onChange={(e) => update({ slug: e.target.value })} pattern="[a-z0-9-]+" /></label>
			<label className="checkbox-row"><input type="checkbox" checked={meta.published} onChange={(e) => update({ published: e.target.checked, draft: !e.target.checked ? meta.draft : false })} /> Published</label>
			<label className="checkbox-row"><input type="checkbox" checked={meta.draft} onChange={(e) => update({ draft: e.target.checked, published: e.target.checked ? false : meta.published })} /> Save as Draft</label>
			<label>SEO Title<input value={meta.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} /></label>
			<label>Meta Description<textarea rows={3} value={meta.description} onChange={(e) => update({ description: e.target.value })} /></label>
			<label>Featured Image<input value={meta.featuredImage} onChange={(e) => update({ featuredImage: e.target.value })} placeholder="/uploads/image.jpg" /></label>
			<label>Template
				<select value={meta.template} onChange={(e) => update({ template: e.target.value })}>
					<option value="default">Default</option>
					<option value="full-width">Full Width</option>
					<option value="landing">Landing</option>
				</select>
			</label>
			<label>Author<input value={meta.author} onChange={(e) => update({ author: e.target.value })} /></label>
			<label>Publish Date<input type="date" value={meta.publishDate} onChange={(e) => update({ publishDate: e.target.value })} /></label>
			<label>Last Modified<input type="date" value={meta.updatedAt} readOnly /></label>
		</aside>
	);
}
