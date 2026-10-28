/**
 * @layer System / Assemble System（組件裝配層）
 * @module spots-loader
 *
 * 本模組負責將 Schema（結構層）與 Locale（內容層）
 * 動態合併裝配為 UI 消耗的 FlatSpot 物件。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 核心函式
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * loadSpotsByWard(wardId, lang) : 非同步，依行政區 + 語系載入並合併 FlatSpot[]
 *                                  結果以 `${wardId}:${lang}` 為 key 快取於模組作用域
 *                                  ⚠️ 快取為模組生命週期級，HMR 時需手動清除
 * loadAllSchemasSync()          : 同步，一次性匯入全部 11 個行政區的 SpotSchema[]
 *                                  僅用於統計計算（tagCounts / wardStats / areaStats）
 *                                  禁止用於 UI 渲染，資料量過大且不含 locale 資訊
 * computeWardStats()            : 統計各 wardId 的景點數量
 * computeAreaStats()            : 統計各 areaId 的景點數量
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * jaName 注入策略
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 所有語系均注入 jaName：
 * - lang === 'ja' : 值為當前 locale.name（日文原名）
 * - lang !== 'ja' : 額外載入 ja locale，取 jaLocales[id].name 作為地圖搜尋錨點
 * 目的：確保 SpotCard 的 Query Assembly System 在 ACG 英文景點下
 *       仍能取得日文名稱進行 Google Maps 精確定位
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SSOT 原則與禁則
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - 禁止在 UI 元件層直接 import spots/ 或 locales/ 資料檔
 * - Schema 的 wardKey 命名規則：wardId 去除 'W_' 前綴轉小寫（如 W_SAKYO → sakyo）
 * - Locale 的模組 export 命名規則：`${WARD_KEY}_${LANG.toUpperCase()}`
 *   （如 SAKYO_ZH、SAKYO_JA）
 * - Schema 為靜態匯入（統計需要全量）；Locale 依語系 lazy 載入
 */
import { FlatSpot, SpotSchema, SpotLocale, WardKey, Lang } from '../types';
import { KITA_SCHEMA } from './spots/kita';
import { KAMIGYO_SCHEMA } from './spots/kamigyo';
import { NAKAGYO_SCHEMA } from './spots/nakagyo';
import { SAKYO_SCHEMA } from './spots/sakyo';
import { HIGASHIYAMA_SCHEMA } from './spots/higashiyama';
import { SHIMOGYO_SCHEMA } from './spots/shimogyo';
import { MINAMI_SCHEMA } from './spots/minami';
import { UKYO_SCHEMA } from './spots/ukyo';
import { NISHIKYO_SCHEMA } from './spots/nishikyo';
import { YAMASHINA_SCHEMA } from './spots/yamashina';
import { FUSHIMI_SCHEMA } from './spots/fushimi';

const _cache = new Map<string, FlatSpot[]>();

const SCHEMAS_BY_WARD: Record<WardKey, SpotSchema[]> = {
  W_KITA: KITA_SCHEMA,
  W_KAMIGYO: KAMIGYO_SCHEMA,
  W_NAKAGYO: NAKAGYO_SCHEMA,
  W_SAKYO: SAKYO_SCHEMA,
  W_HIGASHIYAMA: HIGASHIYAMA_SCHEMA,
  W_SHIMOGYO: SHIMOGYO_SCHEMA,
  W_MINAMI: MINAMI_SCHEMA,
  W_UKYO: UKYO_SCHEMA,
  W_NISHIKYO: NISHIKYO_SCHEMA,
  W_YAMASHINA: YAMASHINA_SCHEMA,
  W_FUSHIMI: FUSHIMI_SCHEMA,
};

type LocaleModule = Record<string, Record<string, SpotLocale>>;

const LOCALE_ZH_MODULES = import.meta.glob<LocaleModule>('./locales/zh/*.ts', { eager: false });
const LOCALE_JA_MODULES = import.meta.glob<LocaleModule>('./locales/ja/*.ts', { eager: false });

/**
 * 景點資料載入器
 * 核心目標：實現「Schema 不含語系文字、語系資料按需載入」
 */

/**
 * 根據行政區與語系載入合併後的景點資料
 */
export async function loadSpotsByWard(wardId: WardKey, lang: Lang): Promise<FlatSpot[]> {
  const cacheKey = `${wardId}:${lang}`;
  if (_cache.has(cacheKey)) return _cache.get(cacheKey)!;

  const wardFile = wardId.replace('W_', '').toLowerCase();
  const wardKey = wardId.replace('W_', '');

  try {
    // 1. 取得對應行政區的靜態 schema
    const schemaSpots = SCHEMAS_BY_WARD[wardId];
    if (!schemaSpots) {
      console.error(`Unknown wardId: ${wardId}`);
      return [];
    }

    // 2. 動態 import 對應語系的 locale 檔
    const localePath = `./locales/${lang}/${wardFile}.ts`;
    const LOCALE_MODULE_MAP = (lang === 'zh') ? LOCALE_ZH_MODULES : LOCALE_JA_MODULES;
    
    if (!LOCALE_MODULE_MAP[localePath]) {
      console.error(`Glob key not found: ${localePath}`);
      return [];
    }
    const localeModule = await LOCALE_MODULE_MAP[localePath]();
    const locales: Record<string, SpotLocale> = localeModule[`${wardKey}_${lang.toUpperCase()}`];

    // 2.5 動態載入日文 locale 用於地圖搜尋 (若當前不是日文)
    let jaLocales: Record<string, SpotLocale> = locales;
    if (lang !== 'ja') {
      const jaPath = `./locales/ja/${wardFile}.ts`;
      if (!LOCALE_JA_MODULES[jaPath]) {
        console.error(`Glob key not found: ${jaPath}`);
        return [];
      }
      const jaModule = await LOCALE_JA_MODULES[jaPath]();
      jaLocales = jaModule[`${wardKey}_JA`];
    }

    // 3. 將 schema + locale 合併為 FlatSpot[]
    const flatSpots: FlatSpot[] = schemaSpots.map(s => {
      const locale = locales[s.id];
      
      const jaName = lang === 'ja'
        ? locale?.name ?? s.id
        : jaLocales[s.id]?.name ?? locale?.name ?? s.id;

      const base = {
        ...s,
        jaName
      };

      if (!locale) {
        console.warn(`Missing locale for spot ${s.id} in ${lang}`);
        return { 
          ...base, 
          name: s.id, 
          desc: '', 
          tags: '',
        };
      }
      return { 
        ...base, 
        ...locale,
      };
    });

    _cache.set(cacheKey, flatSpots);
    return flatSpots;
  } catch (error) {
    console.error(`Failed to load spots for ${wardId} [${lang}]:`, error);
    return [];
  }
}

/**
 * 同步載入所有 Schema (用於統計計算)
 */
export function loadAllSchemasSync(): SpotSchema[] {
  return Object.values(SCHEMAS_BY_WARD).flat();
}

/**
 * 統計每個行政區的景點數量
 */
export function computeWardStats(): Record<string, number> {
  const spots = loadAllSchemasSync();
  return spots.reduce((acc, spot) => {
    acc[spot.wardId] = (acc[spot.wardId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * 統計每個分區的景點數量
 */
export function computeAreaStats(): Record<string, number> {
  const spots = loadAllSchemasSync();
  return spots.reduce((acc, spot) => {
    acc[spot.areaId] = (acc[spot.areaId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
