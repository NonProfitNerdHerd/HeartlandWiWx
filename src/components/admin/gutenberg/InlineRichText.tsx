import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

interface Props {
	content: string;
	onChange: (html: string) => void;
	onEnter?: () => void;
	onSlash?: (query: string, rect: DOMRect) => void;
	onSlashClose?: () => void;
	onFocus?: () => void;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
}

function FormatToolbar({ editor }: { editor: Editor }) {
	const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

	useEffect(() => {
		const update = () => {
			const { from, to, empty } = editor.state.selection;
			if (empty || !editor.isEditable) {
				setPos(null);
				return;
			}
			const start = editor.view.coordsAtPos(from);
			const end = editor.view.coordsAtPos(to);
			setPos({
				top: Math.min(start.top, end.top) - 44,
				left: (start.left + end.left) / 2,
			});
		};

		editor.on('selectionUpdate', update);
		editor.on('blur', () => setPos(null));
		return () => {
			editor.off('selectionUpdate', update);
			editor.off('blur', () => setPos(null));
		};
	}, [editor]);

	if (!pos) return null;

	const setLink = () => {
		const prev = editor.getAttributes('link').href as string | undefined;
		const url = window.prompt('URL', prev ?? 'https://');
		if (url === null) return;
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	};

	return (
		<div
			className="gb-bubble-menu gb-floating-toolbar"
			style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 100 }}
			onMouseDown={(e) => e.preventDefault()}
		>
			<button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} title="Bold">B</button>
			<button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} title="Italic"><em>I</em></button>
			<button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''} title="Underline"><u>U</u></button>
			<button type="button" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''} title="Link">🔗</button>
			<span className="gb-bubble-sep" />
			<button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} title="Heading">H</button>
			<button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="Bullet list">•</button>
			<button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} title="Numbered list">1.</button>
			<button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''} title="Quote">&ldquo;</button>
			<button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'is-active' : ''} title="Code">&lt;/&gt;</button>
			<button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">✕</button>
		</div>
	);
}

export default function InlineRichText({
	content,
	onChange,
	onEnter,
	onSlash,
	onSlashClose,
	onFocus,
	placeholder = 'Type / to choose a block',
	className = '',
	autoFocus = false,
}: Props) {
	const slashActive = useRef(false);
	const editorRef = useRef<Editor | null>(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
			Underline,
			Link.configure({ openOnClick: false }),
			Placeholder.configure({ placeholder }),
		],
		content,
		onUpdate: ({ editor: ed }) => {
			onChange(ed.getHTML());
			const text = ed.getText();
			if (text.startsWith('/') && onSlash) {
				slashActive.current = true;
				const { from } = ed.state.selection;
				const coords = ed.view.coordsAtPos(from);
				onSlash(text.slice(1), new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top));
			} else if (slashActive.current && onSlashClose) {
				slashActive.current = false;
				onSlashClose();
			}
		},
		onFocus: () => onFocus?.(),
		editorProps: {
			attributes: { class: `gb-inline-content ${className}` },
			handleKeyDown: (_view, event) => {
				const ed = editorRef.current;
				if (!ed) return false;
				if (event.key === 'Enter' && !event.shiftKey) {
					const isEmpty = ed.isEmpty;
					const atEnd = ed.state.selection.$head.parentOffset === ed.state.selection.$head.parent.content.size;
					if (!isEmpty && atEnd && onEnter) {
						event.preventDefault();
						onEnter();
						return true;
					}
				}
				return false;
			},
		},
	});

	useEffect(() => {
		editorRef.current = editor;
	}, [editor]);

	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content, { emitUpdate: false });
		}
	}, [content, editor]);

	useEffect(() => {
		if (editor && autoFocus) {
			editor.commands.focus('end');
		}
	}, [editor, autoFocus]);

	if (!editor) return null;

	return (
		<div className="gb-inline-editor">
			<FormatToolbar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
}
