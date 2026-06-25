import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

function isProtectedApi(pathname: string): boolean {
	return (
		pathname.startsWith('/api/pages') ||
		pathname.startsWith('/api/blog') ||
		pathname.startsWith('/api/gallery') ||
		pathname.startsWith('/api/auth/logout')
	);
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const isAdminRoute = pathname.startsWith('/admin');
	const isAdminApi = isProtectedApi(pathname);

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
