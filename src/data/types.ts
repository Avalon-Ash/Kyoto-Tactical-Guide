import { I18nText } from '../types';

export const TYPE_KEYS = ['T_ALL', 'T_HUB', 'T_SHOP', 'T_TEMPLE', 'T_MODERN', 'T_NATURE', 'T_ACG', 'T_FOOD'];

export interface SpotTypeMetadata {
  id: string;
  colorClass: string;
  color: string;
  name: I18nText;
}

export const TYPES: Record<string, SpotTypeMetadata> = {
  T_ALL:    { id: 'T_ALL',    colorClass: "border-[#e6c27a]/30", color: "#e6c27a", name: { zh: "總覽", ja: "総覧" } },
  T_HUB:    { id: 'T_HUB',    colorClass: "border-[#7aa5d4]",     color: "#7aa5d4", name: { zh: "彈藥庫・交通", ja: "宿駅・交通" } },
  T_SHOP:   { id: 'T_SHOP',   colorClass: "border-[#d4a74a]",     color: "#d4a74a", name: { zh: "物資站・商舖", ja: "町屋・商舗" } },
  T_TEMPLE: { id: 'T_TEMPLE', colorClass: "border-[#c47070]",     color: "#c47070", name: { zh: "古剎・名勝", ja: "古刹・名勝" } },
  T_MODERN: { id: 'T_MODERN', colorClass: "border-[#6aab82]",     color: "#6aab82", name: { zh: "現代・設施", ja: "現代・施設" } },
  T_NATURE: { id: 'T_NATURE', colorClass: "border-[#7ab89a]",     color: "#7ab89a", name: { zh: "山水・景觀", ja: "山水・景観" } },
  T_ACG:    { id: 'T_ACG',    colorClass: "border-[#ff7eb6]",     color: "#ff7eb6", name: { zh: "二次元・動漫", ja: "二次元・アニメ" } },
  T_FOOD:   { id: 'T_FOOD',   colorClass: "border-[#e67e22]",     color: "#e67e22", name: { zh: "補給點・餐飲", ja: "グルメ・飲食" } }
};

export const TYPE_NAMES: Record<string, I18nText> = Object.entries(TYPES).reduce((acc, [key, val]) => {
  acc[key] = val.name;
  return acc;
}, {} as Record<string, I18nText>);
