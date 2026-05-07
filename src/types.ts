export type Lang = 'zh' | 'ja';

export type I18nText = Record<Lang, string>;

export type WardKey = 
  | 'W_KITA' | 'W_KAMIGYO' | 'W_SAKYO' | 'W_NAKAGYO' | 'W_HIGASHIYAMA' 
  | 'W_SHIMOGYO' | 'W_MINAMI' | 'W_UKYO' | 'W_NISHIKYO' | 'W_YAMASHINA' | 'W_FUSHIMI';

export type AreaKey = string; // Simplified for now unless I find a better definition

export interface DBType {
  id: string;
  colorClass: string;
  color: string;
}

export interface SpotRecord {
  id: string;
  wardId: string;
  areaId: string;
  typeId: string;
}

export interface SpotLangRecord {
  id: string;
  name: string;
  desc: string;
  tags: string;
}

export interface SpotLinkRecord {
  id: string;
  mapQuery: string;
}

export interface JoinedSpot {
  id: string;
  wardId: string;
  areaId: string;
  typeId: string;
  name: I18nText;
  desc: I18nText;
  tags: I18nText;
  mapQuery: string;
  typeColorClass: string;
}
