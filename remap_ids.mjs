
import fs from 'fs';

const remaps = {
  'fushimi': {
     // Fushimi already remapped in previous turns manually mostly
     'W_FUSHIMI_FUJIOKA_SAKE': 'FS-056' // Double check
  },
  'nakagyo': {
    'W_NAKAGYO_NISHIKI_NISHIKAWA': 'NK-079',
    'W_NAKAGYO_TAKAGI': 'NK-080',
    'W_NAKAGYO_KIKUNOI_KIYAMACHI': 'NK-081',
    'NAKAGYO_TEMPURA_TAIAN': 'NK-082',
    'NAKAGYO_SHINPUHKAN': 'NK-083',
    'NK-FOOD-001': 'NK-084',
    'NK-FOOD-002': 'NK-085',
    'NK-FOOD-003': 'NK-086',
    'NK-FOOD-004': 'NK-087',
    'NK-FOOD-005': 'NK-088',
  },
  'shimogyo': {
    'SG-FOOD-001': 'SG-096',
    'SG-FOOD-002': 'SG-097',
    'SG-FOOD-003': 'SG-098',
    'SG-FOOD-008': 'SG-099',
    'SG-FOOD-010': 'SG-100',
  },
  'yamashina': {
    'W_YAMASHINA_RYUGETSUDO': 'YS-011',
    'W_YAMASHINA_BISHAMON_MONZEN': 'YS-012',
    'W_YAMASHINA_FURUKAWAYA': 'YS-013',
    'W_YAMASHINA_SHIBAZUKE_CHAYA': 'YS-014',
    'W_YAMASHINA_LION_CURRY': 'YS-015',
    'W_YAMASHINA_FURAIPAN': 'YS-016',
    'YS-FOOD-001': 'YS-017',
    'YS-FOOD-002': 'YS-018',
    'YS-FOOD-003': 'YS-019',
  },
  'nishikyo': {
    'W_NISHIKYO_TSUTA': 'NS-014',
    'W_NISHIKYO_SHIOGAMA': 'NS-015',
    'W_NISHIKYO_YAMADAYA': 'NS-016',
    'W_NISHIKYO_SMART_COFFEE': 'NS-017',
    'W_NISHIKYO_MUSETTE': 'NS-018',
    'NS-FOOD-001': 'NS-019',
    'NS-FOOD-002': 'NS-020',
    'NS-FOOD-003': 'NS-021',
  },
  'sakyo': {
    'W_SAKYO_OKAKITA': 'SK-081',
    'W_SAKYO_MOAN': 'SK-082',
    'W_SAKYO_YAMAMOTO_MENZOU': 'SK-083',
    'W_SAKYO_HINODE_UDON': 'SK-084',
    'W_SAKYO_OMEN': 'SK-085',
    'W_SAKYO_ICHIRIJO_NAKATANI': 'SK-086',
    'W_SAKYO_RAKUCHU_RAKUGAI': 'SK-087',
    'SK-FOOD-001': 'SK-088',
    'SK-FOOD-002': 'SK-089',
    'SK-FOOD-003': 'SK-090',
  },
  'minami': {
    'W_MINAMI_TEUCHI_SOBA_MARU': 'MN-008',
    'W_MINAMI_KYOTO_RAMEN_LAB': 'MN-009',
    'W_MINAMI_TORIYASA': 'MN-010',
    'W_MINAMI_KISSHOKARYO': 'MN-011',
    'MN-FOOD-001': 'MN-012',
    'MN-FOOD-002': 'MN-013',
    'MN-FOOD-003': 'MN-014',
  },
  'kamigyo': {
    'W_KAMIGYO_IPPODO_KAGI': 'KG-020',
    'W_KAMIGYO_ORYORI_HAYASHI': 'KG-021',
    'W_KAMIGYO_CHOGOROMOCHI': 'KG-022',
    'W_KAMIGYO_FUNAHASHIYA_NIBEI': 'KG-023',
    'KG-FOOD-001': 'KG-024',
    'KG-FOOD-002': 'KG-025',
    'KG-FOOD-003': 'KG-026',
    'KG-FOOD-004': 'KG-027',
    'KG-FOOD-005': 'KG-028',
  },
  'higashiyama': {
    'W_HIGASHIYAMA_AKOYA_CHAYA': 'HY-041',
    'W_HIGASHIYAMA_SHICHIMIYA_HONPO_CHASEKI': 'HY-042',
    'W_HIGASHIYAMA_JUNIDANYA': 'HY-043',
    'W_HIGASHIYAMA_GION_YATA': 'HY-044',
    'HY-FOOD-001': 'HY-045',
    'HY-FOOD-002': 'HY-046',
    'HY-FOOD-003': 'HY-047',
    'HY-FOOD-004': 'HY-048',
    'HY-FOOD-005': 'HY-049',
    'HY-FOOD-006': 'HY-050',
    'HY-FOOD-007': 'HY-051',
    'HY-FOOD-008': 'HY-052',
    'HY-FOOD-009': 'HY-053',
  },
  'ukyo': {
    'W_UKYO_MITATE': 'UK-084',
    'W_UKYO_CHIKURIN_CHAYA': 'UK-085',
    'W_UKYO_HIRANOYA': 'UK-086',
    'W_UKYO_TSURUYA_YOSHINOBU': 'UK-087',
    'W_UKYO_HIROKAWA': 'UK-088',
    'W_UKYO_OTSUKA': 'UK-089',
    'W_UKYO_YOSHIMURA': 'UK-090',
    'W_UKYO_SHIGETSU': 'UK-091',
    'UK-FOOD-001': 'UK-092',
    'UK-FOOD-002': 'UK-093',
    'UK-FOOD-003': 'UK-094',
    'UK-FOOD-004': 'UK-095',
  },
  'kita': {
    'W_KITA_IZUMISEN': 'KT-011',
    'W_KITA_WIFE_AND_HUSBAND': 'KT-012',
    'W_KITA_CHIKUSEI': 'KT-013',
    'W_KITA_NISHIJIN_UOSHIN': 'KT-014',
    'W_KITA_KAMIGAMO_YAKIMOCHI': 'KT-015',
    'KT-FOOD-001': 'KT-016',
    'KT-FOOD-002': 'KT-017',
  }
};

Object.entries(remaps).forEach(([ward, mapping]) => {
  const files = [
    `./src/data/spots/${ward}.ts`,
    `./src/data/locales/ja/${ward}.ts`,
    `./src/data/locales/zh/${ward}.ts`
  ];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      console.log(`Processing ${f}...`);
      let content = fs.readFileSync(f, 'utf-8');
      Object.entries(mapping).forEach(([oldId, newId]) => {
        content = content.split(`'${oldId}'`).join(`'${newId}'`);
        content = content.split(`"${oldId}"`).join(`"${newId}"`);
      });
      fs.writeFileSync(f, content);
    }
  });
});

console.log("Remapping complete.");
