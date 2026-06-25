const GITHUB_API = 'https://api.github.com';

function githubConfig() {
	const token = import.meta.env.GITHUB_TOKEN;
	const owner = import.meta.env.GITHUB_OWNER;
	const repo = import.meta.env.GITHUB_REPO;
	const branch = import.meta.env.GITHUB_BRANCH || 'main';

	if (!token || !owner || !repo) {
		return null;
	}

	return { token, owner, repo, branch };
}

export function isGitHubConfigured(): boolean {
	return githubConfig() !== null;
}

async function githubFetch(path: string, init: RequestInit = {}): Promise<Response> {
	const config = githubConfig();
	if (!config) {
		throw new Error('GitHub is not configured');
	}

	const response = await fetch(`${GITHUB_API}${path}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${config.token}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'Content-Type': 'application/json',
			...(init.headers ?? {}),
		},
	});

	return response;
}

export interface GitHubFile {
	path: string;
	sha: string;
	content: string;
}

export async function getGitHubFile(path: string): Promise<GitHubFile | null> {
	const config = githubConfig();
	if (!config) return null;

	const response = await githubFetch(
		`/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${config.branch}`,
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`GitHub read failed (${response.status}): ${error}`);
	}

	const data = (await response.json()) as {
		path: string;
		sha: string;
		content: string;
	};

	return {
		path: data.path,
		sha: data.sha,
		content: Buffer.from(data.content, 'base64').toString('utf-8'),
	};
}

export async function listGitHubPageFiles(): Promise<Array<{ path: string; sha: string; name: string }>> {
	const config = githubConfig();
	if (!config) return [];

	const response = await githubFetch(
		`/repos/${config.owner}/${config.repo}/contents/src/content/pages?ref=${config.branch}`,
	);

	if (response.status === 404) {
		return [];
	}

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`GitHub list failed (${response.status}): ${error}`);
	}

	const data = (await response.json()) as Array<{ path: string; sha: string; name: string; type: string }>;
	return data.filter((item) => item.type === 'file' && item.name.endsWith('.md'));
}

export async function putGitHubFile(path: string, content: string, message: string, sha?: string): Promise<void> {
	const config = githubConfig();
	if (!config) {
		throw new Error('GitHub is not configured');
	}

	const body: Record<string, string> = {
		message,
		content: Buffer.from(content, 'utf-8').toString('base64'),
		branch: config.branch,
	};

	if (sha) {
		body.sha = sha;
	}

	const response = await githubFetch(
		`/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`,
		{
			method: 'PUT',
			body: JSON.stringify(body),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`GitHub write failed (${response.status}): ${error}`);
	}
}

export async function deleteGitHubFile(path: string, sha: string, message: string): Promise<void> {
	const config = githubConfig();
	if (!config) {
		throw new Error('GitHub is not configured');
	}

	const response = await githubFetch(
		`/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`,
		{
			method: 'DELETE',
			body: JSON.stringify({
				message,
				sha,
				branch: config.branch,
			}),
		},
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`GitHub delete failed (${response.status}): ${error}`);
	}
}
