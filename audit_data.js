import fs from 'fs';
import path from 'path';

const wards = [
  'fushimi', 'higashiyama', 'kamigyo', 'kita', 'minami',
  'nakagyo', 'nishikyo', 'sakyo', 'shimogyo', 'ukyo', 'yamashina'
];

const NATIONAL_BRANDS = [
  'ワンカルビ', 'くら寿司', 'スシロー', 'はま寿司', 'ガスト', 'サイゼリヤ', 
  'マクドナルド', 'スターバックス', 'ドトール', '吉野家', '松屋', 'すき家',
  '一蘭', '一風堂', '餃子の王将', 'コメダ珈琲', '星乃珈琲', '和民', '土間土間',
  'ダイソー', 'セブンイレブン', 'ローソン', 'ファミリーマート', '牛角', 'あぶりや',
  '2nd STREET', 'フレスコ'
];

const ADDRESS_PATTERNS = [
  /町\d+(?:番地?|号)/, /丁目/, /\d+番出口/, /\d+階/, /ビル/, /[\u4e00-\u9fa5]路\d+號/
];

const TEMPLE_FOOD_KEYWORDS = ['餅', '菓子', 'うどん', '蕎麦', 'そば', 'ゆどうふ', '精進', '料理', '懐石', '席', '茶屋', '門前', '境内', '庵', '麺', '屋', '店', '堂', '処', '処'];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Kyoto-Tactical-Guide Data Audit Report');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let foodAuditCount = 0;
let foodIssueCount = 0;
let otherAuditCount = 0;
let otherIssueCount = 0;

wards.forEach(ward => {
  const spotPath = `./src/data/spots/${ward}.ts`;
  const jaPath = `./src/data/locales/ja/${ward}.ts`;
  const zhPath = `./src/data/locales/zh/${ward}.ts`;

  if (!fs.existsSync(spotPath) || !fs.existsSync(jaPath) || !fs.existsSync(zhPath)) return;

  const spotContent = fs.readFileSync(spotPath, 'utf8');
  const jaContent = fs.readFileSync(jaPath, 'utf8');
  const zhContent = fs.readFileSync(zhPath, 'utf8');

  // Improved Regex extraction
  const extractSpots = (content) => {
    const spots = [];
    const matches = content.matchAll(/\{ id: '(.*?)', wardId: '(.*?)', areaId: '(.*?)', typeId: '(.*?)'(.*?)\}/g);
    for (const m of matches) {
      spots.push({ id: m[1], wardId: m[2], areaId: m[3], typeId: m[4] });
    }
    return spots;
  };

  const extractLocales = (content) => {
    const locales = {};
    const matches = content.matchAll(/'(.*?)': \{ name: "(.*?)", desc: "(.*?)", tags: "(.*?)" \}/g);
    for (const m of matches) {
      locales[m[1]] = { name: m[2], desc: m[3], tags: m[4] };
    }
    return locales;
  };

  const spots = extractSpots(spotContent);
  const jaLocales = extractLocales(jaContent);
  const zhLocales = extractLocales(zhContent);

  spots.forEach(spot => {
    const ja = jaLocales[spot.id];
    const zh = zhLocales[spot.id];
    if (!ja || !zh) return;

    let issues = [];

    // [A] & [D] National Brands & Chain Stores
    NATIONAL_BRANDS.forEach(brand => {
      if (ja.name.includes(brand)) {
        if (brand === 'ワンカルビ') {
            issues.push(`[KNOWN/D] ワンカルビ (官方確認京都市內無店舖)`);
        } else if (ja.name.includes('店') || ja.name.includes('支店') || ja.name.includes('分店') || ja.name.includes('本社')) {
            issues.push(`[A/D] 全國連鎖分店/本社: ${brand}`);
        }
      }
    });

    // [B] Precision Address Patterns
    ADDRESS_PATTERNS.forEach(regex => {
      if (regex.test(ja.name) || regex.test(zh.name) || regex.test(ja.desc) || regex.test(zh.desc)) {
        issues.push(`[B] 含有疑似精確地址/樓層資訊 (${regex.source})`);
      }
    });

    // [C] typeId mismatch
    if (spot.typeId === 'T_TEMPLE') {
        const commercialKeywords = ['ビル', 'レストラン', 'カフェ', 'ショップ', 'ホテル'];
        if (commercialKeywords.some(k => ja.name.includes(k))) {
             issues.push(`[C] typeId: T_TEMPLE 但名稱疑似商業或餐飲`);
        }
    }
    if (spot.typeId === 'T_FOOD') {
        const religiousKeywords = ['神社', '寺', '庵', '公墓', '神宮', '天滿宮', '八幡宮'];
        if (religiousKeywords.some(k => ja.name.includes(k))) {
             const hasFoodContext = TEMPLE_FOOD_KEYWORDS.some(k => ja.name.includes(k));
             if (!hasFoodContext) {
                 issues.push(`[C] typeId: T_FOOD 但名稱為寺社且無餐飲關鍵字`);
             }
        }
    }

    // [E] ZH / JA Inconsistency (Translation Hallucination)
    // Simple check: significantly different lengths or specific keyword mismatches
    if (ja.name.length > 3 && zh.name.length > 3) {
        const jaSet = new Set(ja.name.split(''));
        const zhSet = new Set(zh.name.split(''));
        // (Just a very basic placeholder for more complex checks)
    }

    if (issues.length > 0) {
      console.log(`[問題類型] ${spot.id} / ${spot.wardId} / typeId:${spot.typeId}`);
      console.log(`JA：${ja.name} / ZH：${zh.name}`);
      console.log(`原因：${issues.join(', ')}\n`);
      
      if (spot.typeId === 'T_FOOD') foodIssueCount++;
      else otherIssueCount++;
    }

    if (spot.typeId === 'T_FOOD') foodAuditCount++;
    else otherAuditCount++;
  });
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`T_FOOD 稽核筆數：${foodAuditCount} 筆 / 疑似問題：${foodIssueCount} 筆`);
console.log(`其他類型 稽核筆數：${otherAuditCount} 筆 / 疑似問題：${otherIssueCount} 筆`);
console.log(`合計疑似問題：${foodIssueCount + otherIssueCount} 筆`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
