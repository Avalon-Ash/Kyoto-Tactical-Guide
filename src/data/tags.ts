import { I18nText } from '../types';

export interface TagMeta {
  id: string;
  label: I18nText;
  group: 'food' | 'transport' | 'culture' | 'nature' | 'acg' | 'misc';
  emoji?: string;
}

export const TAG_REGISTRY: Record<string, TagMeta> = {
  // --- food group ---
  '正餐':  { id: '正餐',  label: { zh: '正餐', ja: '食事'   }, group: 'food', emoji: '🍖' },
  '喫茶':  { id: '喫茶',  label: { zh: '喫茶', ja: '喫茶'   }, group: 'food', emoji: '☕' },
  '懷石':  { id: '懷石',  label: { zh: '懷石', ja: '懐石'   }, group: 'food', emoji: '🍱' },
  '燒肉':  { id: '燒肉',  label: { zh: '燒肉',  ja: '焼肉'   }, group: 'food', emoji: '🥩' },
  '壽喜燒': { id: '壽喜燒', label: { zh: '壽喜燒', ja: 'すき焼き' }, group: 'food', emoji: '🍲' },
  '拉麵':  { id: '拉麵',  label: { zh: '拉麵',  ja: 'ラーメン' }, group: 'food', emoji: '🍜' },
  '烏龍':  { id: '烏龍',  label: { zh: '烏龍',  ja: 'うどん' }, group: 'food', emoji: '🍝' },
  '壽司':  { id: '壽司',  label: { zh: '壽司',  ja: '寿司'   }, group: 'food', emoji: '🍣' },
  '蕎麥':  { id: '蕎麥',  label: { zh: '蕎麥',  ja: 'そば'   }, group: 'food', emoji: '🍜' },
  '豆腐':  { id: '豆腐',  label: { zh: '豆腐料理', ja: '豆腐料理' }, group: 'food', emoji: '🫙' },
  '天婦羅':{ id: '天婦羅',label: { zh: '天婦羅',ja: '天ぷら'}, group: 'food' },
  '抹茶':  { id: '抹茶',  label: { zh: '抹茶', ja: '抹茶'   }, group: 'food', emoji: '🍵' },
  '和菓子': { id: '和菓子', label: { zh: '和菓子', ja: '和菓子' }, group: 'food', emoji: '🍡' },
  '洋菓子': { id: '洋菓子', label: { zh: '洋菓子', ja: '洋菓子' }, group: 'food', emoji: '🍰' },
  '和牛':  { id: '和牛',  label: { zh: '和牛', ja: '和牛'   }, group: 'food', emoji: '🥩' },
  // --- misc group ---
  '必吃':  { id: '必吃',  label: { zh: '必吃', ja: '必食'   }, group: 'misc', emoji: '🔥' },
  '打卡':  { id: '打卡',  label: { zh: '打卡', ja: '映え'   }, group: 'misc', emoji: '📸' },
  '隱密':  { id: '隱密',  label: { zh: '隱密', ja: '穴場'   }, group: 'misc', emoji: '🗝️' },
  '老舖':  { id: '老舖',  label: { zh: '老舖', ja: '老舗'   }, group: 'misc', emoji: '🏮' },
  '經典':  { id: '經典',  label: { zh: '經典',  ja: '定番'   }, group: 'misc',   emoji: '✦'  },
  // --- transport group ---
  '鐵道':  { id: '鐵道',  label: { zh: '鐵道', ja: '鉄道'   }, group: 'transport', emoji: '🚃' },
  '地鐵':  { id: '地鐵',  label: { zh: '地鐵', ja: '地下鉄' }, group: 'transport', emoji: '🚇' },
  '巴士':  { id: '巴士',  label: { zh: '巴士', ja: 'バス'   }, group: 'transport', emoji: '🚌' },
  // --- culture group ---
  '世界遺產':{ id: '世界遺產',label:{ zh: '世界遺產',ja: '世界遺産'}, group: 'culture', emoji: '🏛️' },
  '庭園':  { id: '庭園',  label: { zh: '庭園', ja: '庭園'   }, group: 'culture', emoji: '🌸' },
  '神社':  { id: '神社',  label: { zh: '神社', ja: '神社'   }, group: 'culture', emoji: '⛩️' },
  '寺院':  { id: '寺院',  label: { zh: '寺院', ja: '寺院'   }, group: 'culture', emoji: '🛕' },
  // --- nature group ---
  '楓葉':  { id: '楓葉',  label: { zh: '楓葉', ja: '紅葉'   }, group: 'nature', emoji: '🍁' },
  '賞花':  { id: '賞花',  label: { zh: '賞花', ja: 'お花見' }, group: 'nature', emoji: '🌸' },
  '山岳':  { id: '山岳',  label: { zh: '山岳', ja: '山'     }, group: 'nature', emoji: '🗻' },
  '自然':  { id: '自然',  label: { zh: '自然',  ja: '自然'   }, group: 'nature', emoji: '🌿' },
  // --- acg group ---
  'ACG':   { id: 'ACG',   label: { zh: 'ACG',  ja: 'ACG'    }, group: 'acg', emoji: '🎮' },
  // --- added missing ---
  '歷史':   { id: '歷史',   label: { zh: '歷史', ja: '歴史'   }, group: 'culture', emoji: '📜' },
  '購物':   { id: '購物',   label: { zh: '購物', ja: '買い物' }, group: 'misc', emoji: '🛍️' },
  '展望':   { id: '展望',   label: { zh: '展望', ja: '展望'   }, group: 'nature', emoji: '🔭' },
  '現代':   { id: '現代',   label: { zh: '現代', ja: '現代'   }, group: 'misc',   emoji: '🏢' },
  '美食':   { id: '美食',   label: { zh: '美食', ja: 'グルメ' }, group: 'food',   emoji: '😋' },
};

// HomeView 首頁展示的固定置頂標籤（全域標籤門戶用）
export const PINNED_GLOBAL_TAGS: string[] = [
  '必吃', '抹茶', '和菓子', '洋菓子', '懷石', '燒肉', '壽司', '拉麵',
  '喫茶', '老舖', '打卡', '隱密', '庭園', '世界遺產', 'ACG',
];
