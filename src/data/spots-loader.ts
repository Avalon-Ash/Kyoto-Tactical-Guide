import { JoinedSpot, WardKey } from '../types';

/**
 * 景點資料載入器
 * 核心目標：實作 Lazy Loading，避免一次性載入數千筆資料
 */

// 對應關係：WardKey -> 動態載入函式
// 注意：這裡使用 vite 的動態 import 特性，會自動進行 code splitting
const WARD_LOADERS: Record<WardKey, () => Promise<any>> = {
  W_KITA: () => import('./spots/kita'),
  W_KAMIGYO: () => import('./spots/kamigyo'),
  W_NAKAGYO: () => import('./spots/nakagyo'),
  W_SAKYO: () => import('./spots/sakyo'),
  W_HIGASHIYAMA: () => import('./spots/higashiyama'),
  W_SHIMOGYO: () => import('./spots/shimogyo'),
  W_MINAMI: () => import('./spots/minami'),
  W_UKYO: () => import('./spots/ukyo'),
  W_NISHIKYO: () => import('./spots/nishikyo'),
  W_YAMASHINA: () => import('./spots/yamashina'),
  W_FUSHIMI: () => import('./spots/fushimi'),
};

/**
 * 1. 非同步載入：根據 Ward 載入資料 (推薦用於 UI)
 */
export async function loadSpotsByWard(wardId: WardKey): Promise<JoinedSpot[]> {
  const loader = WARD_LOADERS[wardId];
  if (!loader) {
    console.warn(`No loader found for ward: ${wardId}`);
    return [];
  }
  
  try {
    const module = await loader();
    // 慣例：變數名稱為 [WARD_ID]_SPOTS，例如 KITA_SPOTS
    // 我們在檔案中導出了對應常數
    const key = `${wardId.replace('W_', '')}_SPOTS`;
    return module[key] || [];
  } catch (error) {
    console.error(`Failed to load spots for ${wardId}:`, error);
    return [];
  }
}

/**
 * 2. 同步載入：用於轉換期的全量載入 (維持舊介面相容性)
 * 注意：這會讓 Vite 仍將所有檔案 bundle 進來，但內部結構已分層。
 * 未來當 UI 完整切換到非同步時，可移除此函式。
 */
import { KITA_SPOTS } from './spots/kita';
import { KAMIGYO_SPOTS } from './spots/kamigyo';
import { NAKAGYO_SPOTS } from './spots/nakagyo';
import { SAKYO_SPOTS } from './spots/sakyo';
import { HIGASHIYAMA_SPOTS } from './spots/higashiyama';
import { SHIMOGYO_SPOTS } from './spots/shimogyo';
import { MINAMI_SPOTS } from './spots/minami';
import { UKYO_SPOTS } from './spots/ukyo';
import { NISHIKYO_SPOTS } from './spots/nishikyo';
import { YAMASHINA_SPOTS } from './spots/yamashina';
import { FUSHIMI_SPOTS } from './spots/fushimi';

export function loadAllSpotsSync(): JoinedSpot[] {
  return [
    ...KITA_SPOTS,
    ...KAMIGYO_SPOTS,
    ...NAKAGYO_SPOTS,
    ...SAKYO_SPOTS,
    ...HIGASHIYAMA_SPOTS,
    ...SHIMOGYO_SPOTS,
    ...MINAMI_SPOTS,
    ...UKYO_SPOTS,
    ...NISHIKYO_SPOTS,
    ...YAMASHINA_SPOTS,
    ...FUSHIMI_SPOTS,
  ];
}
