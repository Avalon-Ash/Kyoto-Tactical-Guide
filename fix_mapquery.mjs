
import fs from 'fs';

const charMap = {
  '站': '駅',
  '鐵': '鉄',
  '營': '営',
  '櫻': '桜',
  '觀': '観',
  '地區': '地区',
  '小火車': 'トロッコ',
  '柯南': 'コナン',
  '參道': '参道',
  '壽司': '寿司',
  '拉麵': 'ラーメン',
  '懷石': '懐石',
  '蕎麥': 'そば',
  '老舖': '老舗',
  '溫泉': '温泉',
  '國寶': '国宝',
  '遺產': '遺産',
  '天婦羅': '天ぷら',
  '隱密': '穴場',
  '楓葉': '紅葉',
  '賞花': '桜',
  '巴士': 'バス',
  '購物': 'ショッピング',
  '超市': 'スーパー',
  '地鐵': '地下鉄',
  '麵': '麺',
  '恆': '恒',
  '跡地': '跡地',
  '藝': '芸',
  '術': '術',
  '縣': '県',
  '疏': '疎',
  '區': '区',
  '圖': '図',
  '處': '処',
  '廣': '広',
  '萬': '万',
  '龍': '龍', // Use Japanese Shinjitai if possible, but 龍 is common in JA too (竜 is simpler)
  '竜': '竜',
  '條': '条',
  '來': '来',
  '龜': '亀',
  '島': '島', // JA: 嶋/島
  '嶋': '嶋',
  '兩': '両',
  '實': '実',
  '寫': '写',
  '真': '真',
  '門': '門',
  '戶': '戸',
  '散步路': '遊歩道',
  '區段': '区間',
  '區': '区',
  '懷石': '懐石',
  '地藏': '地蔵',
  '寺院': '寺', // mapQuery usually better with '寺' or just name
  '神社': '神社', // keep
  '打卡': '', // Remove from mapQuery if present
  '經典': '',
  '老舖': '老舗',
  '隠密': '穴場',
  '穴場': '穴場',
  '博物館': '博物館',
  '近代': '近代',
  '現代': '現代',
  '音樂盒': 'オルゴール',
  '咖啡': 'カフェ',
  '蛋糕': 'ケーキ',
  '甜點': 'スイーツ',
  '巧克力': 'チョコレート',
  '麵包': 'パン',
  '啤酒': 'ビール',
  '柯南': '名探偵コナン',
};

const wards = [
  'fushimi', 'higashiyama', 'kamigyo', 'kita', 'minami',
  'nakagyo', 'nishikyo', 'sakyo', 'shimogyo', 'ukyo', 'yamashina'
];

wards.forEach(ward => {
  const f = `./src/data/spots/${ward}.ts`;
  if (fs.existsSync(f)) {
    console.log(`Checking mapQuery in ${f}...`);
    let content = fs.readFileSync(f, 'utf-8');
    
    // Simple regex to find mapQuery: "..."
    const newContent = content.replace(/mapQuery:\s*["'](.*?)["']/g, (match, query) => {
      let newQuery = query;
      Object.entries(charMap).forEach(([zh, ja]) => {
        newQuery = newQuery.split(zh).join(ja);
      });
      if (newQuery !== query) {
        console.log(`  Fixed: "${query}" -> "${newQuery}"`);
      }
      return `mapQuery: "${newQuery}"`;
    });
    
    fs.writeFileSync(f, newContent);
  }
});

console.log("mapQuery normalization complete.");
