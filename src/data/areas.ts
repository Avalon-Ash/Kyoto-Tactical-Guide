import { I18nText } from '../types';

export const AREA_KEYS = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
  'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19'
];

export const AREA_NAMES: Record<string, I18nText> = {
  A01: { zh: "洛中（京都市心）", ja: "洛中 (都の核心)" },
  A02: { zh: "京都御所・下鴨", ja: "京都御所・下鴨" },
  A03: { zh: "二條城・西陣", ja: "二条城・西陣" },
  A04: { zh: "京洛門戶周邊", ja: "京都駅・八条界隈" },
  A05: { zh: "哲學之道・岡崎", ja: "哲学の道・岡崎" },
  A06: { zh: "祇園・清水寺", ja: "祇園・清水寺" },
  A07: { zh: "三十三間堂・東福寺", ja: "三十三間堂・東福寺" },
  A08: { zh: "山科・醍醐", ja: "山科・醍醐" },
  A09: { zh: "嵯峨・嵐山", ja: "嵯峨・嵐山" },
  A10: { zh: "桂・大原野", ja: "桂・大原野" },
  A11: { zh: "高雄", ja: "高雄" },
  A12: { zh: "金閣寺・御室・太秦", ja: "金閣寺・御室・太秦" },
  A13: { zh: "伏見", ja: "伏見" },
  A14: { zh: "上賀茂・北山", ja: "上賀茂・北山" },
  A15: { zh: "一乘寺・修學院", ja: "一乗寺・修学院" },
  A16: { zh: "大原・八瀨・比叡", ja: "大原・八瀬・比叡山" },
  A17: { zh: "鞍馬・貴船・花背", ja: "鞍馬・貴船・花背" },
  A18: { zh: "京北", ja: "京北" },
  A19: { zh: "西山", ja: "西山" }
};

export const AREA_BY_WARD: Record<string, string[]> = {
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

export const WARD_BY_AREA: Record<string, string[]> = Object.entries(AREA_BY_WARD).reduce((acc, [ward, areas]) => {
  areas.forEach(area => {
    if (!acc[area]) acc[area] = [];
    acc[area].push(ward);
  });
  return acc;
}, {} as Record<string, string[]>);
