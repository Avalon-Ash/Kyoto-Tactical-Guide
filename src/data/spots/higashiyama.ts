/**
 * @layer SSOT / Schema（結構層）
 * @ward W_HIGASHIYAMA — 東山區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/higashiyama.ts
 *   src/data/locales/ja/higashiyama.ts
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

export const HIGASHIYAMA_SCHEMA: SpotSchema[] = [
  { id: 'HY-001', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'HY-002', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'HY-003', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '經典', '打卡'] },
  { id: 'HY-004', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['神社', '經典', '打卡'] },
  { id: 'HY-005', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡', '國寶'] },
  { id: 'HY-006', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '打卡', '國寶'] },
  { id: 'HY-007', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '經典', '國寶'] },
  { id: 'HY-008', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_SHOP', tagIds: ['經典', '打卡'] },
  { id: 'HY-009', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_SHOP', tagIds: ['經典', '打卡'] },
  { id: 'HY-012', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '打卡'] },
  { id: 'HY-013', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'HY-014', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'HY-015', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'HY-016', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'HY-017', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_MODERN', tagIds: ['打卡', '博物館'] },
  { id: 'HY-018', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'HY-019', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_NATURE', tagIds: ['自然', '打卡'] },
  { id: 'HY-020', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_NATURE', tagIds: ['賞花', '打卡'] },
  { id: 'HY-021', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['打卡', '經典'] },
  { id: 'HY-022', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'HY-023', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'HY-024', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'HY-025', wardId: 'W_HIGASHIYAMA', areaId: 'A05', typeId: 'T_NATURE', tagIds: ['自然', '打卡'] },
  { id: 'HY-026', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'HY-027', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'HY-028', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'HY-029', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'HY-030', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'HY-031', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'HY-032', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_SHOP', tagIds: ['打卡', '賞花'] },
  { id: 'HY-033', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', tagIds: ['打卡', '隱密'] },
  { id: 'HY-034', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', tagIds: ['打卡', '經典'] },
  { id: 'HY-035', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'HY-036', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'HY-037', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['打卡'] },
  { id: 'HY-038', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '楓葉', '庭園'] },
  { id: 'HY-039', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_NATURE', tagIds: ['楓葉', '打卡'] },
  { id: 'HY-040', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['楓葉', '打卡'] },
  { id: 'HY-041', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'HY-042', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'HY-043', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '楓葉'] },
  { id: 'HY-044', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'HY-045', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'HY-046', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', tagIds: ['打卡', '隱密'] },

  { id: 'HY-048', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['打卡', '正餐', '喫茶'] },
  { id: 'HY-049', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'HY-050', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', tagIds: ['ACG', '寺院'] },
  { id: 'HY-051', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', tagIds: ['ACG', '神社'] },
  { id: 'HY-052', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'HY-053', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', tagIds: ['ACG', '寺院'] },
  { id: 'HY-054', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'HY-055', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'HY-056', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['天婦羅', '正餐', '老舖'] },
  { id: 'HY-057', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '老舖'] },
  { id: 'HY-058', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '烏龍'] },
  { id: 'HY-059', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['抹茶', '和菓子', '名物', '打卡'] },
  { id: 'HY-060', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', tagIds: ['抹茶', '和菓子', '老舖'] },
  { id: 'HY-061', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['抹茶', '和菓子', '名物'] },
  { id: 'HY-062', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '經典'] },
  { id: 'HY-064', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '名物', '經典'] },
  { id: 'HY-065', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '隱密', '懷石'] },
  { id: 'HY-066', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '壽司', '老舖', '名物'] },
  { id: 'HY-067', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'HY-068', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'HY-069', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '壽司', '老舖', '名物'] },
  { id: 'HY-071', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶', '和菓子', '打卡'] },
  { id: 'HY-072', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '燒肉'] },
  { id: 'HY-073', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '豆腐'] },


  { id: 'HY-076', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '涮涮鍋'] },
  { id: 'HY-077', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '涮涮鍋'] },
  { id: 'HY-078', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '名物', '打卡'] },
  { id: 'HY-079', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['正餐', '蕎麥', '老舖'] },
  { id: 'HY-081', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['洋菓子', '名物'] },
  { id: 'HY-082', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_FOOD', tagIds: ['喫茶', '名物', '打卡'] },
  { id: 'HY-083', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'HY-084', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'HY-085', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_FOOD', tagIds: ['和菓子', '名物'] },
  { id: 'HY-086', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_FOOD', tagIds: ['正餐', '打卡'] },
  { id: 'HY-087', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'HY-088', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'HY-089', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_SHOP', tagIds: ['超市'] },
  { id: 'YS-030', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡', '展望'] },
];
