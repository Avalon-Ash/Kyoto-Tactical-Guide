import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/data/locales/ja');
const files = fs.readdirSync(localesDir);

const names = new Map();

files.forEach(file => {
  const content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const match = line.match(/'([A-Z]{2}-\d{3})': \{ name: "([^"]+)"/);
    if (match) {
      const id = match[1];
      let name = match[2];
      // remove (xxx) to catch variations
      // name = name.replace(/\s*\(.*?\)\s*/g, '');
      if (names.has(name)) {
        names.get(name).push(id);
      } else {
        names.set(name, [id]);
      }
    }
  });
});

names.forEach((ids, name) => {
  if (ids.length > 1) {
    console.log(`Duplicate exact: ${name} -> ${ids.join(', ')}`);
  }
});

const namesLoose = new Map();
files.forEach(file => {
  const content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const match = line.match(/'([A-Z]{2}-\d{3})': \{ name: "([^"]+)"/);
    if (match) {
      const id = match[1];
      let name = match[2].toLowerCase().replace(/\s+/g, '').replace(/（.*?）|\(.*?\)/g, '');
      if (namesLoose.has(name)) {
        namesLoose.get(name).push(`${id} (${match[2]})`);
      } else {
        namesLoose.set(name, [`${id} (${match[2]})`]);
      }
    }
  });
});

console.log('--- Loose matching ---');
namesLoose.forEach((ids, name) => {
  if (ids.length > 1) {
    console.log(`Duplicate loose: ${name} -> ${ids.join(', ')}`);
  }
});

