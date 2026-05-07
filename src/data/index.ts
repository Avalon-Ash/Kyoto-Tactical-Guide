import { JoinedSpot, I18nText } from '../types';
import { SPOTS } from './db_spots';
import { LINKS } from './db_links';
import { TYPES, WARD_KEYS, AREA_KEYS } from './db_core';
import { UI_DICT_ZH, WARD_NAMES_ZH, AREA_NAMES_ZH, TYPE_NAMES_ZH, SPOTS_ZH, WARD_DESC_ZH } from './db_zh';
import { UI_DICT_JA, WARD_NAMES_JA, AREA_NAMES_JA, TYPE_NAMES_JA, SPOTS_JA, WARD_DESC_JA } from './db_ja';

function createI18nMap(zhObj: Record<string, string>, jaObj: Record<string, string>): Record<string, I18nText> {
  const result: Record<string, I18nText> = {};
  for (const key of Object.keys(zhObj)) {
    result[key] = { zh: zhObj[key], ja: jaObj[key] || zhObj[key] };
  }
  return result;
}

export const UI_DICT = createI18nMap(UI_DICT_ZH, UI_DICT_JA);
export const WARD_NAMES = createI18nMap(WARD_NAMES_ZH, WARD_NAMES_JA);
export const WARD_DESCS = createI18nMap(WARD_DESC_ZH, WARD_DESC_JA);
export const AREA_NAMES = createI18nMap(AREA_NAMES_ZH, AREA_NAMES_JA);
export const TYPE_NAMES = createI18nMap(TYPE_NAMES_ZH, TYPE_NAMES_JA);

export function getJoinedSpots(): JoinedSpot[] {
  return SPOTS.map(spot => {
    const zhData = SPOTS_ZH.find(s => s.id === spot.id) || { id: spot.id, name: '', desc: '', tags: '' };
    const jaData = SPOTS_JA.find(s => s.id === spot.id) || { id: spot.id, name: '', desc: '', tags: '' };
    const link = LINKS.find(s => s.id === spot.id) || { id: spot.id, mapQuery: '' };
    const typeObj = TYPES[spot.typeId] || { id: spot.typeId, colorClass: '' };

    return {
      ...spot,
      name: { zh: zhData.name, ja: jaData.name },
      desc: { zh: zhData.desc, ja: jaData.desc },
      tags: { zh: zhData.tags, ja: jaData.tags },
      mapQuery: link.mapQuery,
      typeColorClass: typeObj.colorClass
    };
  });
}

export const DB = getJoinedSpots();

export {
  TYPES,
  WARD_KEYS,
  AREA_KEYS,
  SPOTS
};
