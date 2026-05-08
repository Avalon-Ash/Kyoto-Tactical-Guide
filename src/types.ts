export type Lang = 'zh' | 'ja';

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
  typeColorClass: string;
}

// 單一語系的文字包
export interface SpotLocale {
  name: string;
  desc: string;
  tags: string;
}

// 最終合併後（給 UI 用）
export interface FlatSpot extends SpotSchema {
  name: string;
  desc: string;
  tags: string;
  jaName: string;
}
