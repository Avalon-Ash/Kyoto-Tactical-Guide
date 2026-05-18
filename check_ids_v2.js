import fs from 'fs';

const schemaContent = fs.readFileSync('./src/data/spots/nakagyo.ts', 'utf8');
const localeContent = fs.readFileSync('./src/data/locales/ja/nakagyo.ts', 'utf8');

const schemaIds = [...schemaContent.matchAll(/id: '(NK-\d+)'/g)].map(m => m[1]);
const localeIds = [...localeContent.matchAll(/'(NK-\d+)':/g)].map(m => m[1]);

const schemaSet = new Set(schemaIds);
const localeSet = new Set(localeIds);

const onlyInSchema = schemaIds.filter(id => !localeSet.has(id));
const onlyInLocale = localeIds.filter(id => !schemaSet.has(id));

console.log('Only in Schema:', onlyInSchema);
console.log('Only in Locale:', onlyInLocale);
console.log('Total Schema IDs:', schemaIds.length);
console.log('Total Locale IDs:', localeIds.length);
