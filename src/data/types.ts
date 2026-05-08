import { I18nText } from '../types';

export interface SpotTypeMetadata {
  id: string;
  colorClass: string;
  color: string;
  sortOrder: number;
  name: I18nText;
  emoji?: string;
}

export const TYPES: Record<string, SpotTypeMetadata> = {
  T_ALL:    { id: 'T_ALL',    colorClass: "border-[#e6c27a]/30", color: "#e6c27a", sortOrder: 0, name: { zh: "總覽", ja: "総覧" }, emoji: '✦' },
  T_HUB:    { id: 'T_HUB',    colorClass: "border-[#7aa5d4]",     color: "#7aa5d4", sortOrder: 1, name: { zh: "交通要津", ja: "道の要" }, emoji: '🚉' },
  T_TEMPLE: { id: 'T_TEMPLE', colorClass: "border-[#c47070]",     color: "#c47070", sortOrder: 2, name: { zh: "寺社・名所", ja: "寺社・名所" }, emoji: '⛩️' },
  T_SHOP:   { id: 'T_SHOP',   colorClass: "border-[#d4a74a]",     color: "#d4a74a", sortOrder: 3, name: { zh: "商肆・茶寮", ja: "商家・茶寮" }, emoji: '🛍️' },
  T_MODERN: { id: 'T_MODERN', colorClass: "border-[#6aab82]",     color: "#6aab82", sortOrder: 4, name: { zh: "近代設施", ja: "近代施設" }, emoji: '🏛️' },
  T_NATURE: { id: 'T_NATURE', colorClass: "border-[#7ab89a]",     color: "#7ab89a", sortOrder: 5, name: { zh: "山水・風雅", ja: "山水・景観" }, emoji: '🌸' },
  T_FOOD:   { id: 'T_FOOD',   colorClass: "border-[#e67e22]",     color: "#e67e22", sortOrder: 6, name: { zh: "口福・食處", ja: "口福・食処" }, emoji: '🍖' },
  T_ACG:    { id: 'T_ACG',    colorClass: "border-[#ff7eb6]",     color: "#ff7eb6", sortOrder: 7, name: { zh: "幻夢・繪草子", ja: "幻夢・絵草紙" }, emoji: '🎮' }
};

export const TYPE_KEYS = [
  'T_ALL',
  ...Object.values(TYPES)
    .filter(t => t.id !== 'T_ALL')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(t => t.id)
];

export const TYPE_NAMES: Record<string, I18nText> = Object.entries(TYPES).reduce((acc, [key, val]) => {
  acc[key] = val.name;
  return acc;
}, {} as Record<string, I18nText>);
