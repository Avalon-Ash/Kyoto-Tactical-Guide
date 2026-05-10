import fs from 'fs';
import path from 'path';

const VALID_TAGS = new Set([
  '正餐', '喫茶', '懷石', '燒肉', '壽喜燒', '拉麵', '烏龍', '壽司', '蕎麥', '豆腐', '天婦羅', 
  '抹茶', '和菓子', '洋菓子', '名物', '打卡', '隱密', '老舖', '經典', '鐵道', '地鐵', '巴士', 
  '世界遺產', '庭園', '神社', '寺院', '楓葉', '賞花', '山岳', '自然', 'ACG', '歷史', '購物', 
  '展望', '現代', '涮涮鍋', '地標', '溫泉', '國寶', '博物館', '超市'
]);

const spotsDir = './src/data/spots';
const files = fs.readdirSync(spotsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(spotsDir, file), 'utf-8');
  const matches = content.match(/tagIds:\s*\[(.*?)\]/g);
  if (matches) {
    matches.forEach(match => {
      const tagStr = match.match(/\[(.*?)\]/)[1];
      const tags = tagStr.split(',').map(t => t.trim().replace(/['"]/g, ''));
      tags.forEach(tag => {
        if (tag && !VALID_TAGS.has(tag)) {
          console.log(`Invalid tag "${tag}" in ${file}`);
        }
      });
    });
  }
});
