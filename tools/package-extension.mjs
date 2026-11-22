import { spawnSync } from 'node:child_process';
import { mkdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = fileURLToPath(new URL('apps/extension/', root));
const publicDir = new URL('apps/web/public/', root);
const archive = fileURLToPath(new URL('roaclaw-extension.zip', publicDir));

await mkdir(publicDir, { recursive: true });
await unlink(archive).catch((error) => {
  if (error.code !== 'ENOENT') throw error;
});
const result = spawnSync('zip', ['-q', '-X', '-r', archive, '.', '-x', 'test/*', 'test/', 'tests/*', 'tests/', '*.test.*', '.DS_Store'], {
  cwd: source,
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) throw new Error('Chrome extension packaging failed.');
console.log('Packaged ROACLAW Chrome companion.');
