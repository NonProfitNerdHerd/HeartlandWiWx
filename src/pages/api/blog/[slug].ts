import type { APIRoute } from 'astro';
import {
	getPostDocument,
	postDocumentExists,
	savePostDocument,
	type PostDocument,
} from '../../../lib/blog-document';
import { isValidSlug } from '../../../lib/slug';

export const prerender = false;

function isPostDocument(body: unknown): body is PostDocument {
	const doc = body as PostDocument;
	return Boolean(doc?.meta?.slug && Array.isArray(doc?.blocks));
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
		const post = await getPostDocument(slug);
		if (!post) {
			return new Response(JSON.stringify({ error: 'Blog post not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ post: post.doc }), {
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

	if (!isPostDocument(body)) {
		return new Response(JSON.stringify({ error: 'Invalid post document' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const doc = body as PostDocument;

	if (!isValidSlug(doc.meta.slug)) {
		return new Response(JSON.stringify({ error: 'Invalid slug' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		if (originalSlug === 'new') {
			if (await postDocumentExists(doc.meta.slug)) {
				return new Response(JSON.stringify({ error: 'A blog post with this slug already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			await savePostDocument(doc);
		} else {
			const existing = await getPostDocument(originalSlug);
			if (!existing) {
				return new Response(JSON.stringify({ error: 'Blog post not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			if (originalSlug !== doc.meta.slug && (await postDocumentExists(doc.meta.slug))) {
				return new Response(JSON.stringify({ error: 'A blog post with this slug already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			await savePostDocument(doc, originalSlug);
		}

		return new Response(JSON.stringify({ ok: true, slug: doc.meta.slug }), {
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
