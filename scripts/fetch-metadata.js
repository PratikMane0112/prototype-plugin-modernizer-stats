import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_URL = 'https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json';
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'report.json');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const res = await fetch(DATA_URL);

  if (!res.ok) {
    throw new Error(`Failed to fetch report.json: ${res.status} ${res.statusText}`);
  }

  const json = await res.text();
  fs.writeFileSync(OUT_FILE, json);

  const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2);
  console.log('================================================');
  console.log(`[INFO] Metadata fetched successfully (${sizeMB} MB)`);
  console.log('================================================');
}

main().catch((err) => {
  console.error('================================================');
  console.error(`[ERROR] ${err.message}`);
  console.error('================================================');
  process.exit(1);
});
