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

export function isSafeContentPath(relativePath: string, contentDir: string): boolean {
	const normalized = relativePath.replace(/\\/g, '/');
	const prefix = `${contentDir.replace(/\\/g, '/')}/`;

	if (!normalized.startsWith(prefix)) {
		return false;
	}
	if (normalized.includes('..')) {
		return false;
	}

	const filename = normalized.slice(prefix.length);
	return /^[a-z0-9-]+\.md$/.test(filename);
}

/** @deprecated use isSafeContentPath */
export function isSafePagePath(relativePath: string): boolean {
	return isSafeContentPath(relativePath, 'src/content/pages');
}
