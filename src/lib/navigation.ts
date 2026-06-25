import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, writeJsonFile } from './json-store';

export interface NavItem {
	id: string;
	label: string;
	href: string;
	external?: boolean;
	icon?: string;
	openInNewTab?: boolean;
	children?: NavItem[];
}

export interface NavigationConfig {
	items: NavItem[];
}

export const DEFAULT_HEADER_NAV: NavigationConfig = {
	items: [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'about', label: 'About', href: '/about' },
		{ id: 'gallery', label: 'Gallery', href: '/gallery' },
		{ id: 'contact', label: 'Contact', href: '/contact' },
		{ id: 'chase-reports', label: 'Chase Reports', href: '/chase-reports' },
	],
};

export const DEFAULT_FOOTER_NAV: NavigationConfig = {
	items: [
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'about', label: 'About', href: '/about' },
		{ id: 'contact', label: 'Contact', href: '/contact' },
	],
};

export const DEFAULT_MOBILE_NAV: NavigationConfig = DEFAULT_HEADER_NAV;

const PATHS = {
	header: 'content/navigation/header.json',
	footer: 'content/navigation/footer.json',
	mobile: 'content/navigation/mobile.json',
} as const;

export type NavMenu = keyof typeof PATHS;

export async function getNavigation(menu: NavMenu): Promise<{ nav: NavigationConfig; sha?: string }> {
	const defaults = menu === 'header' ? DEFAULT_HEADER_NAV : menu === 'footer' ? DEFAULT_FOOTER_NAV : DEFAULT_MOBILE_NAV;
	return readJsonFile(PATHS[menu], defaults);
}

export async function saveNavigation(menu: NavMenu, nav: NavigationConfig, sha?: string): Promise<void> {
	await writeJsonFile(PATHS[menu], nav, `Update ${menu} navigation`, sha);
}

export function getNavigationForBuild(menu: NavMenu): NavigationConfig {
	const file = path.join(process.cwd(), PATHS[menu]);
	const defaults = menu === 'header' ? DEFAULT_HEADER_NAV : menu === 'footer' ? DEFAULT_FOOTER_NAV : DEFAULT_MOBILE_NAV;
	if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
	return defaults;
}
