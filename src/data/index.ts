import { UI_DICT } from './i18n';
import { loadSpotsByWard, computeWardStats, computeAreaStats, loadAllSchemasSync } from './spots-loader';

// 引入新的 Metadata
import { WARD_KEYS, WARD_NAMES, WARD_DESCS } from './wards';
import { AREA_KEYS, AREA_NAMES, AREA_BY_WARD, WARD_BY_AREA } from './areas';
import { TYPES, TYPE_NAMES } from './types';

/**
 * 動態計算統計資訊 (基於 Schema)
 */
let _wardStats: Record<string, number> | null = null;
let _areaStats: Record<string, number> | null = null;

export function getWardStats(): Record<string, number> {
  if (!_wardStats) _wardStats = computeWardStats();
  return _wardStats;
}

export function getAreaStats(): Record<string, number> {
  if (!_areaStats) _areaStats = computeAreaStats();
  return _areaStats;
}

/**
 * 重新導出所有資料與工具
 */
export {
  // Metadata
  WARD_KEYS,
  WARD_NAMES,
  WARD_DESCS,
  AREA_KEYS,
  AREA_NAMES,
  AREA_BY_WARD,
  WARD_BY_AREA,
  TYPES,
  TYPE_NAMES,
  UI_DICT,
  
  // Loaders
  loadSpotsByWard,
  loadAllSchemasSync
};
