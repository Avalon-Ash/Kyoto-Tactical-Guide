
import fs from 'fs';

const migrationPlan = [
  { slug: 'nakagyo', oldPrefix: 'NC-', newPrefix: 'NK-' },
  { slug: 'shimogyo', oldPrefix: 'SM-', newPrefix: 'SG-' },
  { slug: 'nishikyo', oldPrefix: 'NK-', newPrefix: 'NS-' },
  { slug: 'nishikyo', oldPrefix: 'NX-', newPrefix: 'NS-' },
];

migrationPlan.forEach(({ slug, oldPrefix, newPrefix }) => {
  const files = [
    `./src/data/spots/${slug}.ts`,
    `./src/data/locales/ja/${slug}.ts`,
    `./src/data/locales/zh/${slug}.ts`
  ];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      console.log(`Migrating ${f}: ${oldPrefix} -> ${newPrefix}`);
      let content = fs.readFileSync(f, 'utf-8');
      content = content.replace(new RegExp(oldPrefix, 'g'), newPrefix);
      fs.writeFileSync(f, content);
    }
  });
});

console.log("Global prefix migration complete.");
