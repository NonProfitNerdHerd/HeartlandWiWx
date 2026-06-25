import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'hc_admin_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
	const secret = import.meta.env.ADMIN_PASSWORD;
	if (!secret) {
		throw new Error('ADMIN_PASSWORD is not configured');
	}
	return secret;
}

function sign(payload: string): string {
	return createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

export function createSessionToken(username: string): string {
	const exp = Date.now() + SESSION_MAX_AGE_MS;
	const payload = JSON.stringify({ username, exp });
	const signature = sign(payload);
	return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

export function verifySessionToken(token: string | undefined): boolean {
	if (!token) return false;

	try {
		const decoded = Buffer.from(token, 'base64url').toString('utf-8');
		const separator = decoded.lastIndexOf('.');
		if (separator === -1) return false;

		const payload = decoded.slice(0, separator);
		const signature = decoded.slice(separator + 1);
		const expected = sign(payload);

		const sigBuffer = Buffer.from(signature, 'hex');
		const expectedBuffer = Buffer.from(expected, 'hex');
		if (sigBuffer.length !== expectedBuffer.length) return false;
		if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

		const data = JSON.parse(payload) as { exp: number };
		return Date.now() < data.exp;
	} catch {
		return false;
	}
}

export function verifyCredentials(username: string, password: string): boolean {
	const expectedUser = import.meta.env.ADMIN_USERNAME;
	const expectedPass = import.meta.env.ADMIN_PASSWORD;

	if (!expectedUser || !expectedPass) {
		return false;
	}

	const userMatch = username === expectedUser;
	const passMatch = password === expectedPass;
	return userMatch && passMatch;
}

export function sessionCookieOptions(): { httpOnly: boolean; secure: boolean; sameSite: 'lax'; path: string; maxAge: number } {
	return {
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		path: '/',
		maxAge: SESSION_MAX_AGE_MS / 1000,
	};
}
