import { BLOG_CONTENT_DIR } from './constants';
import { createContentService, type ContentListItem, type ContentRecord } from './cms';

export interface BlogRecord extends ContentRecord {
	date: string;
	excerpt: string;
	featuredImage: string;
}

export type BlogListItem = ContentListItem & { date: string };

const blogService = createContentService({
	contentDir: BLOG_CONTENT_DIR,
	label: 'blog post',
	extraFrontmatter: (record) => ({
		date: String(record.date ?? record.updatedAt),
		excerpt: String(record.excerpt ?? ''),
		featuredImage: String(record.featuredImage ?? ''),
		status: record.published ? 'published' : 'draft',
	}),
	parseExtra: (data, record) => {
		record.date = String(data.date ?? record.updatedAt).slice(0, 10);
		record.excerpt = String(data.excerpt ?? '');
		record.featuredImage = String(data.featuredImage ?? '');
		record.published = data.status !== 'draft';
	},
});

export async function listBlogPosts(): Promise<BlogListItem[]> {
	const posts = await blogService.listItems();
	const detailed = await Promise.all(
		posts.map(async (post) => {
			const full = await getBlogPost(post.slug);
			return {
				...post,
				date: full?.date ?? post.updatedAt,
			};
		}),
	);
	return detailed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPost(slug: string): Promise<BlogRecord | null> {
	const post = await blogService.getItem(slug);
	if (!post) return null;
	return post as BlogRecord;
}

export async function saveBlogPost(post: BlogRecord, originalSlug?: string): Promise<void> {
	return blogService.saveItem(post, originalSlug);
}

export async function blogPostExists(slug: string): Promise<boolean> {
	return blogService.itemExists(slug);
}

export { blogService };
