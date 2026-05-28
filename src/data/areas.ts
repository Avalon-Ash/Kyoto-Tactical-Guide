/**
 * ==============================================================================
 * 【SSOT: 空間架構元數據】 (System Architecture Metadata)
 * 此檔案是整個京都觀光引擎 (Kyoto Engine) 中，掌管「行政區 (Ward)」與「微觀分區 (Area)」
 * 的單一事實來源 (Single Source of Truth, SSOT)。
 * 
 * 核心職責：
 * 1. 定義全市 19 個 Area 的顯示名稱 (`AREA_NAMES`)。
 * 2. 定義 Ward 與 Area 之間的雙向地理從屬關係 (`AREA_BY_WARD`, `WARD_BY_AREA`)。
 * 3. 為雙軌檢索模式 (洛中洛外 Ward Mode / 名所目錄 Area Mode) 提供運算基準。
 * 4. 嚴格防止跨區越界或無效 ID (Schema 防呆)。
 * ==============================================================================
 */
import { I18nText, WardKey } from '../types';

export const AREA_KEYS = [
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10',
  'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19'
];

export const AREA_NAMES: Record<string, I18nText> = {
  A01: { zh: '烏丸・河原町', ja: '烏丸・河原町' },
  A02: { zh: '御所・西陣',   ja: '御所・西陣' },
  A03: { zh: '二条城・堀川', ja: '二条城・堀川' },
  A04: { zh: '東寺・九条',   ja: '東寺・九条' },
  A05: { zh: '祇園・清水寺', ja: '祇園・清水寺' },
  A06: { zh: '岡崎・平安神宮', ja: '岡崎・平安神宮' },
  A07: { zh: '東山・知恩院', ja: '東山・知恩院' },
  A08: { zh: '山科・醍醐',   ja: '山科・醍醐' },
  A09: { zh: '嵯峨野・嵐山', ja: '嵯峨野・嵐山' },
  A10: { zh: '桂・洛西',     ja: '桂・洛西' },
  A11: { zh: '高雄・周山',   ja: '高雄・周山' },
  A12: { zh: '鷹峯・衣笠',   ja: '鷹峯・衣笠' },
  A13: { zh: '伏見・桃山',   ja: '伏見・桃山' },
  A14: { zh: '鞍馬・貴船',   ja: '鞍馬・貴船' },
  A15: { zh: '修学院・一乗寺', ja: '修学院・一乗寺' },
  A16: { zh: '大原・八瀬',   ja: '大原・八瀬' },
  A17: { zh: '花背・久多',   ja: '花背・久多' },
  A18: { zh: '京北・周山街道', ja: '京北・周山街道' },
  A19: { zh: '向日・長岡京', ja: '向日・長岡京' },
};

export const AREA_BY_WARD: Record<WardKey, string[]> = {
  W_KITA: ['A12', 'A14'],
  W_KAMIGYO: ['A02', 'A03', 'A12'],
  W_SAKYO: ['A02', 'A06', 'A14', 'A15', 'A16', 'A17'],
  W_NAKAGYO: ['A01', 'A03'],
  W_HIGASHIYAMA: ['A05', 'A07'],
  W_SHIMOGYO: ['A01', 'A04'],
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
