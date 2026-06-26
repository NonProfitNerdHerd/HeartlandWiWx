import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaItem } from '../../../lib/media';

interface Props {
	value: string;
	onChange: (url: string) => void;
	label?: string;
}

export default function MediaPicker({ value, onChange, label = 'Image' }: Props) {
	const [open, setOpen] = useState(false);
	const [items, setItems] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');
	const fileRef = useRef<HTMLInputElement>(null);

	const loadLibrary = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch('/api/media');
			if (!res.ok) throw new Error('Failed to load media library');
			const data = await res.json();
			const images = (data.library?.items ?? []).filter((item: MediaItem) => item.type === 'image');
			setItems(images);
		} catch {
			setError('Could not load media library');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (open) loadLibrary();
	}, [open, loadLibrary]);

	const uploadFile = async (file: File) => {
		setUploading(true);
		setError('');
		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Upload failed');
			onChange(data.url);
			setOpen(false);
			await loadLibrary();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="gb-media-picker">
			<label>{label}</label>
			{value ? (
				<div className="gb-media-picker-preview">
					<img src={value} alt="" />
					<button type="button" className="gb-media-picker-clear" onClick={() => onChange('')}>
						Remove
					</button>
				</div>
			) : (
				<p className="gb-media-picker-empty">No image selected</p>
			)}
			<div className="gb-media-picker-actions">
				<button type="button" className="gb-media-picker-btn" onClick={() => setOpen(!open)}>
					{open ? 'Close library' : 'Choose from library'}
				</button>
				<button
					type="button"
					className="gb-media-picker-btn"
					disabled={uploading}
					onClick={() => fileRef.current?.click()}
				>
					{uploading ? 'Uploading…' : 'Upload image'}
				</button>
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					hidden
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) uploadFile(file);
						e.target.value = '';
					}}
				/>
			</div>
			<label className="gb-media-picker-url">
				Or paste URL
				<input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/photo.jpg" />
			</label>
			{error ? <p className="gb-media-picker-error">{error}</p> : null}
			{open ? (
				<div className="gb-media-picker-grid">
					{loading ? <p className="gb-media-picker-status">Loading…</p> : null}
					{!loading && items.length === 0 ? (
						<p className="gb-media-picker-status">No images in library. Upload one above.</p>
					) : null}
					{items.map((item) => (
						<button
							key={item.id}
							type="button"
							className={`gb-media-picker-item ${value === item.url ? 'is-selected' : ''}`}
							onClick={() => {
								onChange(item.url);
								setOpen(false);
							}}
							title={item.name}
						>
							<img src={item.url} alt={item.alt || item.name} />
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
