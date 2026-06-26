import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

const PROTECTED_API_PREFIXES = [
	'/api/pages',
	'/api/blog',
	'/api/gallery',
	'/api/theme',
	'/api/navigation',
	'/api/site-text',
	'/api/global-blocks',
	'/api/media',
	'/api/media/upload',
	'/api/auth/logout',
];

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const isAdminRoute = pathname.startsWith('/admin');
	const isAdminApi = PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

	if (!isAdminRoute && !isAdminApi) {
		return next();
	}

	if (PUBLIC_ADMIN_PATHS.has(pathname) || pathname === '/api/auth/login') {
		return next();
	}

	const session = context.cookies.get(SESSION_COOKIE)?.value;
	if (!verifySessionToken(session)) {
		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return context.redirect('/admin/login');
	}

	return next();
});
