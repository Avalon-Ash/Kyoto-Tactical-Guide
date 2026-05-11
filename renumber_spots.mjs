
import fs from 'fs';
import path from 'path';

const wards = [
  { name: 'fushimi', prefix: 'FS' },
  { name: 'higashiyama', prefix: 'HY' },
  { name: 'kamigyo', prefix: 'KG' },
  { name: 'kita', prefix: 'KT' },
  { name: 'minami', prefix: 'MN' },
  { name: 'nakagyo', prefix: 'NK' },
  { name: 'nishikyo', prefix: 'NS' },
  { name: 'sakyo', prefix: 'SK' },
  { name: 'shimogyo', prefix: 'SG' },
  { name: 'ukyo', prefix: 'UK' },
  { name: 'yamashina', prefix: 'YS' }
];

function pad(num) {
  return num.toString().padStart(3, '0');
}

wards.forEach(ward => {
  const schemaFile = `./src/data/spots/${ward.name}.ts`;
  if (!fs.existsSync(schemaFile)) return;

  console.log(`Processing ${ward.name}...`);
  let schemaContent = fs.readFileSync(schemaFile, 'utf-8');

  // Find all matches for { id: '...', ... }
  // We'll use a more robust regex that ignores comments
  const spotRegex = /\{ id: ['"](.*?)['"],/g;
  let matches = [];
  let m;
  while ((m = spotRegex.exec(schemaContent)) !== null) {
    matches.push({ full: m[0], oldId: m[1], index: m.index });
  }

  const oldIdsInOrder = matches.map(m => m.oldId);
  const newIdsInOrder = oldIdsInOrder.map((_, i) => `${ward.prefix}-${pad(i + 1)}`);

  // Replace IDs in schema
  let newSchemaContent = schemaContent;
  // Replace backwards to keep indices valid
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const newId = newIdsInOrder[i];
    const before = newSchemaContent.slice(0, match.index);
    const after = newSchemaContent.slice(match.index + match.full.length);
    newSchemaContent = before + `{ id: '${newId}',` + after;
  }
  fs.writeFileSync(schemaFile, newSchemaContent);

  // Update Locales
  ['ja', 'zh'].forEach(lang => {
    const localeFile = `./src/data/locales/${lang}/${ward.name}.ts`;
    if (!fs.existsSync(localeFile)) return;

    let localeContent = fs.readFileSync(localeFile, 'utf-8');
    
    // Locales are like 'HY-001': { ... }
    // We must replace them in order. 
    // Since there might be duplicates, simple replace won't work easily.
    // We'll use the same strategy: find all keys and replace them 1 by 1.
    
    const keyRegex = /['"](.*?)['"]:\s*\{/g;
    let localeMatches = [];
    while ((m = keyRegex.exec(localeContent)) !== null) {
      localeMatches.push({ full: m[0], oldId: m[1], index: m.index });
    }

    if (localeMatches.length !== oldIdsInOrder.length) {
      console.warn(`  Warning: ${lang}/${ward.name} has ${localeMatches.length} keys, but schema has ${oldIdsInOrder.length}.`);
      // If they don't match, we might have a problem. 
      // But we'll try to align them from the start.
    }

    let newLocaleContent = localeContent;
    for (let i = Math.min(localeMatches.length, newIdsInOrder.length) - 1; i >= 0; i--) {
      const match = localeMatches[i];
      const newId = newIdsInOrder[i];
      const before = newLocaleContent.slice(0, match.index);
      const after = newLocaleContent.slice(match.index + match.full.length);
      newLocaleContent = before + `'${newId}': {` + after;
    }
    fs.writeFileSync(localeFile, newLocaleContent);
  });
});

console.log("Renumbering complete.");
