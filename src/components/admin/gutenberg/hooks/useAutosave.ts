import { useCallback, useEffect, useRef } from 'react';
import type { PageDocument } from '../../../types/blocks';

const DRAFT_PREFIX = 'gutenberg-draft-';
const REVISION_PREFIX = 'gutenberg-revisions-';

interface Revision {
	timestamp: number;
	label: string;
	document: PageDocument;
}

export function useAutosave(slug: string, doc: PageDocument, dirty: boolean) {
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSaved = useRef<string>(JSON.stringify(doc));

	useEffect(() => {
		if (!dirty) return;
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			const key = `${DRAFT_PREFIX}${slug}`;
			localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), doc }));
			saveRevision(slug, doc, 'Auto-save');
			lastSaved.current = JSON.stringify(doc);
		}, 3000);
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [doc, dirty, slug]);

	const clearDraft = useCallback(() => {
		localStorage.removeItem(`${DRAFT_PREFIX}${slug}`);
	}, [slug]);

	return { clearDraft };
}

export function getDraftRecovery(slug: string): { savedAt: number; doc: PageDocument } | null {
	try {
		const raw = localStorage.getItem(`${DRAFT_PREFIX}${slug}`);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function saveRevision(slug: string, doc: PageDocument, label: string) {
	try {
		const key = `${REVISION_PREFIX}${slug}`;
		const existing: Revision[] = JSON.parse(localStorage.getItem(key) ?? '[]');
		const next: Revision[] = [
			{ timestamp: Date.now(), label, document: doc },
			...existing,
		].slice(0, 20);
		localStorage.setItem(key, JSON.stringify(next));
	} catch {
		/* ignore */
	}
}

export function getRevisions(slug: string): Revision[] {
	try {
		return JSON.parse(localStorage.getItem(`${REVISION_PREFIX}${slug}`) ?? '[]');
	} catch {
		return [];
	}
}

export function saveManualRevision(slug: string, doc: PageDocument) {
	saveRevision(slug, doc, 'Manual save');
}
