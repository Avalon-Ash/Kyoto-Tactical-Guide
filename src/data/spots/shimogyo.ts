/**
 * @layer SSOT / Schema（結構層）
 * @ward W_SHIMOGYO — 下京區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/shimogyo.ts
 *   src/data/locales/ja/shimogyo.ts
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

export const SHIMOGYO_SCHEMA: SpotSchema[] = [
  { id: 'SG-001', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'SG-002', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'SG-003', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '經典', '打卡'] },
  { id: 'SG-004', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '經典', '打卡', '國寶'] },
  { id: 'SG-005', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['地標', '打卡', '現代'] },
  { id: 'SG-006', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['經典', '打卡', '購物'] },
  { id: 'SG-007', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['賞花', '自然'] },
  { id: 'SG-008', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡', '現代', '博物館'] },
  { id: 'SG-009', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡', '現代', '博物館'] },
  { id: 'SG-010', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'SG-011', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'SG-012', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'SG-013', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'SG-014', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡'] },
  { id: 'SG-015', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['庭園', '打卡'] },
  { id: 'SG-016', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['打卡', '購物'] },
  { id: 'SG-017', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡', '購物'] },
  { id: 'SG-018', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡', '購物'] },
  { id: 'SG-019', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', tagIds: ['現代', '打卡', '博物館'] },
  { id: 'SG-020', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', tagIds: ['現代', '打卡', '博物館'] },
  { id: 'SG-021', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'SG-022', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'SG-023', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['正餐', '名物', '老舖'] },
  { id: 'SG-024', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['打卡', '歷史'] },
  { id: 'SG-025', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡', '歷史'] },
  { id: 'SG-026', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡', '歷史'] },
  { id: 'SG-027', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', tagIds: ['打卡', '隱密'] },
  { id: 'SG-028', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-029', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '老舖', '懷石'] },
  { id: 'SG-030', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['購物'] },
  { id: 'SG-031', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-032', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-033', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-034', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-035', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-036', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-037', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'SG-038', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_NATURE', tagIds: ['打卡', '自然'] },
  { id: 'SG-039', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SG-040', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['購物'] },
  { id: 'SG-041', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'SG-042', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SG-043', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'SG-044', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'SG-045', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_ACG', tagIds: ['ACG', '打卡', '現代'] },
  { id: 'SG-046', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'SG-047', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'SG-048', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['抹茶', '和菓子', '老舖', '名物'] },
  { id: 'SG-049', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SG-050', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_NATURE', tagIds: ['打卡', '賞花'] },
  { id: 'SG-051', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'SG-052', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'SG-053', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', tagIds: ['ACG', '賞花'] },
  { id: 'SG-054', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密', '打卡'] },
  { id: 'SG-055', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'SG-056', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '老舖', '拉麵'] },
  { id: 'SG-057', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '老舖', '拉麵'] },
  { id: 'SG-058', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡', '現代'] },
  { id: 'SG-059', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', tagIds: ['打卡', '現代'] },
  { id: 'SG-060', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '打卡'] },
  { id: 'SG-061', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '隱密'] },
  { id: 'SG-062', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡', '隱密'] },
  { id: 'SG-064', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['現代', '打卡', '購物'] },
  { id: 'SG-065', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['抹茶', '和菓子', '名物', '打卡'] },
  { id: 'SG-066', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['洋菓子', '名物', '打卡', '抹茶'] },
  { id: 'SG-067', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'SG-068', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'SG-069', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['和菓子', '名物', '老舖'] },
  { id: 'SG-070', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '壽司'] },
  { id: 'SG-071', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'SG-072', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'SG-073', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '老舖'] },
  { id: 'SG-074', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '燒肉'] },
  { id: 'SG-076', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '壽喜燒'] },
  { id: 'SG-077', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '壽司'] },
  { id: 'SG-078', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'SG-080', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉'] },
  { id: 'SG-081', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉'] },
  { id: 'SG-082', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡'] },
  { id: 'SG-083', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '打卡'] },
  { id: 'SG-084', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '蕎麥'] },
  { id: 'SG-085', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'SG-086', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'SG-087', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['購物', '打卡'] },
  { id: 'SG-088', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'SG-089', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'SG-090', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'SG-091', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['超市'] },
];
