import { UI_DICT } from './i18n';
import { loadSpotsByWard, computeWardStats, computeAreaStats, loadAllSchemasSync } from './spots-loader';

// 引入新的 Metadata
import { WARD_KEYS, WARD_NAMES, WARD_DESCS } from './wards';
import { AREA_KEYS, AREA_NAMES, AREA_BY_WARD, WARD_BY_AREA } from './areas';
import { TYPES, TYPE_NAMES, TYPE_KEYS } from './types';

/**
 * 行政區與分區資料 (基於 Schema)
 */
const allSchemas = loadAllSchemasSync();
let _wardStats: Record<string, number> | null = null;
let _areaStats: Record<string, number> | null = null;
let _tagCounts: Record<string, number> | null = null;

export function getWardStats(): Record<string, number> {
  if (!_wardStats) {
    _wardStats = allSchemas.reduce((acc, spot) => {
      acc[spot.wardId] = (acc[spot.wardId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  return _wardStats;
}

export function getAreaStats(): Record<string, number> {
  if (!_areaStats) {
    _areaStats = allSchemas.reduce((acc, spot) => {
      acc[spot.areaId] = (acc[spot.areaId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  return _areaStats;
}

export function getTagCounts(): Record<string, number> {
  if (!_tagCounts) {
    const counts: Record<string, number> = {};
    allSchemas.forEach(s => {
      s.tagIds?.forEach(tid => {
        counts[tid] = (counts[tid] ?? 0) + 1;
      });
    });
    _tagCounts = counts;
  }
  return _tagCounts;
}

/**
 * 重新導出所有資料與工具
 */
export { TAG_GROUP_LABELS } from './tags';
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
  TYPE_KEYS,   // 從 ./types 新增
  UI_DICT,
  
  // Loaders
  loadSpotsByWard,
  loadAllSchemasSync
};
