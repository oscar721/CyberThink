import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

try {
  process.loadEnvFile(resolve(root, '.env'));
} catch {}

const apiUrl = process.env.API_URL ?? 'https://cyberthinkbknd.onrender.com';

writeFileSync(
  resolve(root, 'src/environments/environment.ts'),
  `export const environment = {\n  production: true,\n  apiUrl: ${JSON.stringify(apiUrl)},\n};\n`,
);

console.log(`[generate-env] apiUrl = ${apiUrl}`);
