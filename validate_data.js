/**
 * 資料健康檢查（完整稽核）
 *
 * 執行：npx tsx validate_data.js [--strict]
 *
 * ERROR（會讓程式行為錯誤，exit 1）：
 *   - id 格式 / 前綴 / 重複
 *   - wardId 與檔案不符、未登記的 wardId / areaId / typeId
 *   - areaId 不屬於該 wardId（AREA_BY_WARD）
 *   - Schema 出現白名單以外的欄位
 *   - 未登記的 tagId、tagIds 重複或超過 6 個、T_FOOD 標註世界遺產
 *   - ZH / JA Locale 缺漏或孤立節點
 *   - map-centers：AREA_CENTERS 缺漏、SPOT_POSITIONS 指向不存在的景點
 *   - TYPE_TAG_GROUP_MAP 與 TYPES 不同步
 * WARN（資料品質規範，預設不阻擋；加 --strict 時一併視為失敗）：
 *   - ZH locale.tags 未與 schema.tagIds 鏡射
 *   - 世界遺產 / 國寶景點未在 SPOT_POSITIONS 註冊座標
 *   - JA name 重複
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TAG_REGISTRY } from './src/data/tags.ts';
import { TYPES } from './src/data/types.ts';
import { WARD_KEYS } from './src/data/wards.ts';
import { AREA_KEYS, AREA_BY_WARD } from './src/data/areas.ts';
import { AREA_CENTERS, SPOT_POSITIONS } from './src/data/map-centers.ts';
import { TYPE_TAG_GROUP_MAP } from './src/data/type-tag-groups.ts';
import { MUNICIPALITIES, DEFAULT_MUNICIPALITY } from './src/data/municipalities.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STRICT = process.argv.includes('--strict');

const WARD_PREFIX = {
  kita: 'KT', kamigyo: 'KG', sakyo: 'SK', nakagyo: 'NK', higashiyama: 'HY', shimogyo: 'SG',
  minami: 'MN', ukyo: 'UK', nishikyo: 'NS', yamashina: 'YS', fushimi: 'FS',
};
const SCHEMA_FIELDS = new Set(['id', 'wardId', 'areaId', 'typeId', 'tagIds', 'reservationRequired', 'municipalityId']);
const MAX_TAGS = 6;
const LANDMARK_TAGS = ['世界遺產', '國寶'];

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

async function run() {
  const spotsDir = path.join(__dirname, 'src/data/spots');
  const files = fs.readdirSync(spotsDir).filter(f => f.endsWith('.ts')).sort();

  const idOwner = new Map();
  const jaNameOwner = new Map();
  const allSpots = [];

  for (const file of files) {
    const slug = file.replace('.ts', '');
    const KEY = slug.toUpperCase();
    const ward = `W_${KEY}`;

    const schema = (await import(`./src/data/spots/${file}`))[`${KEY}_SCHEMA`];
    const zh = (await import(`./src/data/locales/zh/${file}`))[`${KEY}_ZH`];
    const ja = (await import(`./src/data/locales/ja/${file}`))[`${KEY}_JA`];
    if (!schema) { err(`${file}: 找不到 ${KEY}_SCHEMA 匯出`); continue; }
    if (!zh) err(`locales/zh/${file}: 找不到 ${KEY}_ZH 匯出`);
    if (!ja) err(`locales/ja/${file}: 找不到 ${KEY}_JA 匯出`);

    for (const s of schema) {
      allSpots.push(s);
      const tags = s.tagIds ?? [];

      // ID
      if (idOwner.has(s.id)) err(`${s.id}: id 重複（${idOwner.get(s.id)} 與 ${file}）`);
      idOwner.set(s.id, file);
      if (!/^[A-Z]{2}-\d{3}$/.test(s.id)) err(`${s.id}: id 不符 XX-NNN 格式`);
      else if (WARD_PREFIX[slug] && !s.id.startsWith(`${WARD_PREFIX[slug]}-`)) err(`${s.id}: ${file} 的 id 前綴應為 ${WARD_PREFIX[slug]}`);

      // Travel-directory membership is separate from physical municipality.
      if (s.municipalityId !== undefined) {
        if (typeof s.municipalityId !== 'string' || !Object.hasOwn(MUNICIPALITIES, s.municipalityId)) {
          err(`${s.id}: 未登記的 municipalityId ${s.municipalityId}`);
        } else if (s.municipalityId !== DEFAULT_MUNICIPALITY) {
          const pos = SPOT_POSITIONS[s.id];
          if (!pos || !Number.isFinite(pos.lat) || !Number.isFinite(pos.lng) || Math.abs(pos.lat) > 90 || Math.abs(pos.lng) > 180) {
            err(`${s.id}: 跨市景點必須提供有效的真實座標`);
          }
        }
      }
      if (s.wardId !== ward) err(`${s.id}: wardId=${s.wardId} 與檔案 ${file} 不符`);
      if (!WARD_KEYS.includes(s.wardId)) err(`${s.id}: 未登記的 wardId ${s.wardId}`);
      if (!AREA_KEYS.includes(s.areaId)) err(`${s.id}: 未登記的 areaId ${s.areaId}`);
      else if (!(AREA_BY_WARD[s.wardId] ?? []).includes(s.areaId)) err(`${s.id}: ${s.areaId} 不屬於 ${s.wardId}（AREA_BY_WARD 越界）`);

      // 類型
      if (!TYPES[s.typeId] || s.typeId === 'T_ALL') err(`${s.id}: 未登記的 typeId ${s.typeId}`);

      // Schema Zero-Trust
      const extra = Object.keys(s).filter(k => !SCHEMA_FIELDS.has(k));
      if (extra.length) err(`${s.id}: Schema 含禁止欄位 ${extra.join(', ')}`);

      // 標籤
      for (const t of tags) if (!TAG_REGISTRY[t]) err(`${s.id}: 幽靈標籤「${t}」未登記於 TAG_REGISTRY`);
      if (new Set(tags).size !== tags.length) err(`${s.id}: tagIds 重複 [${tags}]`);
      if (tags.length > MAX_TAGS) err(`${s.id}: tagIds 共 ${tags.length} 個，超過上限 ${MAX_TAGS}`);
      if (s.typeId === 'T_FOOD' && tags.includes('世界遺產')) err(`${s.id}: T_FOOD 禁用「世界遺產」標籤`);

      // Locale 鏡射
      const zhLoc = zh?.[s.id];
      const jaLoc = ja?.[s.id];
      if (zh && !zhLoc) err(`${s.id}: 缺少 ZH locale`);
      if (ja && !jaLoc) err(`${s.id}: 缺少 JA locale`);
      if (zhLoc) {
        const zhTags = zhLoc.tags.split(/[\s,，、]+/).filter(Boolean);
        const missing = tags.filter(t => !zhTags.includes(t));
        const surplus = zhTags.filter(t => !tags.includes(t));
        if (missing.length || surplus.length) {
          warn(`${s.id}: ZH tags 未鏡射 schema（缺 [${missing}]，多 [${surplus}]）`);
        }
      }
      if (jaLoc) {
        if (jaNameOwner.has(jaLoc.name)) warn(`${s.id}: JA name「${jaLoc.name}」與 ${jaNameOwner.get(jaLoc.name)} 重複`);
        jaNameOwner.set(jaLoc.name, s.id);
      }

      // 地標座標
      if (tags.some(t => LANDMARK_TAGS.includes(t)) && !SPOT_POSITIONS[s.id]) {
        warn(`${s.id}: 世界遺產/國寶景點未在 SPOT_POSITIONS 註冊座標`);
      }
    }

    // 孤立 Locale
    const ids = new Set(schema.map(s => s.id));
    for (const [lang, loc] of [['zh', zh], ['ja', ja]]) {
      for (const id of Object.keys(loc ?? {})) {
        if (!ids.has(id)) err(`locales/${lang}/${file}: ${id} 為孤立節點（schema 不存在）`);
      }
    }
  }

  // map-centers
  for (const a of AREA_KEYS) if (!AREA_CENTERS[a]) err(`map-centers: ${a} 缺少 AREA_CENTERS`);
  for (const id of Object.keys(SPOT_POSITIONS)) {
    if (!idOwner.has(id)) err(`map-centers: SPOT_POSITIONS ${id} 指向不存在的景點`);
  }

  // TYPE_TAG_GROUP_MAP ↔ TYPES
  const validGroups = new Set(Object.values(TAG_REGISTRY).map(t => t.group));
  for (const typeId of Object.keys(TYPES)) {
    if (!TYPE_TAG_GROUP_MAP[typeId]) err(`type-tag-groups: TYPES.${typeId} 缺少 TYPE_TAG_GROUP_MAP 白名單`);
  }
  for (const [typeId, groups] of Object.entries(TYPE_TAG_GROUP_MAP)) {
    if (!TYPES[typeId]) err(`type-tag-groups: ${typeId} 不存在於 TYPES`);
    for (const g of groups) if (!validGroups.has(g)) err(`type-tag-groups: ${typeId} 含未知 group「${g}」`);
  }

  // 報告
  for (const w of warnings) console.warn(`⚠️  ${w}`);
  for (const e of errors) console.error(`❌ ${e}`);
  console.log(`\n景點總數：${allSpots.length}（${files.length} 個行政區檔）`);
  console.log(`ERROR：${errors.length}　WARN：${warnings.length}${STRICT ? '（--strict）' : ''}`);

  if (errors.length > 0 || (STRICT && warnings.length > 0)) {
    console.error('Health Check Failed');
    process.exit(1);
  }
  console.log('Health Check Passed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
