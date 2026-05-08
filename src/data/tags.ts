import { I18nText } from '../types';

export interface TagMeta {
  id: string;
  label: I18nText;
  group: 'food' | 'transport' | 'culture' | 'nature' | 'acg' | 'misc';
}

export const TAG_REGISTRY: Record<string, TagMeta> = {
  // --- food group ---
  '正餐':  { id: '正餐',  label: { zh: '正餐', ja: '食事'   }, group: 'food' },
  '甜點':  { id: '甜點',  label: { zh: '甜點', ja: '甘味'   }, group: 'food' },
  '喫茶':  { id: '喫茶',  label: { zh: '喫茶', ja: '喫茶'   }, group: 'food' },
  '懷石':  { id: '懷石',  label: { zh: '懷石', ja: '懷石'   }, group: 'food' },
  '壽喜燒':{ id: '壽喜燒',label: { zh: '壽喜燒',ja: 'すき焼'}, group: 'food' },
  '天婦羅':{ id: '天婦羅',label: { zh: '天婦羅',ja: '天ぷら'}, group: 'food' },
  '抹茶':  { id: '抹茶',  label: { zh: '抹茶', ja: '抹茶'   }, group: 'food' },
  '和菓子':{ id: '和菓子',label: { zh: '和菓子',ja: '和菓子'}, group: 'food' },
  '和牛':  { id: '和牛',  label: { zh: '和牛', ja: '和牛'   }, group: 'food' },
  // --- misc group ---
  '必吃':  { id: '必吃',  label: { zh: '必吃', ja: '必食'   }, group: 'misc' },
  '打卡':  { id: '打卡',  label: { zh: '打卡', ja: '映え'   }, group: 'misc' },
  '隱密':  { id: '隱密',  label: { zh: '隱密', ja: '穴場'   }, group: 'misc' },
  '老舖':  { id: '老舖',  label: { zh: '老舖', ja: '老舗'   }, group: 'misc' },
  // --- transport group ---
  '地鐵':  { id: '地鐵',  label: { zh: '地鐵', ja: '地下鉄' }, group: 'transport' },
  '巴士':  { id: '巴士',  label: { zh: '巴士', ja: 'バス'   }, group: 'transport' },
  // --- culture group ---
  '世界遺產':{ id: '世界遺產',label:{ zh: '世界遺產',ja: '世界遺産'}, group: 'culture' },
  '庭園':  { id: '庭園',  label: { zh: '庭園', ja: '庭園'   }, group: 'culture' },
  '神社':  { id: '神社',  label: { zh: '神社', ja: '神社'   }, group: 'culture' },
  '寺院':  { id: '寺院',  label: { zh: '寺院', ja: '寺院'   }, group: 'culture' },
  // --- nature group ---
  '楓葉':  { id: '楓葉',  label: { zh: '楓葉', ja: '紅葉'   }, group: 'nature' },
  '賞花':  { id: '賞花',  label: { zh: '賞花', ja: 'お花見' }, group: 'nature' },
  '山岳':  { id: '山岳',  label: { zh: '山岳', ja: '山'     }, group: 'nature' },
  // --- acg group ---
  'ACG':   { id: 'ACG',   label: { zh: 'ACG',  ja: 'ACG'    }, group: 'acg' },
};

// HomeView 首頁展示的固定置頂標籤（全域標籤門戶用）
export const PINNED_GLOBAL_TAGS: string[] = [
  '必吃', '甜點', '抹茶', '老舖', '打卡', '隱密', '懷石', '喫茶', '庭園', '世界遺產', 'ACG',
];
