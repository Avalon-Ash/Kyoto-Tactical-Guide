const fs = require('fs');

const migrations = [
  { id: 'NK-125', oldId: 'KG-010', type: 'T_HUB', tags: ['地鐵'], area: 'A03', nameZh: '丸太町站', nameJa: '丸太町駅', descZh: '地下鐵烏丸線的車站。是通往京都御苑南口與京都府廳的玄關。', descJa: '地下鉄烏丸線の駅。京都御苑の南入口や京都府庁への玄関口。', tagsZh: '地鐵', tagsJa: '地下鉄' },
  { id: 'NK-126', oldId: 'KG-056', type: 'T_FOOD', tags: ['抹茶', '老舖', '隱密', '喫茶'], area: 'A03', nameZh: '一保堂茶舖 嘉木', nameJa: '一保堂茶舗 嘉木', descZh: '京都百年茶舖本店。附設茶室「嘉木」可體驗自行沖泡抹茶與經典和菓子。', descJa: '京都の老舗茶舗の本店。併設の茶室「嘉木」では、自分で点てるお茶体験と上質な和菓子を楽しめる。', tagsZh: '喫茶 老舖 抹茶 隱密', tagsJa: '喫茶 老舗 抹茶 穴場' },
  { id: 'NK-127', oldId: 'KG-059', type: 'T_FOOD', tags: ['喫茶', '老舖', '隱密', '和菓子'], area: 'A01', nameZh: '本家船はしや', nameJa: '本家船はしや', descZh: '位於丸太町通上的老舖菓子店。特色是香脆的五色豆與手工煎餅，店內散發著懷舊的江戶氛圍。', descJa: '丸太町通りにある老舗菓子店. 香ばしい五色豆や手焼き煎餅が評判で、店内には江戸時代からの歴史を感じる雰囲気が漂う。', tagsZh: '喫茶 老舖 隱密 和菓子', tagsJa: '喫茶 老舗 穴場 和菓子' },
  { id: 'NK-128', oldId: 'KG-065', type: 'T_FOOD', tags: ['正餐'], area: 'A03', nameZh: '洋食 おがた', nameJa: '洋食 おがた', descZh: '頂級洋食餐廳。精心熬製的醬汁搭配食材原味，每一口都令人感動的頂級料理。', descJa: '至高の洋食店. 丁寧に仕込んだソースと素材の持ち味を活かした料理は、食べる度に感動を与える一皿。', tagsZh: '正餐', tagsJa: '食事' },
  { id: 'NK-129', oldId: 'KG-066', type: 'T_FOOD', tags: ['正餐', '拉麵', '名物'], area: 'A01', nameZh: '一養軒', nameJa: '一養軒', descZh: '實力派拉麵店。主打爽口的鹽味與醬油湯頭，麵條勁道有嚼勁，是深受在地人喜愛的隱密食處。', descJa: '路地裏に佇む実力派ラーメン店. 透明感のあるスープと喉越しの良い麺が地元で評判. どこか懐かしくも洗練された味わいの一杯。', tagsZh: '正餐 拉麵 名物', tagsJa: '食事 ラーメン 名物' },
  { id: 'NK-130', oldId: 'KG-067', type: 'T_FOOD', tags: ['正餐'], area: 'A03', nameZh: 'IL GARAGE', nameJa: 'IL GARAGE', descZh: '隱密義式餐廳。正宗義大利麵搭配精選葡萄酒，是成熟大人的洗練空間。', descJa: '隠れ家イタリアン. 本格的なパスタとワインが楽しめる、大人のための洗練された空間。', tagsZh: '正餐', tagsJa: '食事' },
  { id: 'NK-131', oldId: 'KG-068', type: 'T_FOOD', tags: ['正餐'], area: 'A03', nameZh: '鳥さき', nameJa: '鳥さき', descZh: '以精選地雞為主角的頂級串燒店。炭火香氣與食材鮮味完美融合，是唯有京都才有的一串美味。', descJa: '上質な地鶏を熟練の技で串打ちした焼き鳥が光る. 炭火の香りと素材のうま味が凝縮された京都ならではの一本。', tagsZh: '正餐', tagsJa: '食事' },
  { id: 'NK-132', oldId: 'KG-078', type: 'T_FOOD', tags: ['抹茶', '喫茶', '現代'], area: 'A01', nameZh: 'YUGEN', nameJa: 'YUGEN', descZh: '充滿現代洗鍊感的日本茶專賣店。在時尚極簡的空間中品飲嚴選的頂級抹茶與煎茶。', descJa: '現代的で洗練された日本茶専門店。厳選された質の高い抹茶や煎茶をスタイリッシュな空間で頂ける。', tagsZh: '抹茶 喫茶 現代', tagsJa: '食事 抹茶 喫茶 現代' },
  { id: 'KT-076', oldId: 'KG-076', type: 'T_FOOD', tags: ['喫茶', '打卡', '老舖'], area: 'A14', nameZh: 'さらさ西陣', nameJa: 'さらさ西陣', descZh: '改建自具有80年歷史的錢湯。保留了大面積的馬約利卡花磚裝飾，能在懷舊空間中度過奢華時光。', descJa: '築80年の銭湯をリノベーション。全面に残るマジョリカタイルの装飾が圧巻で、ノスタルジックな空間で贅沢な時間を過ごせる。', tagsZh: '喫茶 打卡 老舖', tagsJa: '喫茶 映え 老舗' }
];

function insertSchema(file, insertStr, lineMatcher) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let idx = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes(lineMatcher)) {
      idx = i;
      break;
    }
  }
  lines.splice(idx + 1, 0, insertStr);
  fs.writeFileSync(file, lines.join('\n'));
}

function removeLines(file, oldIds) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  lines = lines.filter(l => !oldIds.some(oid => l.includes("'" + oid + "'")));
  fs.writeFileSync(file, lines.join('\n'));
}

function processAll() {
  const oldIds = migrations.map(m => m.oldId);

  // Remove from Kamigyo
  removeLines('src/data/spots/kamigyo.ts', oldIds);
  removeLines('src/data/locales/zh/kamigyo.ts', oldIds);
  removeLines('src/data/locales/ja/kamigyo.ts', oldIds);

  // Insert Nakagyo
  const nakagyoMigs = migrations.filter(m => m.id.startsWith('NK'));
  if (nakagyoMigs.length > 0) {
    const schemas = nakagyoMigs.map(m => `  { id: '${m.id}', wardId: 'W_NAKAGYO', areaId: '${m.area}', typeId: '${m.type}', tagIds: [${m.tags.map(t=>`'${t}'`).join(', ')}] },`).join('\n');
    insertSchema('src/data/spots/nakagyo.ts', schemas, "NK-124");
    
    const zh = nakagyoMigs.map(m => `  '${m.id}': { name: "${m.nameZh}", desc: "${m.descZh}", tags: "${m.tagsZh}" },`).join('\n');
    insertSchema('src/data/locales/zh/nakagyo.ts', zh, "NK-124");

    const ja = nakagyoMigs.map(m => `  '${m.id}': { name: "${m.nameJa}", desc: "${m.descJa}", tags: "${m.tagsJa}" },`).join('\n');
    insertSchema('src/data/locales/ja/nakagyo.ts', ja, "NK-124");
  }

  // Insert Kita
  const kitaMigs = migrations.filter(m => m.id.startsWith('KT'));
  if (kitaMigs.length > 0) {
    const schemas = kitaMigs.map(m => `  { id: '${m.id}', wardId: 'W_KITA', areaId: '${m.area}', typeId: '${m.type}', tagIds: [${m.tags.map(t=>`'${t}'`).join(', ')}] },`).join('\n');
    insertSchema('src/data/spots/kita.ts', schemas, "KT-075");

    const zh = kitaMigs.map(m => `  '${m.id}': { name: "${m.nameZh}", desc: "${m.descZh}", tags: "${m.tagsZh}" },`).join('\n');
    insertSchema('src/data/locales/zh/kita.ts', zh, "KT-075");

    const ja = kitaMigs.map(m => `  '${m.id}': { name: "${m.nameJa}", desc: "${m.descJa}", tags: "${m.tagsJa}" },`).join('\n');
    insertSchema('src/data/locales/ja/kita.ts', ja, "KT-075");
  }
}
processAll();
console.log('done');
