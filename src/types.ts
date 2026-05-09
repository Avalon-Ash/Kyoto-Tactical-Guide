export type Lang = 'zh' | 'ja';

/** 景點與元數據 ID 的合法字元規範：僅限大寫字母、數字、底線及連字號 */
export const RE_ID_SLUG = /^[A-Z0-9_\-]+$/;

export type I18nText = Record<Lang, string>;

export type WardKey = 
  | 'W_KITA' | 'W_KAMIGYO' | 'W_SAKYO' | 'W_NAKAGYO' | 'W_HIGASHIYAMA' 
  | 'W_SHIMOGYO' | 'W_MINAMI' | 'W_UKYO' | 'W_NISHIKYO' | 'W_YAMASHINA' | 'W_FUSHIMI';

// 語系無關的 spot schema
export interface SpotSchema {
  id: string;
  wardId: string;
  areaId: string;
  typeId: string;
  mapQuery: string;
  tagIds?: string[]; // 新增：machine-readable 標籤陣列
  reservationRequired?: true;
}

// 單一語系的文字包
export interface SpotLocale {
  name: string;
  desc: string;
  /** 
   * tags 欄位用途：
   * - ZH locale: 須與 schema.tagIds 鏡射（中文 key），同時作為顯示文字與篩選基準。
   * - JA locale: 使用日文標籤供顯示用途（如 '映え', '穴場'），不參與篩選邏輯。
   */
  tags: string;
}

// 最終合併後（給 UI 用）
export interface FlatSpot extends SpotSchema {
  name: string;
  desc: string;
  tags: string;
  /** 僅供地圖外部連結使用的日文名稱，非 ja 語系時由 Assembler 注入 */
  jaName?: string;
}
