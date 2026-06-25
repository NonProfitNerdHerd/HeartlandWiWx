import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, writeJsonFile } from './json-store';
import type { Block } from '../types/blocks';

export interface GlobalBlock {
	id: string;
	name: string;
	description: string;
	blocks: Block[];
	updatedAt: string;
}

export interface GlobalBlocksConfig {
	blocks: GlobalBlock[];
}

export const DEFAULT_GLOBAL_BLOCKS: GlobalBlocksConfig = {
	blocks: [
		{
			id: 'support-us',
			name: 'Support Us',
			description: 'Donation / support CTA',
			updatedAt: new Date().toISOString().slice(0, 10),
			blocks: [
				{
					id: 'support-cta',
					type: 'ctaBanner',
					props: { title: 'Support Heartland Chasers', buttonLabel: 'Support Us', href: '/contact' },
				},
			],
		},
		{
			id: 'newsletter-signup',
			name: 'Newsletter Signup',
			description: 'Email signup CTA',
			updatedAt: new Date().toISOString().slice(0, 10),
			blocks: [
				{
					id: 'newsletter-cta',
					type: 'callout',
					props: { title: 'Stay Updated', variant: 'info' },
					content: '<p>Subscribe for chase updates and forecast discussions.</p>',
				},
			],
		},
		{
			id: 'footer-cta',
			name: 'Footer CTA',
			description: 'Footer call to action',
			updatedAt: new Date().toISOString().slice(0, 10),
			blocks: [
				{
					id: 'footer-cta-inner',
					type: 'ctaBanner',
					props: { title: 'Follow the chase', buttonLabel: 'View Reports', href: '/chase-reports' },
				},
			],
		},
	],
};

const GLOBAL_BLOCKS_PATH = 'content/global-blocks/blocks.json';

export async function getGlobalBlocks(): Promise<{ config: GlobalBlocksConfig; sha?: string }> {
	const { data, sha } = await readJsonFile(GLOBAL_BLOCKS_PATH, DEFAULT_GLOBAL_BLOCKS);
	return { config: data, sha };
}

export async function saveGlobalBlocks(config: GlobalBlocksConfig, sha?: string): Promise<void> {
	await writeJsonFile(GLOBAL_BLOCKS_PATH, config, 'Update global blocks', sha);
}

export function getGlobalBlocksForBuild(): GlobalBlocksConfig {
	const file = path.join(process.cwd(), GLOBAL_BLOCKS_PATH);
	if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
	return DEFAULT_GLOBAL_BLOCKS;
}

export function globalBlocksMap(config: GlobalBlocksConfig): Record<string, Block[]> {
	return Object.fromEntries(config.blocks.map((b) => [b.id, b.blocks]));
}
