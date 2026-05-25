/**
 * @layer SSOT / Schema（結構層）
 * @ward W_KITA — 北區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/kita.ts
 *   src/data/locales/ja/kita.ts
 *
 * 食處查核規則：所有與「食」相關（T_FOOD / 餐飲標籤）之新增修改，必須與 tabelog.com 進行事實查核，嚴禁停業舊資料。
 *
 * 合法 typeId：
 *   T_HUB=交通要津  T_TEMPLE=寺社名所  T_SHOP=商肆茶寮
 *   T_FOOD=口福食處  T_NATURE=山水風景  T_MODERN=近代設施  T_ACG=ACG聖地
 *
 * 類型禁則：通道散策路→T_SHOP非T_HUB / 橋梁河畔→T_NATURE非T_SHOP / 展望台廣場→T_MODERN非T_NATURE
 *
 * 合法 tagIds（從此集合選用，最多 6 個）：
 *   ── 交通 ──  地鐵  巴士  鐵道
 *   ── 文化 ──  寺院  神社  世界遺產  庭園  山岳  歷史  國寶
 *   ── 自然 ──  自然  賞花  楓葉
 *   ── 體驗 ──  打卡  ACG  現代  經典  隱密
 *   ── 飲食 ──  正餐  喫茶  和菓子  抹茶  老舖  名物
 *               壽司  拉麵  烏龍  天婦羅  壽喜燒  涮涮鍋  懷石
 *               豆腐  洋菓子  蕎麥  燒肉
 *   ── 商業 ──  購物  超市  博物館
 *   ── 地物 ──  地標  溫泉  展望
 *
 * 禁則：T_FOOD 禁用「世界遺產」標籤 / 禁用模糊標籤「美食」「必吃」
 */
import { SpotSchema } from '../../types';

export const KITA_SCHEMA: SpotSchema[] = [
  { id: 'KT-001', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'KT-002', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'KT-003', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'KT-004', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'KT-005', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '打卡', '國寶', '庭園'] },
  { id: 'KT-006', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '國寶'] },
  { id: 'KT-007', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花'] },
  { id: 'KT-008', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花'] },
  { id: 'KT-009', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'KT-010', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'KT-013', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'KT-014', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'KT-015', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['神社', '世界遺產', '打卡', '國寶'] },
  { id: 'KT-016', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'KT-017', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '楓葉', '隱密'] },
  { id: 'KT-018', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '楓葉', '打卡'] },
  { id: 'KT-019', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '賞花'] },
  { id: 'KT-020', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_NATURE', tagIds: ['山岳'] },
  { id: 'KT-024', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'KT-025', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'KT-026', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花', '打卡'] },
  { id: 'KT-027', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_MODERN', tagIds: ['打卡', '老舖', '溫泉'] },
  { id: 'KT-029', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'KT-032', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_MODERN', tagIds: ['打卡', '博物館'] },
  { id: 'KT-033', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'KT-034', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'KT-035', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['自然', '隱密'] },
  { id: 'KT-036', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_MODERN', tagIds: ['打卡', '隱密'] },
  { id: 'KT-037', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['賞花'] },
  { id: 'KT-038', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['山岳'] },
  { id: 'KT-040', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_SHOP', tagIds: ['洋菓子', '打卡'] },
  { id: 'KT-041', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'KT-042', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'KT-046', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'KT-047', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '名物', '拉麵'] },
  { id: 'KT-048', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['正餐', '打卡', '名物'] },
  { id: 'KT-049', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '名物'] },
  { id: 'KT-050', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'KT-051', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_ACG', tagIds: ['ACG', '神社'] },
  { id: 'KT-053', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_ACG', tagIds: ['ACG', '鐵道'] },
  { id: 'KT-054', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'KT-056', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'KT-057', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '隱密'] },
  { id: 'KT-059', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡', '自然'] },
  { id: 'KT-061', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'KT-062', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['和菓子', '名物', '隱密'], reservationRequired: true },
  { id: 'KT-066', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['正餐', '蕎麥', '打卡'] },
  { id: 'KT-068', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_FOOD', tagIds: ['喫茶', '現代'] },
  { id: 'KT-069', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['神社', '歷史', '隱密'] },
  { id: 'KT-070', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密', '經典'] },
  { id: 'KT-071', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_MODERN', tagIds: ['庭園', '打卡', '現代'] },
  { id: 'KT-072', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_SHOP', tagIds: ['購物', 'ACG', '現代'] },
  { id: 'KT-075', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['自然', '賞花'] },
  { id: 'KT-076', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡', '老舖'] },
];
