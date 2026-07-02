import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { getMediaLibrary, saveMediaLibrary, type MediaItem } from '../../../lib/media';

export const prerender = false;

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 10 * 1024 * 1024;

function safeFilename(name: string): string {
	return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 120);
}

export const POST: APIRoute = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file');

	if (!(file instanceof File) || file.size === 0) {
		return new Response(JSON.stringify({ error: 'No file provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (file.size > MAX_BYTES) {
		return new Response(JSON.stringify({ error: 'File exceeds 10MB limit' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (!file.type.startsWith('image/')) {
		return new Response(JSON.stringify({ error: 'Only image uploads are supported' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	fs.mkdirSync(UPLOAD_DIR, { recursive: true });

	const ext = path.extname(file.name) || '.jpg';
	const filename = `${Date.now()}-${nanoid(6)}${ext}`;
	const filepath = path.join(UPLOAD_DIR, filename);
	const buffer = Buffer.from(await file.arrayBuffer());
	fs.writeFileSync(filepath, buffer);

	const url = `/uploads/${filename}`;
	const addToLibrary = formData.get('addToLibrary') !== 'false';

	let item: MediaItem | undefined;
	if (addToLibrary) {
		const { library, sha } = await getMediaLibrary();
		item = {
			id: nanoid(10),
			name: file.name || filename,
			url,
			type: 'image',
			alt: String(formData.get('alt') ?? ''),
			caption: '',
			folder: String(formData.get('folder') ?? 'general'),
			createdAt: new Date().toISOString().slice(0, 10),
		};
		library.items.unshift(item);
		await saveMediaLibrary(library, sha);
	}

	return new Response(JSON.stringify({ url, item }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
