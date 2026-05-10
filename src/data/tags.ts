/**
 * @layer SSOT / Tag Registry（標籤登記層）
 * @module tags
 *
 * 本檔是「御秘帖」功能的唯一資料來源（Single Source of Truth）。
 * 所有標籤的 id、多語系顯示名稱（label.zh / label.ja）、
 * 分組（group）與 emoji 均在此集中定義。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SSOT 原則與禁則
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - 標籤 id（key）以繁體中文或英文大寫定義（例：'正餐'、'ACG'）
 * - 標籤 id 同時作為 spots/*.ts 中 tagIds 陣列的外鍵，兩端必須完全一致
 * - label.ja 為日文顯示名稱（可為假名或日文漢字），不可與 id 混用
 * - 禁止在 spots/ 任何資料檔中直接寫入未登記於本檔的標籤字串
 * - 禁止在 HomeView.tsx、SpotCard.tsx 等 UI 層硬編碼標籤名稱
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 分組（group）定義
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * food      — 餐飲類：正餐、喫茶、懷石、燒肉、抹茶、和菓子等
 * misc      — 旅行特質：名物、打卡、隱密、老舖、經典、購物等
 * culture   — 文化信仰：神社、寺院、世界遺產、庭園、歷史、博物館等
 * nature    — 自然風景：賞花、楓葉、山岳、自然、展望等
 * transport — 交通要道：鐵道、地鐵、巴士
 * acg       — 次文化聖地：ACG（動畫・漫畫・遊戲相關景點）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 新增標籤規則
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 1. 在本檔 TAG_REGISTRY 中新增 TagMeta 物件
 * 2. 同步更新 PINNED_GLOBAL_TAGS（若需要在御秘帖首頁置頂顯示）
 * 3. 確認 spots/ 資料檔的 tagIds 使用相同的 id 字串
 * 4. 禁止新增語意模糊的標籤（例：「美食」應改用「名物」或具體類型）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PINNED_GLOBAL_TAGS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 供 HomeView.tsx「御秘帖」模式首頁置頂展示的固定標籤列表。
 * 僅影響顯示順序，不影響資料完整性。
 * 修改此陣列不需要同步 any other file.
 */
import { I18nText } from '../types';

export interface TagMeta {
  id: string;
  label: I18nText;
  group: 'food' | 'transport' | 'culture' | 'nature' | 'acg' | 'misc';
  emoji?: string;
}

export const TAG_REGISTRY: Record<string, TagMeta> = {
  // --- food group ---
  '正餐':  { id: '正餐',  label: { zh: '正餐', ja: '食事'   }, group: 'food', emoji: '🍽️' },
  '喫茶':  { id: '喫茶',  label: { zh: '喫茶', ja: '喫茶'   }, group: 'food', emoji: '☕' },
  '懷石':  { id: '懷石',  label: { zh: '懷石', ja: '懐石'   }, group: 'food', emoji: '🍱' },
  '燒肉':  { id: '燒肉',  label: { zh: '燒肉',  ja: '焼肉'   }, group: 'food', emoji: '🥩' },
  '壽喜燒': { id: '壽喜燒', label: { zh: '壽喜燒', ja: 'すき焼き' }, group: 'food', emoji: '🥢' },
  '拉麵':  { id: '拉麵',  label: { zh: '拉麵',  ja: 'ラーメン' }, group: 'food', emoji: '🍜' },
  '烏龍':  { id: '烏龍',  label: { zh: '烏龍',  ja: 'うどん' }, group: 'food', emoji: '🥣' },
  '壽司':  { id: '壽司',  label: { zh: '壽司',  ja: '寿司'   }, group: 'food', emoji: '🍣' },
  '蕎麥':  { id: '蕎麥',  label: { zh: '蕎麥',  ja: 'そば'   }, group: 'food', emoji: '🌾' },
  '豆腐':  { id: '豆腐',  label: { zh: '豆腐料理', ja: '豆腐料理' }, group: 'food', emoji: '🫘' },
  '天婦羅':{ id: '天婦羅',label: { zh: '天婦羅',ja: '天ぷら'}, group: 'food', emoji: '🍤' },
  '抹茶':  { id: '抹茶',  label: { zh: '抹茶', ja: '抹茶'   }, group: 'food', emoji: '🍵' },
  '和菓子': { id: '和菓子', label: { zh: '和菓子', ja: '和菓子' }, group: 'food', emoji: '🍡' },
  '洋菓子': { id: '洋菓子', label: { zh: '洋菓子', ja: '洋菓子' }, group: 'food', emoji: '🍰' },
  // --- misc group ---
  '名物':  { id: '名物',  label: { zh: '名物', ja: '名物'   }, group: 'misc', emoji: '⭐' },
  '打卡':  { id: '打卡',  label: { zh: '打卡', ja: '映え'   }, group: 'misc', emoji: '📸' },
  '隱密':  { id: '隱密',  label: { zh: '隱密', ja: '穴場'   }, group: 'misc', emoji: '🗝️' },
  '老舖':  { id: '老舖',  label: { zh: '老舖', ja: '老舗'   }, group: 'misc', emoji: '🏮' },
  '經典':  { id: '經典',  label: { zh: '經典',  ja: '定番'   }, group: 'misc',   emoji: '✦'  },
  // --- transport group ---
  '鐵道':  { id: '鐵道',  label: { zh: '鐵道', ja: '鉄道'   }, group: 'transport', emoji: '🚃' },
  '地鐵':  { id: '地鐵',  label: { zh: '地鐵', ja: '地下鉄' }, group: 'transport', emoji: '🚇' },
  '巴士':  { id: '巴士',  label: { zh: '巴士', ja: 'バス'   }, group: 'transport', emoji: '🚌' },
  // --- culture group ---
  '世界遺產':{ id: '世界遺產',label:{ zh: '世界遺產',ja: '世界遺産'}, group: 'culture', emoji: '🌐' },
  '庭園':  { id: '庭園',  label: { zh: '庭園', ja: '庭園'   }, group: 'culture', emoji: '🪴' },
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
  '購物':   { id: '購物',   label: { zh: '購物', ja: 'ショッピング'   }, group: 'misc', emoji: '🛍️' },
  '展望':   { id: '展望',   label: { zh: '展望', ja: '展望台'   }, group: 'nature', emoji: '🔭' },
  '現代':   { id: '現代',   label: { zh: '現代', ja: '近代'   }, group: 'misc',   emoji: '🏗️' },
  '涮涮鍋': { id: '涮涮鍋', label: { zh: '涮涮鍋', ja: 'しゃぶしゃぶ' }, group: 'food', emoji: '🍲' },
  '地標':   { id: '地標',   label: { zh: '地標', ja: 'ランドマーク'   }, group: 'misc', emoji: '🗼' },
  '溫泉':   { id: '溫泉',   label: { zh: '溫泉', ja: '温泉'   }, group: 'misc', emoji: '♨️' },
  '國寶':   { id: '國寶',   label: { zh: '國寶', ja: '国宝'   }, group: 'culture', emoji: '💎' },
  '博物館': { id: '博物館', label: { zh: '博物館', ja: '博物館' }, group: 'culture', emoji: '🏛️' },
  '超市':   { id: '超市',   label: { zh: '超市', ja: 'スーパー' }, group: 'misc', emoji: '🛒' },
};

export const TAG_GROUP_LABELS: Record<string, I18nText> = {
  food:      { zh: '口福・食處', ja: '食・口福' },
  misc:      { zh: '旅行特質',   ja: '旅の性格' },
  culture:   { zh: '文化・信仰', ja: '文化・信仰' },
  nature:    { zh: '自然・風景', ja: '自然・風景' },
  transport: { zh: '交通要道',   ja: '交通' },
  acg:       { zh: '次文化',     ja: 'ACG' },
};

// HomeView 首頁展示的固定置頂標籤（全域標籤門戶用）
export const PINNED_GLOBAL_TAGS: string[] = [
  '名物', '抹茶', '和菓子', '懷石', '喫茶', '壽司',
  '拉麵', '蕎麥', '洋菓子', '壽喜燒',
  '老舖', '打卡', '隱密', '庭園', '世界遺產', 'ACG',
  '博物館', '國寶',
];
