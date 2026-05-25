import fs from 'fs';

const headerTemplate = `/**
 * @layer SSOT / Schema（結構層）
 * @ward W_{WARD_EN} — {WARD_ZH}
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/{FILE_NAME}
 *   src/data/locales/ja/{FILE_NAME}
 *
 * 食處查核規則：所有與「食」相關（T_FOOD / 餐飲標籤）之新增修改，必須與 tabelog.com 進行事實查核，嚴禁停業舊資料。
 *
 * 合法 typeId：
 *   T_HUB=交通要津  T_TEMPLE=寺社名所  T_SHOP=商肆茶寮
 *   T_FOOD=口福食處  T_NATURE=山水風景  T_MODERN=近代設施  T_ACG=ACG聖地
 *
 * 類型禁則：通道散策路→T_SHOP非T_HUB / 橋梁河畔→T_NATURE非T_SHOP / 展望台廣場→T_MODERN非T_NATURE
 *
 * 合法 tagIds（從此集合選用，最多 6 個）：
 *   ── 交通 ──  地鐵  巴士  鐵道
 *   ── 文化 ──  寺院  神社  世界遺產  庭園  山岳  歷史  國寶
 *   ── 自然 ──  自然  賞花  楓葉
 *   ── 體驗 ──  打卡  ACG  現代  經典  隱密
 *   ── 飲食 ──  正餐  喫茶  和菓子  抹茶  老舖  名物
 *               壽司  拉麵  烏龍  天婦羅  壽喜燒  涮涮鍋  懷石
 *               豆腐  洋菓子  蕎麥  燒肉  放題
 *   ── 商業 ──  購物  超市  博物館
 *   ── 地物 ──  地標  溫泉  展望
 *
 * 禁則：T_FOOD 禁用「世界遺產」標籤 / 禁用模糊標籤「美食」「必吃」
 */`;

const wards = [
  { file: 'fushimi.ts', en: 'FUSHIMI', zh: '伏見區' },
  { file: 'higashiyama.ts', en: 'HIGASHIYAMA', zh: '東山區' },
  { file: 'kamigyo.ts', en: 'KAMIGYO', zh: '上京區' },
  { file: 'kita.ts', en: 'KITA', zh: '北區' },
  { file: 'minami.ts', en: 'MINAMI', zh: '南區' },
  { file: 'nishikyo.ts', en: 'NISHIKYO', zh: '西京區' },
  { file: 'sakyo.ts', en: 'SAKYO', zh: '左京區' },
  { file: 'shimogyo.ts', en: 'SHIMOGYO', zh: '下京區' },
  { file: 'ukyo.ts', en: 'UKYO', zh: '右京區' },
  { file: 'yamashina.ts', en: 'YAMASHINA', zh: '山科區' }
];

for(const w of wards) {
  const path = 'src/data/spots/' + w.file;
  if(fs.existsSync(path)) {
    let text = fs.readFileSync(path, 'utf8');
    const header = headerTemplate.replace('{WARD_EN}', w.en).replace('{WARD_ZH}', w.zh).replace(/\{FILE_NAME\}/g, w.file);
    const newText = text.replace(/^\/\*\*[\s\S]*?\*\//, header);
    fs.writeFileSync(path, newText);
    console.log(`Updated ${path}`);
  } else {
    console.warn(`File not found: ${path}`);
  }
}
