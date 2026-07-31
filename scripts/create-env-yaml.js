// scripts/create-env-yaml.js

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// `__dirname` does not exist in ESM. On Node >=20.11 / >=21.2 (this project
// pins Node >=22), `import.meta.dirname` is the native replacement, so no
// fileURLToPath shim is needed.
//
// This file lives in `scripts/`, so the project root is one level up. `.env`
// and `.env.yaml` both live at the root, next to package.json.
const projectRoot = path.join(import.meta.dirname, '..');

// Load environment variables from the root .env file
const envPath = path.join(projectRoot, '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Build the YAML content
const yamlContent = Object.entries(envConfig)
  .map(([key, value]) => `${key}: "${value}"`)
  .join('\n');

// Write the YAML content to the root .env.yaml
const yamlPath = path.join(projectRoot, '.env.yaml');
fs.writeFileSync(yamlPath, `${yamlContent}\n`);

console.log('✅ .env.yaml created successfully');
