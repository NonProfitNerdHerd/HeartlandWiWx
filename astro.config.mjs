// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel(),
	integrations: [react()],
	security: {
		allowedDomains: [{ hostname: '**.vercel.app', protocol: 'https' }],
	},
});
