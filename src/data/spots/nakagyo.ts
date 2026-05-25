/**
 * @layer SSOT / Schema（結構層）
 * @ward W_NAKAGYO — 中京區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/nakagyo.ts
 *   src/data/locales/ja/nakagyo.ts
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

export const NAKAGYO_SCHEMA: SpotSchema[] = [
  { id: 'NK-001', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'NK-002', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'NK-003', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'NK-004', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '經典', '打卡', '國寶'] },
  { id: 'NK-005', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['名物', '老舖', '經典', '打卡'] },
  { id: 'NK-006', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['打卡', '正餐', '老舖'] },
  { id: 'NK-007', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡', '賞花'] },
  { id: 'NK-008', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['打卡', '博物館'] },
  { id: 'NK-009', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'NK-010', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '賞花', '庭園'] },
  { id: 'NK-011', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡'] },
  { id: 'NK-012', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡'] },
  { id: 'NK-013', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡'] },
  { id: 'NK-014', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'NK-015', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'NK-016', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'NK-017', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', tagIds: ['自然', '打卡'] },
  { id: 'NK-018', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['庭園', '世界遺產'] },
  { id: 'NK-019', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_ACG', tagIds: ['ACG', '打卡', '博物館'] },
  { id: 'NK-020', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['打卡', '隱密'] },
  { id: 'NK-021', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', tagIds: ['打卡', '隱密'] },
  { id: 'NK-022', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'NK-023', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['老舖', '打卡'] },
  { id: 'NK-024', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'NK-025', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_MODERN', tagIds: ['打卡', '歷史'] },
  { id: 'NK-026', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', tagIds: ['打卡', '歷史'] },
  { id: 'NK-027', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', tagIds: ['打卡', '自然'] },
  { id: 'NK-028', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_MODERN', tagIds: ['打卡', '歷史'] },
  { id: 'NK-029', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'NK-030', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['隱密', '打卡'] },
  { id: 'NK-032', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['老舖'] },
  { id: 'NK-033', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['老舖'] },
  { id: 'NK-034', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'NK-035', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'NK-037', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'NK-038', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'NK-039', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'NK-040', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-041', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'NK-042', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'NK-046', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'NK-047', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '名物', '打卡', '壽喜燒', '涮涮鍋'] },
  { id: 'NK-048', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '名物', '壽喜燒', '涮涮鍋'] },
  { id: 'NK-049', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '打卡', '燒肉'] },
  { id: 'NK-050', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'NK-051', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'NK-052', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', tagIds: ['打卡', '正餐'] },
  { id: 'NK-053', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', tagIds: ['賞花', '打卡'] },
  { id: 'NK-054', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', tagIds: ['賞花', '打卡'] },
  { id: 'NK-055', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', tagIds: ['庭園', '賞花'] },
  { id: 'NK-056', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'NK-057', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'NK-058', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'NK-059', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '名物', '打卡'] },
  { id: 'NK-060', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-061', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'NK-062', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'NK-063', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'NK-064', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['洋菓子', '名物', '打卡'] },
  { id: 'NK-065', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '名物'] },
  { id: 'NK-066', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['天婦羅', '懷石', '老舖'] },
  { id: 'NK-067', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'NK-068', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密', '打卡'] },
  { id: 'NK-069', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉'] },
  { id: 'NK-070', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '壽喜燒'] },
  { id: 'NK-071', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['天婦羅', '正餐', '隱密'] },
  { id: 'NK-072', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'NK-073', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'NK-074', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['購物', '打卡'] },
  { id: 'NK-075', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['購物', '打卡'] },
  { id: 'NK-076', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'NK-077', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '喫茶'] },
  { id: 'NK-078', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡'] },
  { id: 'NK-079', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '懷石', '名物'] },
  { id: 'NK-080', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖'] },
  { id: 'NK-081', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', tagIds: ['現代', '購物', '打卡'] },
  { id: 'NK-082', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'NK-083', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'NK-084', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐', '蕎麥', '老舖'] },
  { id: 'NK-085', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'NK-086', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'NK-089', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '名物', '打卡'] },
  { id: 'NK-090', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密', '打卡'] },
  { id: 'NK-091', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '現代', '打卡'] },
  { id: 'NK-092', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-093', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '現代', '打卡'] },
  { id: 'NK-094', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-095', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '現代', '打卡'] },
  { id: 'NK-096', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-097', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'NK-098', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '打卡'] },
  { id: 'NK-099', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-100', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '現代', '打卡'] },
  { id: 'NK-101', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '現代', '打卡'] },
  { id: 'NK-102', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-103', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡'] },
  { id: 'NK-104', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密', '打卡'] },
  { id: 'NK-105', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '現代'] },
  { id: 'NK-106', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-107', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '現代', '名物', '打卡'] },
  { id: 'NK-108', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密', '名物'] },
  { id: 'NK-109', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-110', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-111', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-112', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-113', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'NK-115', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'NK-116', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'NK-117', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡', '名物'] },
  { id: 'NK-118', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '現代'] },
  { id: 'NK-119', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['購物', '現代'] },
  { id: 'NK-120', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['洋菓子', '老舖', '名物'] },
  { id: 'NK-121', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['抹茶', '喫茶', '打卡'] },
  { id: 'NK-122', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '隱密'] },
  { id: 'NK-123', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', tagIds: ['購物', '老舖'] },
  { id: 'NK-124', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'NK-125', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'NK-126', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['抹茶', '老舖', '隱密', '喫茶'] },
  { id: 'NK-127', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['喫茶', '老舖', '隱密', '和菓子'] },
  { id: 'NK-128', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐'] },
  { id: 'NK-129', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'NK-130', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐'] },
  { id: 'NK-131', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', tagIds: ['正餐'] },
  { id: 'NK-132', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', tagIds: ['抹茶', '喫茶', '現代'] },
];
