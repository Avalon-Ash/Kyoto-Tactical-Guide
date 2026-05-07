
import fs from 'fs';
import path from 'path';

const wards = ['fushimi', 'higashiyama', 'kamigyo', 'kita', 'minami', 'nakagyo', 'nishikyo', 'sakyo', 'shimogyo', 'ukyo', 'yamashina'];

for (const ward of wards) {
  const schemaPath = `./src/data/spots/${ward}.ts`;
  const zhPath = `./src/data/locales/zh/${ward}.ts`;
  const jaPath = `./src/data/locales/ja/${ward}.ts`;

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const zhContent = fs.readFileSync(zhPath, 'utf8');
  const jaContent = fs.readFileSync(jaPath, 'utf8');

  const schemaIds = [...schemaContent.matchAll(/id: '([A-Z]{2}-\d{3})'/g)].map(m => m[1]).sort();
  const zhIds = [...zhContent.matchAll(/'([A-Z]{2}-\d{3})':/g)].map(m => m[1]).sort();
  const jaIds = [...jaContent.matchAll(/'([A-Z]{2}-\d{3})':/g)].map(m => m[1]).sort();

  console.log(`--- ${ward} ---`);
  console.log(`Schema: ${schemaIds.length}, ZH: ${zhIds.length}, JA: ${jaIds.length}`);

  const missingInZh = schemaIds.filter(id => !zhIds.includes(id));
  const orphansInZh = zhIds.filter(id => !schemaIds.includes(id));
  const missingInJa = schemaIds.filter(id => !jaIds.includes(id));
  const orphansInJa = jaIds.filter(id => !schemaIds.includes(id));

  if (missingInZh.length) console.log(`Missing in ZH: ${missingInZh.join(', ')}`);
  if (orphansInZh.length) console.log(`Orphans in ZH: ${orphansInZh.join(', ')}`);
  if (missingInJa.length) console.log(`Missing in JA: ${missingInJa.join(', ')}`);
  if (orphansInJa.length) console.log(`Orphans in JA: ${orphansInJa.join(', ')}`);
}
