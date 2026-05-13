
import fs from 'fs';
import path from 'path';

// Mocking required data to avoid complex imports in a script
const validWardIds = [
  'W_KITA', 'W_KAMIGYO', 'W_SAKYO', 'W_NAKAGYO', 'W_HIGASHIYAMA', 
  'W_SHIMOGYO', 'W_MINAMI', 'W_UKYO', 'W_NISHIKYO', 'W_YAMASHINA', 'W_FUSHIMI'
];

const validAreaIds = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
  'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19'
];

const areaByWard = {
  W_KITA: ['A12', 'A14'],
  W_KAMIGYO: ['A02', 'A03', 'A12'],
  W_SAKYO: ['A02', 'A05', 'A06', 'A14', 'A15', 'A16', 'A17'],
  W_NAKAGYO: ['A01', 'A03', 'A04'],
  W_HIGASHIYAMA: ['A05', 'A06', 'A07', 'A13'],
  W_SHIMOGYO: ['A01', 'A04'],
  W_MINAMI: ['A04', 'A10'],
  W_UKYO: ['A09', 'A11', 'A12', 'A18'],
  W_NISHIKYO: ['A09', 'A10', 'A19'],
  W_YAMASHINA: ['A08'],
  W_FUSHIMI: ['A08', 'A13']
};

const validTypeIds = ['T_HUB', 'T_TEMPLE', 'T_SHOP', 'T_MODERN', 'T_NATURE', 'T_FOOD', 'T_ACG'];

const validTagIds = [
  '正餐', '喫茶', '懷石', '燒肉', '壽喜燒', '拉麵', '烏龍', '壽司', '蕎麥', '豆腐',
  '天婦羅', '抹茶', '和菓子', '洋菓子', '放題', '名物', '打卡', '隱密', '老舖', '經典',
  '鐵道', '地鐵', '巴士', '世界遺產', '庭園', '神社', '寺院', '楓葉', '賞花',
  '山岳', '自然', 'ACG', '歷史', '購物', '展望', '現代', '涮涮鍋', '地標', '溫泉', '國寶', '博物館', '超市'
];

const spotsDir = './src/data/spots';
const localesDir = './src/data/locales';

function validate() {
  const spotFiles = fs.readdirSync(spotsDir).filter(f => f.endsWith('.ts'));
  let errors = [];

  spotFiles.forEach(file => {
    const wardName = file.replace('.ts', '');
    const content = fs.readFileSync(path.join(spotsDir, file), 'utf8');
    
    // Improved regex to parse spots from file (handles optional fields by matching specific keys)
    const spotRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*wardId:\s*['"]([^'"]+)['"],\s*areaId:\s*['"]([^'"]+)['"],\s*typeId:\s*['"]([^'"]+)['"],\s*tagIds:\s*\[([^\]]*)\].*?\}/gs;
    
    let match;
    const idsInFile = new Set();
    
    while ((match = spotRegex.exec(content)) !== null) {
      const [full, id, wardId, areaId, typeId, tagIdsStr] = match;
      const tagIds = tagIdsStr.split(',').map(t => t.trim().replace(/['"]/g, '')).filter(t => t);

      // Check wardId
      if (!validWardIds.includes(wardId)) {
        errors.push(`[${file}] Invalid wardId: ${wardId} for spot ${id}`);
      }
      
      // Check areaId
      if (!validAreaIds.includes(areaId)) {
        errors.push(`[${file}] Invalid areaId: ${areaId} for spot ${id}`);
      } else if (areaByWard[wardId] && !areaByWard[wardId].includes(areaId)) {
        errors.push(`[${file}] AreaId ${areaId} does not belong to ward ${wardId} for spot ${id}`);
      }

      // Check typeId
      if (!validTypeIds.includes(typeId)) {
        errors.push(`[${file}] Invalid typeId: ${typeId} for spot ${id}`);
      }

      // Check tagIds
      tagIds.forEach(tagId => {
        if (!validTagIds.includes(tagId)) {
          errors.push(`[${file}] Invalid tagId: "${tagId}" for spot ${id}`);
        }
      });

      idsInFile.add(id);
    }

    // Check locales
    ['zh', 'ja'].forEach(lang => {
      const localePath = path.join(localesDir, lang, file);
      if (!fs.existsSync(localePath)) {
        errors.push(`Missing locale file: ${localePath}`);
        return;
      }
      const localeContent = fs.readFileSync(localePath, 'utf8');
      idsInFile.forEach(id => {
        if (!localeContent.includes(`'${id}':`) && !localeContent.includes(`"${id}":`)) {
          errors.push(`[${file}] ID ${id} missing in ${lang} locale`);
        }
      });

      // Also check if any IDs in locale are NOT in spot file
      const localeIdsRegex = /['"]([^'"]+)['"]:\s*\{/g;
      let localeMatch;
      while ((localeMatch = localeIdsRegex.exec(localeContent)) !== null) {
        const localeId = localeMatch[1];
        if (!idsInFile.has(localeId)) {
          errors.push(`[${file}] Locale ID ${localeId} in ${lang} has no matching entry in spot file`);
        }
      }
    });
  });

  if (errors.length === 0) {
    console.log("Health Check Passed: All 11 wards data consistent.");
  } else {
    console.log("Health Check Failed:");
    errors.forEach(e => console.log(`- ${e}`));
  }
}

validate();
