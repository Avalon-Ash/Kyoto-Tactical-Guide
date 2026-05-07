export type Lang = 'zh' | 'ja';

export interface I18nText {
  zh: string;
  ja: string;
}

export interface DBType {
  id: string;
  colorClass: string;
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
