import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, writeJsonFile } from './json-store';

export interface ThemeTypography {
	fontFamily: string;
	fontWeight: string;
	letterSpacing: string;
	lineHeight: string;
	sizeDesktop: string;
	sizeTablet: string;
	sizeMobile: string;
}

export interface ThemeButtons {
	borderRadius: string;
	paddingX: string;
	paddingY: string;
	fontWeight: string;
	hoverScale: number;
	transition: string;
	shadow: string;
}

export interface ThemeConfig {
	colors: {
		primary: string;
		secondary: string;
		accent: string;
		background: string;
		surface: string;
		text: string;
		mutedText: string;
		warning: string;
		danger: string;
		success: string;
		info: string;
	};
	typography: {
		heading: ThemeTypography;
		body: ThemeTypography;
		button: ThemeTypography;
		navigation: ThemeTypography;
		code: ThemeTypography;
	};
	buttons: {
		primary: ThemeButtons;
		secondary: ThemeButtons;
		outline: ThemeButtons;
		ghost: ThemeButtons;
		danger: ThemeButtons;
	};
	spacing: {
		sectionY: string;
		containerX: string;
		blockGap: string;
	};
	borderRadius: {
		sm: string;
		md: string;
		lg: string;
		xl: string;
	};
	animations: {
		enabled: boolean;
		duration: string;
		easing: string;
	};
	darkMode: {
		enabled: boolean;
	};
	globalCss: string;
}

export const DEFAULT_THEME: ThemeConfig = {
	colors: {
		primary: '#2563eb',
		secondary: '#1e293b',
		accent: '#f59e0b',
		background: '#000000',
		surface: '#111111',
		text: '#ffffff',
		mutedText: '#a3a3a3',
		warning: '#f59e0b',
		danger: '#ef4444',
		success: '#22c55e',
		info: '#3b82f6',
	},
	typography: {
		heading: { fontFamily: 'Inter', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.2', sizeDesktop: '2.5rem', sizeTablet: '2rem', sizeMobile: '1.75rem' },
		body: { fontFamily: 'Inter', fontWeight: '400', letterSpacing: '0', lineHeight: '1.6', sizeDesktop: '1rem', sizeTablet: '1rem', sizeMobile: '1rem' },
		button: { fontFamily: 'Inter', fontWeight: '600', letterSpacing: '0', lineHeight: '1', sizeDesktop: '0.95rem', sizeTablet: '0.95rem', sizeMobile: '0.9rem' },
		navigation: { fontFamily: 'Inter', fontWeight: '500', letterSpacing: '0', lineHeight: '1', sizeDesktop: '0.95rem', sizeTablet: '0.95rem', sizeMobile: '0.9rem' },
		code: { fontFamily: 'JetBrains Mono', fontWeight: '400', letterSpacing: '0', lineHeight: '1.5', sizeDesktop: '0.875rem', sizeTablet: '0.875rem', sizeMobile: '0.875rem' },
	},
	buttons: {
		primary: { borderRadius: '6px', paddingX: '1rem', paddingY: '0.65rem', fontWeight: '600', hoverScale: 1.02, transition: '0.2s ease', shadow: 'none' },
		secondary: { borderRadius: '6px', paddingX: '1rem', paddingY: '0.65rem', fontWeight: '600', hoverScale: 1.02, transition: '0.2s ease', shadow: 'none' },
		outline: { borderRadius: '6px', paddingX: '1rem', paddingY: '0.65rem', fontWeight: '600', hoverScale: 1.02, transition: '0.2s ease', shadow: 'none' },
		ghost: { borderRadius: '6px', paddingX: '1rem', paddingY: '0.65rem', fontWeight: '600', hoverScale: 1.02, transition: '0.2s ease', shadow: 'none' },
		danger: { borderRadius: '6px', paddingX: '1rem', paddingY: '0.65rem', fontWeight: '600', hoverScale: 1.02, transition: '0.2s ease', shadow: 'none' },
	},
	spacing: { sectionY: '4rem', containerX: '1.5rem', blockGap: '1.5rem' },
	borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
	animations: { enabled: true, duration: '0.2s', easing: 'ease' },
	darkMode: { enabled: true },
	globalCss: '',
};

const THEME_PATH = 'content/theme/theme.json';

export async function getTheme(): Promise<{ theme: ThemeConfig; sha?: string }> {
	const { data, sha } = await readJsonFile(THEME_PATH, DEFAULT_THEME);
	return { theme: data, sha };
}

export async function saveTheme(theme: ThemeConfig, sha?: string): Promise<void> {
	await writeJsonFile(THEME_PATH, theme, 'Update site theme', sha);
}

export function getThemeForBuild(): ThemeConfig {
	const file = path.join(process.cwd(), THEME_PATH);
	if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
	return DEFAULT_THEME;
}

export function themeToCssVariables(theme: ThemeConfig): string {
	const lines = Object.entries(theme.colors).map(([key, value]) => `--color-${key}: ${value};`);
	const typo = theme.typography;
	lines.push(`--font-heading: '${typo.heading.fontFamily}', sans-serif;`);
	lines.push(`--font-body: '${typo.body.fontFamily}', sans-serif;`);
	lines.push(`--font-button: '${typo.button.fontFamily}', sans-serif;`);
	lines.push(`--font-nav: '${typo.navigation.fontFamily}', sans-serif;`);
	lines.push(`--font-code: '${typo.code.fontFamily}', monospace;`);
	lines.push(`--radius-md: ${theme.borderRadius.md};`);
	lines.push(`--space-section: ${theme.spacing.sectionY};`);
	lines.push(`--space-block: ${theme.spacing.blockGap};`);
	return `:root {\n  ${lines.join('\n  ')}\n}\n${theme.globalCss}`;
}
