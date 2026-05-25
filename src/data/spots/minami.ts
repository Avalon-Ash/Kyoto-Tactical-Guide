/**
 * @layer SSOT / Schema（結構層）
 * @ward W_MINAMI — 南區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/minami.ts
 *   src/data/locales/ja/minami.ts
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

export const MINAMI_SCHEMA: SpotSchema[] = [
  { id: 'MN-001', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '經典', '打卡', '國寶', '庭園'] },
  { id: 'MN-002', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'MN-004', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'MN-005', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'MN-006', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['打卡', '歷史'] },
  { id: 'MN-007', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['ACG', '打卡'] },
  { id: 'MN-008', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密', '歷史', '賞花', '打卡'] },
  { id: 'MN-009', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花'] },
  { id: 'MN-010', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'MN-011', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'MN-012', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'MN-014', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'MN-015', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡'] },
  { id: 'MN-016', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡'] },
  { id: 'MN-017', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'MN-018', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'MN-019', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'MN-022', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡'] },
  { id: 'MN-023', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'MN-024', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'MN-025', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'MN-026', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'MN-028', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'MN-029', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'MN-030', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['巴士'] },
  { id: 'MN-031', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'MN-032', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'MN-033', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'MN-034', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'MN-035', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'MN-036', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'MN-039', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['購物'] },
  { id: 'MN-042', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'MN-043', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'MN-044', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'MN-045', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'MN-046', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'MN-047', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['ACG', '購物'] },
  { id: 'MN-048', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['購物', '打卡'] },
  { id: 'MN-050', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'MN-051', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡', '展望'] },
  { id: 'MN-053', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'MN-054', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'MN-056', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', tagIds: ['自然', '賞花'] },
  { id: 'MN-057', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'MN-058', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'MN-059', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'MN-061', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'MN-062', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵'] },
  { id: 'MN-063', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'MN-066', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'MN-067', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['購物', '名物', '打卡', '老舖'] },
  { id: 'MN-068', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', tagIds: ['購物', '現代'] },
  { id: 'MN-072', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', tagIds: ['寺院', '歷史', '隱密'] },
  { id: 'MN-073', wardId: 'W_MINAMI', areaId: 'A10', typeId: 'T_NATURE', tagIds: ['自然', '賞花'] },
  { id: 'MN-074', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'MN-075', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'MN-076', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', tagIds: ['地標', '現代'] }
];
