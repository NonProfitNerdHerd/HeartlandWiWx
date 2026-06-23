import { spawnSync } from 'node:child_process';

const hasTinaCloud =
	Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID || process.env.PUBLIC_TINA_CLIENT_ID) &&
	Boolean(process.env.TINA_TOKEN);

const tinaArgs = hasTinaCloud
	? ['tinacms', 'build']
	: ['tinacms', 'build', '--local', '--skip-cloud-checks'];

console.log(
	hasTinaCloud
		? 'Building Tina admin with Tina Cloud credentials...'
		: 'Building Tina admin in local mode (set NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN for GitHub editing)...',
);

function run(command, args) {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

run('npx', tinaArgs);
run('node', ['scripts/copy-admin.mjs']);
run('npx', ['astro', 'build']);
