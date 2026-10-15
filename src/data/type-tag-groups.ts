/**
 * @layer SSOT / Type → Tag Group Whitelist（主 Tab 副標籤白名單）
 * @module type-tag-groups
 *
 * 主 Tab（typeId）→ 允許顯示的 tag group 對應表，供 DetailView 的 B 層副標籤列使用。
 * 本表必須涵蓋 `TYPES`（src/data/types.ts）的每一個 typeId，且不得出現未登記的 typeId；
 * `validate_data.js` 會檢查兩端是否同步。
 *
 * 禁止在 useKyotoEngine、TagSelector、spots 資料層複製此映射；
 * 禁止將此表套用於御秘帖（Tag Mode）的標籤渲染。
 */
import { TagMeta } from './tags';

export type TagGroup = TagMeta['group'];

export const TYPE_TAG_GROUP_MAP: Record<string, TagGroup[]> = {
  // 總覽：全部開放
  T_ALL:    ['food', 'misc', 'culture', 'nature', 'transport', 'acg'],
  // 交通要津：交通節點 + 旅行特質
  T_HUB:    ['transport', 'misc'],
  // 寺社・名所：文化信仰 + 自然（庭園楓葉常見）+ 旅行特質
  T_TEMPLE: ['culture', 'nature', 'misc'],
  // 商肆・茶寮：旅行特質（名物、老舖）+ 食物細分（抹茶、和菓子）
  T_SHOP:   ['misc', 'food'],
  // 近代設施：旅行特質 + 文化（博物館等）
  T_MODERN: ['misc', 'culture'],
  // 山水・風雅：自然 + 旅行特質
  T_NATURE: ['nature', 'misc'],
  // 口福・食處：食物細分 + 旅行特質
  T_FOOD:   ['food', 'misc'],
  // 幻夢・繪草子：ACG + 旅行特質
  T_ACG:    ['acg', 'misc'],
};

// Fallback：若 typeId 不在對應表中，預設顯示 misc + culture
export const DEFAULT_TAG_GROUPS: TagGroup[] = ['misc', 'culture'];
