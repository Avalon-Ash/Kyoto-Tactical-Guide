/**
 * @layer SSOT / Schema（結構層）
 * @ward W_YAMASHINA — 山科區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/yamashina.ts
 *   src/data/locales/ja/yamashina.ts
 *
 * 【編輯前置檢查】：進行任何餐飲或景點新增/編輯前，強制執行 `grep` 確認是否已有重複資料。
 * 【官方全名約束】：店家與景點名稱必須精確對應 SSOT 官方全名，嚴禁自我拼湊。
 * 【食處查核規則】：與「食」相關（T_FOOD / 餐飲標籤）的新增修改，必須與 tabelog.com 進行事實查核，嚴禁停業舊資料。搜尋時應疊加準確地域或獨佔特徵（如電話、官網）避免誤判。
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

export const YAMASHINA_SCHEMA: SpotSchema[] = [
  { id: 'YS-001', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'YS-002', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'YS-003', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'YS-004', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '打卡', '經典', '國寶', '庭園', '楓葉'] },
  { id: 'YS-005', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '庭園', '打卡', '國寶'] },
  { id: 'YS-006', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '賞花', '打卡', '國寶', '庭園', '歷史'] },
  { id: 'YS-007', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密', '歷史', '賞花', '打卡'] },
  { id: 'YS-009', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', tagIds: ['購物', '歷史'] },
  { id: 'YS-010', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', tagIds: ['購物'] },
  { id: 'YS-011', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['打卡', '歷史'] },
  { id: 'YS-012', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '歷史'] },
  { id: 'YS-013', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['歷史'] },
  { id: 'YS-014', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'YS-015', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'YS-016', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'YS-017', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', tagIds: ['自然'] },
  { id: 'YS-018', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', tagIds: ['自然', '賞花', '打卡'] },
  { id: 'YS-019', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院'] },
  { id: 'YS-020', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'YS-021', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', tagIds: ['自然', '賞花'] },
  { id: 'YS-024', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', tagIds: ['購物', '超市'] },
  { id: 'YS-025', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'YS-026', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', tagIds: ['地鐵'] },
  { id: 'YS-027', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'YS-028', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', tagIds: ['自然', '賞花'] },
  { id: 'YS-029', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', tagIds: ['購物', '打卡'] },
  { id: 'YS-032', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['歷史'] },
  { id: 'YS-033', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'YS-034', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['神社'] },
  { id: 'YS-038', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'YS-039', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', tagIds: ['打卡', '自然'] },
  { id: 'YS-040', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', tagIds: ['打卡'] },
  { id: 'YS-041', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', tagIds: ['自然', '山岳'] },
  { id: 'YS-042', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['賞花', '打卡'] },
  { id: 'YS-043', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['庭園', '打卡'] },
  { id: 'YS-044', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['打卡', '自然'] },
  { id: 'YS-045', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-048', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-049', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-050', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '蕎麥', '名物'] },
  { id: 'YS-051', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', tagIds: ['購物', '打卡'] },
  { id: 'YS-052', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', tagIds: ['購物', '打卡'] },
  { id: 'YS-056', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'YS-057', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'YS-058', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'YS-060', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵'] },
  { id: 'YS-062', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-063', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉'] },
  { id: 'YS-064', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-065', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'YS-066', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'YS-067', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'YS-068', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['懷石', '隱密'] },
  { id: 'YS-071', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'YS-072', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡', '名物'] },
  { id: 'YS-074', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'YS-075', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', tagIds: ['現代', '打卡'] },
  { id: 'YS-076', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'YS-077', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-078', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '打卡'] },
  { id: 'YS-079', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '老舖'] },
  { id: 'YS-080', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '隱密'] },
  { id: 'YS-081', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '老舖'] },
  { id: 'YS-082', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '老舖'] },
  { id: 'YS-083', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-084', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵'] },
  { id: 'YS-085', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'YS-086', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡'] },
  { id: 'YS-087', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', tagIds: ['洋菓子', '打卡'] },
];
