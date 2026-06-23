import fs from 'node:fs';
import path from 'node:path';

const source = path.join(process.cwd(), 'admin');
const target = path.join(process.cwd(), 'public', 'admin');

if (!fs.existsSync(source)) {
	console.warn('Tina admin build output not found at ./admin — skipping copy.');
	process.exit(0);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log('Copied Tina admin UI to public/admin');
