/**
 * @layer SSOT / Schema（結構層）
 * @ward W_FUSHIMI — 伏見區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 * *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/fushimi.ts
 *   src/data/locales/ja/fushimi.ts
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

export const FUSHIMI_SCHEMA: SpotSchema[] = [
  { id: 'FS-001', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'FS-002', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'FS-003', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'FS-004', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'FS-005', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', tagIds: ['鐵道'] },
  { id: 'FS-006', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡', '經典'] },
  { id: 'FS-007', wardId: 'W_FUSHIMI', areaId: 'A08', typeId: 'T_TEMPLE', tagIds: ['寺院', '世界遺產', '賞花', '國寶', '庭園'] },
  { id: 'FS-008', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '庭園', '賞花'] },
  { id: 'FS-009', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'FS-010', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'FS-011', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['老舖', '隱密'] },
  { id: 'FS-012', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['老舖', '打卡'] },
  { id: 'FS-013', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', tagIds: ['打卡', '賞花'] },
  { id: 'FS-014', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', tagIds: ['老舖', '打卡', '現代', '博物館'] },
  { id: 'FS-015', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['打卡', '正餐', '現代', '博物館'] },
  { id: 'FS-016', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡'] },
  { id: 'FS-017', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'FS-018', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['打卡', '正餐'] },
  { id: 'FS-019', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', tagIds: ['打卡', '現代'] },
  { id: 'FS-020', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', tagIds: ['打卡', '賞花'] },
  { id: 'FS-021', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['打卡', '喫茶'] },
  { id: 'FS-022', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'FS-023', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['打卡', '山岳'] },
  { id: 'FS-024', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '隱密'] },
  { id: 'FS-025', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '老舖'] },
  { id: 'FS-026', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'FS-027', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'FS-028', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['寺院', '賞花', '隱密'] },
  { id: 'FS-029', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '賞花'] },
  { id: 'FS-030', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['打卡'] },
  { id: 'FS-031', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'FS-032', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', tagIds: ['隱密', '博物館'] },
  { id: 'FS-033', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['寺院', '隱密'] },
  { id: 'FS-035', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', tagIds: ['神社', '打卡', '隱密'] },
  { id: 'FS-036', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'FS-037', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', tagIds: ['賞花'] },
  { id: 'FS-038', wardId: 'W_FUSHIMI', areaId: 'A08', typeId: 'T_NATURE', tagIds: ['山岳', '世界遺產'] },
  { id: 'FS-039', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', tagIds: ['賞花', '自然', '打卡'] },
  { id: 'FS-040', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', tagIds: ['ACG', '隱密'] },
  { id: 'FS-041', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'FS-042', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', tagIds: ['ACG', '打卡'] },
  { id: 'FS-043', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', tagIds: ['ACG', '神社'] },
  { id: 'FS-044', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '名物'], reservationRequired: true },
  { id: 'FS-045', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['喫茶', '正餐'] },
  { id: 'FS-046', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '名物'] },
  { id: 'FS-047', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'FS-048', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '壽司'] },
  { id: 'FS-049', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', tagIds: ['打卡', '現代'] },
  { id: 'FS-050', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['和菓子', '名物'] },
  { id: 'FS-051', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '老舖', '經典'] },
  { id: 'FS-052', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '懷石', '老舖'], reservationRequired: true },
  { id: 'FS-053', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '拉麵'] },
  { id: 'FS-055', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['喫茶', '打卡'] },
  { id: 'FS-056', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'FS-057', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'FS-059', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '天婦羅'] },
  { id: 'FS-061', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '喫茶'] },
  { id: 'FS-062', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐'] },
  { id: 'FS-064', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
  { id: 'FS-065', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', tagIds: ['正餐', '燒肉', '放題'] },
];
