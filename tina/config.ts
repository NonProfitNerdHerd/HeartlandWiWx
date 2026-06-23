import { defineConfig } from 'tinacms';

const branch =
	process.env.GITHUB_BRANCH ||
	process.env.VERCEL_GIT_COMMIT_REF ||
	process.env.HEAD ||
	'main';

export default defineConfig({
	branch,
	clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || process.env.PUBLIC_TINA_CLIENT_ID || null,
	token: process.env.TINA_TOKEN || null,
	build: {
		outputFolder: 'admin',
		publicFolder: 'public',
	},
	media: {
		tina: {
			mediaRoot: 'uploads',
			publicFolder: 'public',
		},
	},
	schema: {
		collections: [
			{
				name: 'page',
				label: 'Pages',
				path: 'content/pages',
				format: 'md',
				ui: {
					router: ({ document }) => {
						const slug = (document.slug as string) || document._sys.filename;
						return slug === 'home' ? '/' : `/${slug}`;
					},
				},
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Title',
						isTitle: true,
						required: true,
					},
					{
						type: 'string',
						name: 'slug',
						label: 'Slug',
						required: true,
						description: 'URL path. Use "home" for the homepage.',
					},
					{
						type: 'string',
						name: 'menuLabel',
						label: 'Menu Label',
					},
					{
						type: 'boolean',
						name: 'showInMenu',
						label: 'Show in Menu',
					},
					{
						type: 'number',
						name: 'menuOrder',
						label: 'Menu Order',
					},
					{
						type: 'string',
						name: 'seoTitle',
						label: 'SEO Title',
					},
					{
						type: 'string',
						name: 'seoDescription',
						label: 'SEO Description',
						ui: { component: 'textarea' },
					},
					{
						type: 'rich-text',
						name: 'body',
						label: 'Body',
						isBody: true,
					},
				],
			},
			{
				name: 'chaseReport',
				label: 'Chase Reports',
				path: 'content/chase-reports',
				format: 'md',
				ui: {
					router: ({ document }) => {
						const slug = (document.slug as string) || document._sys.filename;
						return `/chase-reports/${slug}`;
					},
				},
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Title',
						isTitle: true,
						required: true,
					},
					{
						type: 'string',
						name: 'slug',
						label: 'Slug',
						required: true,
					},
					{
						type: 'datetime',
						name: 'date',
						label: 'Date',
						required: true,
					},
					{
						type: 'string',
						name: 'excerpt',
						label: 'Excerpt',
						ui: { component: 'textarea' },
					},
					{
						type: 'image',
						name: 'featuredImage',
						label: 'Featured Image',
					},
					{
						type: 'string',
						name: 'status',
						label: 'Status',
						options: [
							{ label: 'Draft', value: 'draft' },
							{ label: 'Published', value: 'published' },
						],
						required: true,
					},
					{
						type: 'rich-text',
						name: 'body',
						label: 'Body',
						isBody: true,
					},
				],
			},
			{
				name: 'settings',
				label: 'Site Settings',
				path: 'content/settings',
				format: 'json',
				ui: {
					global: true,
					allowedActions: {
						create: false,
						delete: false,
					},
				},
				fields: [
					{
						type: 'string',
						name: 'siteTitle',
						label: 'Site Title',
						required: true,
					},
					{
						type: 'string',
						name: 'tagline',
						label: 'Tagline',
					},
					{
						type: 'string',
						name: 'youtubeUrl',
						label: 'YouTube URL',
					},
					{
						type: 'string',
						name: 'xUrl',
						label: 'X (Twitter) URL',
					},
					{
						type: 'string',
						name: 'supportUrl',
						label: 'Support URL',
					},
					{
						type: 'string',
						name: 'liveStreamEmbedUrl',
						label: 'Live Stream Embed URL',
					},
				],
			},
		],
	},
});
