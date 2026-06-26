import { useCallback, useRef, useState } from 'react';

export function useEditorHistory<T>(initial: T) {
	const [state, setStateInternal] = useState(initial);
	const past = useRef<T[]>([]);
	const future = useRef<T[]>([]);
	const skipNext = useRef(false);

	const [revision, setRevision] = useState(0);

	const bump = () => setRevision((r) => r + 1);

	const setState = useCallback((next: T | ((prev: T) => T), skipHistory = false) => {
		setStateInternal((prev) => {
			const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
			if (!skipHistory && !skipNext.current && resolved !== prev) {
				past.current = [...past.current, prev].slice(-100);
				future.current = [];
				bump();
			}
			skipNext.current = false;
			return resolved;
		});
	}, []);

	const undo = useCallback(() => {
		if (past.current.length === 0) return;
		setStateInternal((current) => {
			const previous = past.current[past.current.length - 1];
			past.current = past.current.slice(0, -1);
			future.current = [...future.current, current];
			skipNext.current = true;
			bump();
			return previous;
		});
	}, []);

	const redo = useCallback(() => {
		if (future.current.length === 0) return;
		setStateInternal((current) => {
			const next = future.current[future.current.length - 1];
			future.current = future.current.slice(0, -1);
			past.current = [...past.current, current];
			skipNext.current = true;
			bump();
			return next;
		});
	}, []);

	const reset = useCallback((next: T) => {
		past.current = [];
		future.current = [];
		setStateInternal(next);
		bump();
	}, []);

	return {
		state,
		setState,
		undo,
		redo,
		reset,
		canUndo: past.current.length > 0,
		canRedo: future.current.length > 0,
		revision,
	};
}
