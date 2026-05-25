/**
 * @layer SSOT / Schema（結構層）
 * @ward W_SAKYO — 左京區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/sakyo.ts
 *   src/data/locales/ja/sakyo.ts
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

export const SAKYO_SCHEMA: SpotSchema[] = [
  { id: 'SK-001', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'SK-002', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_TEMPLE', tagIds: ['神社', '世界遺產', '打卡'] },
  { id: 'SK-003', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_NATURE', tagIds: ['打卡', '自然'] },
  { id: 'SK-004', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡', '庭園', '國寶'] },
  { id: 'SK-005', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['寺院', '楓葉', '打卡', '國寶'] },
  { id: 'SK-006', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '庭園', '國寶'] },
  { id: 'SK-007', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_NATURE', tagIds: ['賞花', '打卡'] },
  { id: 'SK-008', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花', '打卡', '國寶'] },
  { id: 'SK-009', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_NATURE', tagIds: ['賞花'] },
  { id: 'SK-010', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'SK-011', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡', '經典'] },
  { id: 'SK-012', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '山岳'] },
  { id: 'SK-013', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'SK-014', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', tagIds: ['寺院', '楓葉', '打卡'] },
  { id: 'SK-015', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'SK-016', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'SK-017', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'SK-018', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['寺院', '楓葉', '隱密'] },
  { id: 'SK-019', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'SK-020', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'SK-021', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['打卡'] },
  { id: 'SK-022', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', tagIds: ['打卡', '賞花'] },
  { id: 'SK-023', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SK-024', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'SK-025', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'SK-026', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'SK-027', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'SK-028', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'SK-029', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'SK-030', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', tagIds: ['庭園'] },
  { id: 'SK-032', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SK-033', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '打卡', '拉麵'] },
  { id: 'SK-034', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物', '抹茶'] },
  { id: 'SK-035', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_NATURE', tagIds: ['賞花'] },
  { id: 'SK-036', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['自然', '打卡'] },
  { id: 'SK-037', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'SK-038', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '山岳'] },
  { id: 'SK-039', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'SK-041', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'SK-042', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'SK-043', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'SK-044', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'SK-045', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園'] },
  { id: 'SK-046', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'SK-047', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['庭園', '打卡'] },
  { id: 'SK-048', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', tagIds: ['隱密'] },
  { id: 'SK-049', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_MODERN', tagIds: ['打卡', '隱密'] },
  { id: 'SK-050', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '洋菓子', '名物'] },
  { id: 'SK-051', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SK-052', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'SK-053', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'SK-054', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'SK-055', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '名物', '懷石'], reservationRequired: true },
  { id: 'SK-056', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SK-057', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', tagIds: ['打卡', '現代', '博物館'] },
  { id: 'SK-058', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_ACG', tagIds: ['ACG', '鐵道'] },
  { id: 'SK-059', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_ACG', tagIds: ['ACG', '神社'] },
  { id: 'SK-060', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_ACG', tagIds: ['ACG', '自然'] },
  { id: 'SK-061', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_ACG', tagIds: ['ACG', '寺院'] },
  { id: 'SK-062', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_ACG', tagIds: ['ACG', '神社'] },
  { id: 'SK-063', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', tagIds: ['隱密', '博物館'] },
  { id: 'SK-064', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', tagIds: ['打卡', '博物館'] },
  { id: 'SK-066', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '打卡'] },
  { id: 'SK-067', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '老舖', '烏龍'] },
  { id: 'SK-068', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['抹茶', '喫茶', '隱密', '打卡'] },
  { id: 'SK-069', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '烏龍'], reservationRequired: true },
  { id: 'SK-070', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '烏龍'] },
  { id: 'SK-071', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '烏龍', '老舖'] },
  { id: 'SK-072', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', tagIds: ['和菓子', '抹茶', '打卡', '名物'] },
  { id: 'SK-074', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '豆腐'] },
  { id: 'SK-075', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '豆腐'], reservationRequired: true },
  { id: 'SK-076', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', tagIds: ['天婦羅', '正餐', '名物'] },
  { id: 'SK-078', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡'] },
  { id: 'SK-080', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密', '山岳', '國寶'] },
  { id: 'SK-081', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_NATURE', tagIds: ['自然', '打卡'] },
  { id: 'SK-083', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'SK-086', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', tagIds: ['喫茶', '現代'] },
  { id: 'SK-087', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶'] },
  { id: 'SK-088', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密'] },
  { id: 'SK-089', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶'] },
  { id: 'SK-090', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶', '現代'] },
  { id: 'SK-092', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶'] },
  { id: 'SK-093', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡'] },
  { id: 'SK-094', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密'] },
  { id: 'SK-095', wardId: 'W_SAKYO', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '打卡'] },
  { id: 'SK-096', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', tagIds: ['喫茶'] },
  { id: 'SK-097', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', tagIds: ['喫茶'] },
  { id: 'SK-098', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'SK-099', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡', '隱密'] },
  { id: 'SK-100', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '打卡'] },
  { id: 'SK-139', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'SK-140', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['賞花', '庭園'] },
  { id: 'SK-141', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_MODERN', tagIds: ['打卡', '博物館'] },
  { id: 'SK-142', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_NATURE', tagIds: ['賞花', '打卡'] },
  { id: 'SK-143', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '名物'] },
];
