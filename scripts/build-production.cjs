/**
 * Force NODE_ENV=production pendant `next build`.
 * Nécessaire si la plateforme (ex. Railway) injecte NODE_ENV=development :
 * sinon Next 15 échoue au prerender /404 avec
 * « Html should not be imported outside of pages/_document ».
 */
process.env.NODE_ENV = 'production';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const nextCli = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

const result = spawnSync(process.execPath, [nextCli, 'build'], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
