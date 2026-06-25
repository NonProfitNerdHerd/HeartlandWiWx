import type { APIRoute } from 'astro';
import { blogPostExists, getBlogPost, saveBlogPost, type BlogRecord } from '../../../lib/blog';
import { isValidSlug } from '../../../lib/slug';

export const prerender = false;

function parseBlogPayload(body: unknown): BlogRecord {
	const data = body as Partial<BlogRecord>;
	return {
		title: String(data.title ?? '').trim(),
		slug: String(data.slug ?? '').trim(),
		seoTitle: String(data.seoTitle ?? '').trim() || String(data.title ?? '').trim(),
		description: String(data.description ?? '').trim() || String(data.excerpt ?? '').trim(),
		body: String(data.body ?? ''),
		published: data.published !== false,
		updatedAt: String(data.updatedAt ?? new Date().toISOString().slice(0, 10)),
		date: String(data.date ?? new Date().toISOString().slice(0, 10)),
		excerpt: String(data.excerpt ?? ''),
		featuredImage: String(data.featuredImage ?? ''),
	};
}

export const GET: APIRoute = async ({ params }) => {
	const slug = params.slug ?? '';
	if (!isValidSlug(slug)) {
		return new Response(JSON.stringify({ error: 'Invalid slug' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const post = await getBlogPost(slug);
		if (!post) {
			return new Response(JSON.stringify({ error: 'Blog post not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ post }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load blog post';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const PUT: APIRoute = async ({ params, request }) => {
	const originalSlug = params.slug ?? '';
	const body = await request.json();
	const post = parseBlogPayload(body);

	if (!isValidSlug(post.slug)) {
		return new Response(JSON.stringify({ error: 'Invalid slug' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		if (originalSlug === 'new') {
			if (await blogPostExists(post.slug)) {
				return new Response(JSON.stringify({ error: 'A blog post with this slug already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			await saveBlogPost(post);
		} else {
			const existing = await getBlogPost(originalSlug);
			if (!existing) {
				return new Response(JSON.stringify({ error: 'Blog post not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			if (originalSlug !== post.slug && (await blogPostExists(post.slug))) {
				return new Response(JSON.stringify({ error: 'A blog post with this slug already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			await saveBlogPost(post, originalSlug);
		}

		return new Response(JSON.stringify({ ok: true, slug: post.slug }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to save blog post';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const POST: APIRoute = PUT;
