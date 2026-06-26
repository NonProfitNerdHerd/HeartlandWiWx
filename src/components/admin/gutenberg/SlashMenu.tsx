import { useEffect, useRef } from 'react';
import { BLOCK_DEFINITIONS, searchBlocks } from '../../../lib/blocks/registry';

interface Props {
	query: string;
	position: DOMRect | null;
	onSelect: (type: string) => void;
	onClose: () => void;
}

export default function SlashMenu({ query, position, onSelect, onClose }: Props) {
	const menuRef = useRef<HTMLDivElement>(null);
	const results = searchBlocks(query).slice(0, 8);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [onClose]);

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
		};
		document.addEventListener('mousedown', onClick);
		return () => document.removeEventListener('mousedown', onClick);
	}, [onClose]);

	if (!position) return null;

	const style: React.CSSProperties = {
		position: 'fixed',
		top: position.bottom + 4,
		left: position.left,
		zIndex: 100,
	};

	return (
		<div ref={menuRef} className="gb-slash-menu" style={style} role="listbox">
			<div className="gb-slash-menu-header">Blocks</div>
			{results.length === 0 ? (
				<div className="gb-slash-menu-empty">No blocks found</div>
			) : (
				results.map((block) => (
					<button
						key={block.type}
						type="button"
						className="gb-slash-menu-item"
						onClick={() => onSelect(block.type)}
					>
						<span className="gb-slash-menu-icon">{block.icon}</span>
						<span className="gb-slash-menu-text">
							<strong>{block.label}</strong>
							<small>{block.description}</small>
						</span>
					</button>
				))
			)}
		</div>
	);
}
