/**
 * @layer SSOT / Schema（結構層）
 * @ward W_KAMIGYO — 上京區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/kamigyo.ts
 *   src/data/locales/ja/kamigyo.ts
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
 *               豆腐  洋菓子  蕎麥  燒肉  放題
 *   ── 商業 ──  購物  超市  博物館
 *   ── 地物 ──  地標  溫泉  展望
 *
 * 禁則：T_FOOD 禁用「世界遺產」標籤 / 禁用模糊標籤「美食」「必吃」
 */
import { SpotSchema } from '../../types';

export const KAMIGYO_SCHEMA: SpotSchema[] = [
  { id: 'KG-001', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花', '經典', '打卡', '國寶'] },
  { id: 'KG-002', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'KG-003', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '國寶'] },
  { id: 'KG-004', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'KG-005', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'KG-006', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花'] },
  { id: 'KG-007', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['庭園', '打卡', '國寶'] },
  { id: 'KG-008', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_NATURE', tagIds: ['賞花', '楓葉'] },
  { id: 'KG-009', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'KG-011', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_SHOP', tagIds: ['打卡', '老舖'] },
  { id: 'KG-012', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'KG-013', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'KG-014', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'KG-015', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'KG-016', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['打卡', '歷史'] },
  { id: 'KG-017', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['打卡', '博物館'] },
  { id: 'KG-018', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'KG-019', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'KG-020', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'KG-021', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['賞花', '打卡'] },
  { id: 'KG-022', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['賞花'] },
  { id: 'KG-023', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'KG-024', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'KG-025', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'KG-026', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'KG-027', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'KG-028', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '賞花', '隱密'] },
  { id: 'KG-029', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'KG-030', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'KG-031', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'KG-032', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'KG-033', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['打卡', '隱密'] },
  { id: 'KG-034', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'KG-035', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['老舖', '打卡', '博物館'] },
  { id: 'KG-036', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'KG-038', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'KG-039', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'KG-040', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'KG-045', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['打卡', '博物館'] },
  { id: 'KG-046', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '老舖', '打卡'], reservationRequired: true },
  { id: 'KG-047', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_MODERN', tagIds: ['打卡', '賞花'] },
  { id: 'KG-048', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_NATURE', tagIds: ['庭園'] },
  { id: 'KG-049', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_NATURE', tagIds: ['打卡', '隱密'] },
  { id: 'KG-050', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_NATURE', tagIds: ['賞花'] },
  { id: 'KG-051', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_ACG', tagIds: ['ACG', '神社'] },
  { id: 'KG-052', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_ACG', tagIds: ['ACG', '神社'] },
  { id: 'KG-053', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'KG-054', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'KG-055', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'KG-057', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐', '懷石', '隱密'] },
  { id: 'KG-058', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '打卡'] },
  { id: 'KG-060', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_FOOD', tagIds: ['正餐', '烏龍', '老舖', '名物'] },
  { id: 'KG-061', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['洋菓子', '名物'] },
  { id: 'KG-062', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐'] },
  { id: 'KG-063', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['老舖', '打卡', '歷史'] },
  { id: 'KG-064', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['和菓子', '隱密'] },
  { id: 'KG-070', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_SHOP', tagIds: ['購物', '名物', '打卡'] },
  { id: 'KG-072', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'KG-073', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密', '老舖'] },
  { id: 'KG-074', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'KG-075', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'KG-077', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '隱密'], reservationRequired: true },
  { id: 'KG-079', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_SHOP', tagIds: ['購物', '歷史', '現代'] },
  { id: 'KG-080', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_SHOP', tagIds: ['打卡', 'ACG'] },
  { id: 'KG-081', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'KG-082', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['喫茶', '現代', '打卡'] },
  { id: 'KG-083', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'KG-084', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐', '懷石', '隱密'] },
];
