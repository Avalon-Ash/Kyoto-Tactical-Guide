import { I18nText, WardKey } from '../types';

export const AREA_KEYS = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
  'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19'
];

export const AREA_NAMES: Record<string, I18nText> = {
  // ... (entries remain same)
};

export const AREA_BY_WARD: Record<WardKey, string[]> = {
  W_KITA: ['A12', 'A14'],
  W_KAMIGYO: ['A02', 'A03', 'A12'],
  W_SAKYO: ['A02', 'A05', 'A06', 'A14', 'A15', 'A16', 'A17'],
  W_NAKAGYO: ['A01', 'A03', 'A04'],
  W_HIGASHIYAMA: ['A05', 'A06', 'A07', 'A13'],
  W_SHIMOGYO: ['A01', 'A04', 'A05'],
  W_MINAMI: ['A04', 'A10'],
  W_UKYO: ['A09', 'A11', 'A12', 'A18'],
  W_NISHIKYO: ['A09', 'A10', 'A19'],
  W_YAMASHINA: ['A08'],
  W_FUSHIMI: ['A08', 'A13']
};

export const WARD_BY_AREA: Record<string, WardKey[]> = Object.entries(AREA_BY_WARD).reduce((acc, [ward, areas]) => {
  areas.forEach(area => {
    if (!acc[area]) acc[area] = [];
    acc[area].push(ward as WardKey);
  });
  return acc;
}, {} as Record<string, WardKey[]>);
