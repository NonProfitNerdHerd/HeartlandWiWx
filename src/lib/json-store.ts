import fs from 'node:fs';
import path from 'node:path';
import {
	deleteGitHubFile,
	getGitHubFile,
	isGitHubConfigured,
	putGitHubFile,
} from './github';

export async function readJsonFile<T>(relativePath: string, fallback: T): Promise<{ data: T; sha?: string }> {
	if (isGitHubConfigured()) {
		const remote = await getGitHubFile(relativePath);
		if (remote) {
			return { data: JSON.parse(remote.content) as T, sha: remote.sha };
		}
	}

	const localPath = path.join(process.cwd(), relativePath);
	if (fs.existsSync(localPath)) {
		const raw = fs.readFileSync(localPath, 'utf-8');
		return { data: JSON.parse(raw) as T };
	}

	return { data: fallback };
}

export async function writeJsonFile<T>(relativePath: string, data: T, message: string, sha?: string): Promise<void> {
	const content = `${JSON.stringify(data, null, 2)}\n`;

	if (isGitHubConfigured()) {
		const existing = sha ? { sha } : await getGitHubFile(relativePath);
		await putGitHubFile(relativePath, content, message, existing?.sha);
		return;
	}

	const localPath = path.join(process.cwd(), relativePath);
	fs.mkdirSync(path.dirname(localPath), { recursive: true });
	fs.writeFileSync(localPath, content, 'utf-8');
}

export async function deleteJsonFile(relativePath: string, message: string): Promise<void> {
	if (isGitHubConfigured()) {
		const existing = await getGitHubFile(relativePath);
		if (existing) {
			await deleteGitHubFile(relativePath, existing.sha, message);
		}
		return;
	}

	const localPath = path.join(process.cwd(), relativePath);
	if (fs.existsSync(localPath)) {
		fs.unlinkSync(localPath);
	}
}

export function isSafeJsonPath(relativePath: string, allowedPrefixes: string[]): boolean {
	const normalized = relativePath.replace(/\\/g, '/');
	if (normalized.includes('..')) return false;
	return allowedPrefixes.some((prefix) => normalized.startsWith(prefix) && normalized.endsWith('.json'));
}
