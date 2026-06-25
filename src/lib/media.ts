import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, writeJsonFile } from './json-store';

export interface MediaItem {
	id: string;
	name: string;
	url: string;
	type: 'image' | 'pdf' | 'video' | 'document';
	alt: string;
	caption: string;
	folder: string;
	createdAt: string;
}

export interface MediaLibrary {
	items: MediaItem[];
	folders: string[];
}

export const DEFAULT_MEDIA: MediaLibrary = {
	items: [],
	folders: ['general', 'gallery', 'blog'],
};

const MEDIA_PATH = 'content/media/library.json';

export async function getMediaLibrary(): Promise<{ library: MediaLibrary; sha?: string }> {
	const { data, sha } = await readJsonFile(MEDIA_PATH, DEFAULT_MEDIA);
	return { library: data, sha };
}

export async function saveMediaLibrary(library: MediaLibrary, sha?: string): Promise<void> {
	await writeJsonFile(MEDIA_PATH, library, 'Update media library', sha);
}

export function getMediaLibraryForBuild(): MediaLibrary {
	const file = path.join(process.cwd(), MEDIA_PATH);
	if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
	return DEFAULT_MEDIA;
}
