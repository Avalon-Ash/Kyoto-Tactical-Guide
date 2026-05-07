import { DBType } from '../types';

export const TYPES: Record<string, DBType> = {
  T_ALL:    { id: 'T_ALL', colorClass: "border-[#e6c27a]/30", color: "#e6c27a" },
  T_HUB:    { id: 'T_HUB', colorClass: "border-[#7aa5d4]", color: "#7aa5d4" },
  T_SHOP:   { id: 'T_SHOP', colorClass: "border-[#d4a74a]", color: "#d4a74a" },
  T_TEMPLE: { id: 'T_TEMPLE', colorClass: "border-[#c47070]", color: "#c47070" },
  T_MODERN: { id: 'T_MODERN', colorClass: "border-[#6aab82]", color: "#6aab82" },
  T_NATURE: { id: 'T_NATURE', colorClass: "border-[#7ab89a]", color: "#7ab89a" },
  T_ACG:    { id: 'T_ACG',    colorClass: "border-[#ff7eb6]", color: "#ff7eb6" },
  T_FOOD:   { id: 'T_FOOD',   colorClass: "border-[#e67e22]", color: "#e67e22" }
};

export const WARD_KEYS = [
  'W_KITA', 'W_KAMIGYO', 'W_SAKYO', 'W_NAKAGYO', 'W_HIGASHIYAMA', 
  'W_SHIMOGYO', 'W_MINAMI', 'W_UKYO', 'W_NISHIKYO', 'W_YAMASHINA', 'W_FUSHIMI'
];

export const AREA_KEYS = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
  'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19'
];
