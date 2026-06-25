const GITHUB_API = 'https://api.github.com';

export interface GitHubConfig {
	token: string;
	owner: string;
	repo: string;
	branch: string;
}

function githubConfig(): GitHubConfig | null {
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

export function getGitHubConfigSummary(): string {
	const config = githubConfig();
	if (!config) return 'GitHub not configured';
	return `${config.owner}/${config.repo}@${config.branch}`;
}

function formatGitHubError(status: number, error: string, action: string): string {
	const config = githubConfig();
	const target = config ? `${config.owner}/${config.repo} on branch ${config.branch}` : 'configured repository';

	if (status === 404) {
		return `GitHub ${action} failed (404): Could not access ${target}. Check GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, and that your token has Contents read/write access. Details: ${error}`;
	}

	return `GitHub ${action} failed (${status}) for ${target}: ${error}`;
}

function contentsPath(path: string): string {
	return path.split('/').map(encodeURIComponent).join('/');
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
		`/repos/${config.owner}/${config.repo}/contents/${contentsPath(path)}?ref=${encodeURIComponent(config.branch)}`,
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		const error = await response.text();
		throw new Error(formatGitHubError(response.status, error, 'read'));
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

export async function listGitHubDirectory(directory: string): Promise<Array<{ path: string; sha: string; name: string }>> {
	const config = githubConfig();
	if (!config) return [];

	const response = await githubFetch(
		`/repos/${config.owner}/${config.repo}/contents/${contentsPath(directory)}?ref=${encodeURIComponent(config.branch)}`,
	);

	if (response.status === 404) {
		return [];
	}

	if (!response.ok) {
		const error = await response.text();
		throw new Error(formatGitHubError(response.status, error, 'list'));
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

	const response = await githubFetch(`/repos/${config.owner}/${config.repo}/contents/${contentsPath(path)}`, {
		method: 'PUT',
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(formatGitHubError(response.status, error, 'write'));
	}
}

export async function deleteGitHubFile(path: string, sha: string, message: string): Promise<void> {
	const config = githubConfig();
	if (!config) {
		throw new Error('GitHub is not configured');
	}

	const response = await githubFetch(`/repos/${config.owner}/${config.repo}/contents/${contentsPath(path)}`, {
		method: 'DELETE',
		body: JSON.stringify({
			message,
			sha,
			branch: config.branch,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(formatGitHubError(response.status, error, 'delete'));
	}
}
