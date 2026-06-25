const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
	return SLUG_PATTERN.test(slug) && slug.length <= 64;
}

export function slugToFilename(slug: string): string {
	if (!isValidSlug(slug)) {
		throw new Error('Invalid slug. Use lowercase letters, numbers, and hyphens only.');
	}
	return `${slug}.md`;
}

export function isSafePagePath(relativePath: string): boolean {
	const normalized = relativePath.replace(/\\/g, '/');
	if (!normalized.startsWith('src/content/pages/')) {
		return false;
	}
	if (normalized.includes('..')) {
		return false;
	}
	const filename = normalized.slice('src/content/pages/'.length);
	return /^[a-z0-9-]+\.md$/.test(filename);
}
