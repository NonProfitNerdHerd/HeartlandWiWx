import type { APIRoute } from 'astro';
import { listBlogPosts } from '../../../lib/blog';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const posts = await listBlogPosts();
		return new Response(JSON.stringify({ posts }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to list blog posts';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
