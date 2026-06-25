import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, writeJsonFile } from './json-store';

export interface SiteTextLabels {
	menuLinks: string;
	footerText: string;
	copyright: string;
	notFoundTitle: string;
	notFoundMessage: string;
	searchPlaceholder: string;
	readMore: string;
	continueReading: string;
	backToTop: string;
	previous: string;
	next: string;
	share: string;
	download: string;
	contactButton: string;
	newsletterText: string;
	subscribeButton: string;
	privacyPolicyLink: string;
	termsLink: string;
	cookieBanner: string;
	recentPostsTitle: string;
	categoriesTitle: string;
	tagsTitle: string;
	footerHeadline: string;
	sectionHeadline: string;
	defaultCtaText: string;
}

export const DEFAULT_SITE_TEXT: SiteTextLabels = {
	menuLinks: 'Menu',
	footerText: 'Storm chasing across the Midwest with Ike and Jess.',
	copyright: '© Heartland Chasers. All rights reserved.',
	notFoundTitle: 'Page Not Found',
	notFoundMessage: 'The page you are looking for does not exist.',
	searchPlaceholder: 'Search...',
	readMore: 'Read More',
	continueReading: 'Continue Reading',
	backToTop: 'Back to Top',
	previous: 'Previous',
	next: 'Next',
	share: 'Share',
	download: 'Download',
	contactButton: 'Contact Us',
	newsletterText: 'Get chase updates in your inbox.',
	subscribeButton: 'Subscribe',
	privacyPolicyLink: 'Privacy Policy',
	termsLink: 'Terms of Service',
	cookieBanner: 'We use cookies to improve your experience.',
	recentPostsTitle: 'Recent Posts',
	categoriesTitle: 'Categories',
	tagsTitle: 'Tags',
	footerHeadline: 'Heartland Chasers',
	sectionHeadline: 'Latest Updates',
	defaultCtaText: 'Learn More',
};

const SITE_TEXT_PATH = 'content/site-text/labels.json';

export async function getSiteText(): Promise<{ labels: SiteTextLabels; sha?: string }> {
	return readJsonFile(SITE_TEXT_PATH, DEFAULT_SITE_TEXT);
}

export async function saveSiteText(labels: SiteTextLabels, sha?: string): Promise<void> {
	await writeJsonFile(SITE_TEXT_PATH, labels, 'Update site text labels', sha);
}

export function getSiteTextForBuild(): SiteTextLabels {
	const file = path.join(process.cwd(), SITE_TEXT_PATH);
	if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
	return DEFAULT_SITE_TEXT;
}
