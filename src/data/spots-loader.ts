import { FlatSpot, SpotSchema, SpotLocale, WardKey, Lang } from '../types';
import { TYPES } from './types';

const _cache = new Map<string, FlatSpot[]>();

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
    // 1. 動態 import 對應的 schema 檔
    const schemaModule = await import(`./spots/${wardFile}.ts`);
    const schemaSpots: SpotSchema[] = schemaModule[`${wardKey}_SCHEMA`];

    // 2. 動態 import 對應語系的 locale 檔
    const localeModule = await import(`./locales/${lang}/${wardFile}.ts`);
    const locales: Record<string, SpotLocale> = localeModule[`${wardKey}_${lang.toUpperCase()}`];

    // 2.5 動態載入日文 locale 用於地圖搜尋 (若當前不是日文)
    let jaLocales: Record<string, SpotLocale> = locales;
    if (lang !== 'ja') {
      const jaModule = await import(`./locales/ja/${wardFile}.ts`);
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

export function loadAllSchemasSync(): SpotSchema[] {
  return [
    ...KITA_SCHEMA, ...KAMIGYO_SCHEMA, ...NAKAGYO_SCHEMA, ...SAKYO_SCHEMA, 
    ...HIGASHIYAMA_SCHEMA, ...SHIMOGYO_SCHEMA, ...MINAMI_SCHEMA, ...UKYO_SCHEMA, 
    ...NISHIKYO_SCHEMA, ...YAMASHINA_SCHEMA, ...FUSHIMI_SCHEMA
  ];
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
