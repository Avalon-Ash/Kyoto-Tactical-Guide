import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TAG_REGISTRY } from './src/data/tags.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validTags = new Set(Object.keys(TAG_REGISTRY));

async function run() {
  const spotsDir = path.join(__dirname, 'src/data/spots');
  const files = fs.readdirSync(spotsDir).filter(f => f.endsWith('.ts'));

  let allValid = true;

  for (const file of files) {
    const slug = file.replace('.ts', '');
    const module = await import(`./src/data/spots/${file}`);
    
    // Find the exported schema array
    const exportName = Object.keys(module).find(k => k.endsWith('_SCHEMA'));
    if (!exportName) {
      console.warn(`No schema export found in ${file}`);
      continue;
    }

    const schema = module[exportName];
    
    const invalidTags = schema.flatMap((spot: any) => spot.tagIds)
      .filter((tag: string) => !validTags.has(tag));

    if (invalidTags.length > 0) {
      console.error(`❌ Invalid tags in ${file}:`, [...new Set(invalidTags)]);
      allValid = false;
    } else {
      console.log(`✅ ${file} is healthy.`);
    }
  }

  if (allValid) {
    console.log('All schemas validated successfully!');
  } else {
    process.exit(1);
  }
}

run().catch(console.error);
