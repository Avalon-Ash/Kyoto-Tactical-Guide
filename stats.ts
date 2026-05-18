import fs from 'fs';
import path from 'path';

const wards = [
  'fushimi', 'higashiyama', 'kamigyo', 'kita', 'minami',
  'nakagyo', 'nishikyo', 'sakyo', 'shimogyo', 'ukyo', 'yamashina'
];

console.log('Ward | Spots Count | Max ID');
console.log('-----|-------------|-------');

wards.forEach(ward => {
  const filePath = path.join('src/data/spots', `${ward}.ts`);
  const content = fs.readFileSync(filePath, 'utf8');
  const ids = content.match(/id: '(.*?)'/g)?.map(m => m.match(/'(.*?)'/)[1]) || [];
  const count = ids.length;
  const maxId = ids.sort().pop() || 'N/A';
  console.log(`${ward.padEnd(11)} | ${count.toString().padEnd(11)} | ${maxId}`);
});
