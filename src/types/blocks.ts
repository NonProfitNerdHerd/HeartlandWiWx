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

export type PreviewDevice = 'phone' | 'tablet' | 'desktop';

export interface BlockDefinition {
	type: string;
	label: string;
	category: string;
	icon: string;
	defaultProps?: Record<string, unknown>;
	defaultContent?: string;
}
