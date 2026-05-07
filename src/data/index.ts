import { JoinedSpot } from '../types';
import { UI_DICT } from './i18n';
import { loadAllSpotsSync, loadSpotsByWard } from './spots-loader';

// 引入新的 Metadata
import { WARD_KEYS, WARD_NAMES, WARD_DESCS, WARD_STATS } from './wards';
import { AREA_KEYS, AREA_NAMES, AREA_BY_WARD, WARD_BY_AREA, AREA_STATS } from './areas';
import { TYPES, TYPE_NAMES } from './types';

/**
 * 取得所有景點資料 (同步版)
 * 為了維持現有 App.tsx 的運作，暫時保留 DB 常數
 */
export function getJoinedSpots(): JoinedSpot[] {
  return loadAllSpotsSync();
}

export const DB = getJoinedSpots();

/**
 * 重新導出所有資料與工具
 */
export {
  // Metadata
  WARD_KEYS,
  WARD_NAMES,
  WARD_DESCS,
  WARD_STATS,
  AREA_KEYS,
  AREA_NAMES,
  AREA_BY_WARD,
  WARD_BY_AREA,
  AREA_STATS,
  TYPES,
  TYPE_NAMES,
  UI_DICT,
  
  // Loaders
  loadAllSpotsSync,
  loadSpotsByWard
};
