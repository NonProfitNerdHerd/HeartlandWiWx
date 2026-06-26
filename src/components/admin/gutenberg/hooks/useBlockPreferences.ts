import { useCallback, useEffect, useState } from 'react';

const FAVORITES_KEY = 'gutenberg-block-favorites';
const RECENT_KEY = 'gutenberg-block-recent';

export function useBlockPreferences() {
	const [favorites, setFavorites] = useState<string[]>([]);
	const [recent, setRecent] = useState<string[]>([]);

	useEffect(() => {
		try {
			setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'));
			setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'));
		} catch {
			/* ignore */
		}
	}, []);

	const toggleFavorite = useCallback((type: string) => {
		setFavorites((prev) => {
			const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
			return next;
		});
	}, []);

	const recordRecent = useCallback((type: string) => {
		setRecent((prev) => {
			const next = [type, ...prev.filter((t) => t !== type)].slice(0, 8);
			localStorage.setItem(RECENT_KEY, JSON.stringify(next));
			return next;
		});
	}, []);

	return { favorites, recent, toggleFavorite, recordRecent };
}
