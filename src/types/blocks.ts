export interface Block {
	id: string;
	type: string;
	props: Record<string, unknown>;
	content?: string;
	children?: Block[];
}

export interface PageMeta {
	title: string;
	slug: string;
	seoTitle: string;
	description: string;
	published: boolean;
	draft: boolean;
	featuredImage: string;
	template: string;
	author: string;
	publishDate: string;
	updatedAt: string;
	menuLabel?: string;
	showInMenu?: boolean;
	menuOrder?: number;
}

export interface PageDocument {
	meta: PageMeta;
	blocks: Block[];
}

export interface PostMeta {
	title: string;
	slug: string;
	seoTitle: string;
	description: string;
	published: boolean;
	draft: boolean;
	featuredImage: string;
	author: string;
	publishDate: string;
	updatedAt: string;
	excerpt: string;
	categories: string[];
	tags: string[];
}

export interface PostDocument {
	meta: PostMeta;
	blocks: Block[];
}

export type ContentType = 'page' | 'post';

export type EditorDocument = PageDocument | PostDocument;

export interface InsertContext {
	parentId: string | null;
	index: number;
	replaceBlockId?: string;
	anchor: DOMRect;
	query?: string;
}

export type PreviewDevice = 'phone' | 'tablet' | 'desktop';

export interface BlockDefinition {
	type: string;
	label: string;
	category: string;
	icon: string;
	description?: string;
	keywords?: string[];
	defaultProps?: Record<string, unknown>;
	defaultContent?: string;
}

export type LeftSidebarTab = 'inserter' | 'list';
export type EditorMode = 'edit' | 'structure';

export interface FlatBlockNode {
	block: Block;
	depth: number;
	parentId: string | null;
	index: number;
	path: number[];
}
