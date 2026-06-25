import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface Props {
	content: string;
	onChange: (html: string) => void;
	placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: Props) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link.configure({ openOnClick: false }),
			Image,
			Placeholder.configure({ placeholder }),
		],
		content,
		onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
		editorProps: {
			attributes: { class: 'rich-editor-content' },
		},
	});

	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content, { emitUpdate: false });
		}
	}, [content, editor]);

	if (!editor) return null;

	return (
		<div className="rich-editor">
			<div className="rich-editor-toolbar">
				<button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>B</button>
				<button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>I</button>
				<button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}>U</button>
				<button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
				<button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}>H3</button>
				<button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>• List</button>
				<button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>1. List</button>
				<button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''}>&ldquo;</button>
				<button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</button>
			</div>
			<EditorContent editor={editor} />
		</div>
	);
}
