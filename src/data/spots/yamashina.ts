/**
 * @layer SSOT / Schema（結構層）
 * @ward W_YAMASHINA — 山科區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 *
 * ⚠ mapQuery 強制規則（SSOT：日文/日文漢字為唯一標準）：
 *   - mapQuery 只能填「日文原名」或「日文漢字」，嚴禁填入繁體中文
 *   - 交通站點：使用日文正式名稱，含「駅」字（例：「二条城前駅」非「二條城前站」）
 *   - 地下鐵：使用「京都市営地下鉄」（非「京都市營地下鐵」）
 *   - 寺社：使用日文官方漢字（例：「法観寺」「霊山歴史館」非繁體字形）
 *   - ACG 聖地：景點名用日文，IP 名稱用日文原名（例：「名探偵コナン」非「柯南」）
 *   - 通路/散策路：使用日文通名（例：「ねねの道」非「寧寧之道」）
 *   - 欄位值應為 Google Maps 日文搜尋時能直接辨識的官方名稱
 *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/yamashina.ts
 *   src/data/locales/ja/yamashina.ts
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

export const YAMASHINA_SCHEMA: SpotSchema[] = [
  { id: 'YS-001', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "JR 山科駅", tagIds: ['鐵道'] },
  { id: 'YS-002', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "御陵駅", tagIds: ['地鐵'] },
  { id: 'YS-003', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "小野駅（京都府）", tagIds: ['地鐵'] },
  { id: 'YS-004', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "毘沙門堂", tagIds: ['寺院', '打卡', '經典', '國寶', '庭園'] },
  { id: 'YS-005', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "勧修寺", tagIds: ['寺院', '庭園', '打卡', '國寶'] },
  { id: 'YS-006', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "随心院", tagIds: ['寺院', '賞花', '打卡', '國寶', '庭園'] },
  { id: 'YS-007', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "京都 大石神社", tagIds: ['神社', '隱密'] },
  { id: 'YS-008', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科疎水", tagIds: ['自然', '賞花', '打卡'] },
  { id: 'YS-009', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "清水焼の郷", tagIds: ['購物', '歷史'] },
  { id: 'YS-010', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "Racto山科", tagIds: ['購物'] },
  { id: 'YS-011', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "天智天皇 山科陵", tagIds: ['打卡', '歷史'] },
  { id: 'YS-012', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "本圀寺", tagIds: ['寺院'] },
  { id: 'YS-013', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "山科本願寺跡", tagIds: ['歷史'] },
  { id: 'YS-014', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "元慶寺", tagIds: ['寺院'] },
  { id: 'YS-015', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "岩屋寺", tagIds: ['寺院', '隱密'] },
  { id: 'YS-016', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "諸羽神社", tagIds: ['神社'] },
  { id: 'YS-017', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科大塚 公園", tagIds: ['自然'] },
  { id: 'YS-018', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科疎水 桜花隧道", tagIds: ['自然', '賞花', '打卡'] },
  { id: 'YS-019', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "安祥寺", tagIds: ['寺院'] },
  { id: 'YS-020', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "徳林庵", tagIds: ['寺院', '隱密'] },
  { id: 'YS-021', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "琵琶湖疎水 山科段", tagIds: ['自然', '賞花'] },
  { id: 'YS-022', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "山科消防署", tagIds: ['打卡'] },
  { id: 'YS-023', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "山科区役所", tagIds: ['打卡'] },
  { id: 'YS-024', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "西友 山科店", tagIds: ['購物'] },
  { id: 'YS-025', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "椥辻駅", tagIds: ['地鐵'] },
  { id: 'YS-026', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "東野駅（京都府）", tagIds: ['地鐵'] },
  { id: 'YS-027', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "四宮駅", tagIds: ['鐵道'] },
  { id: 'YS-028', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科疎水 遊歩道", tagIds: ['自然', '賞花'] },
  { id: 'YS-029', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "清水焼の郷 ギャラリー", tagIds: ['購物', '打卡'] },
  { id: 'YS-030', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "将軍塚青龍殿", tagIds: ['寺院', '打卡', '展望'] },
  { id: 'YS-031', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "山科 正法寺", tagIds: ['寺院'] },
  { id: 'YS-032', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "大宅廢寺遺址", tagIds: ['歷史'] },
  { id: 'YS-033', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "岩屋神社", tagIds: ['神社'] },
  { id: 'YS-034', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "花山稻荷神社", tagIds: ['神社'] },
  { id: 'YS-035', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "山科本願寺 土塁", tagIds: ['歷史'] },
  { id: 'YS-036', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "醍醐道", tagIds: ['打卡'] },
  { id: 'YS-037', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "外環状線", tagIds: ['打卡'] },
  { id: 'YS-038', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "三条通 山科", tagIds: ['打卡'] },
  { id: 'YS-039', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科 盆地展望所", tagIds: ['打卡', '自然'] },
  { id: 'YS-040', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "山科 綠地中心", tagIds: ['打卡'] },
  { id: 'YS-041', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "牛尾山", tagIds: ['自然', '山岳'] },
  { id: 'YS-042', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "随心院 小野梅園", tagIds: ['賞花', '打卡'] },
  { id: 'YS-043', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "勧修寺 氷室池", tagIds: ['庭園', '打卡'] },
  { id: 'YS-044', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "毘沙門堂 敷紅葉", tagIds: ['打卡', '自然'] },
  { id: 'YS-045', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "山科 三条商店街", tagIds: ['正餐', '名物'] },
  { id: 'YS-046', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "マールブランシュ ロマンの森", tagIds: ['洋菓子', '打卡', '名物'] },
  { id: 'YS-047', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "そば処 胡蝶庵", tagIds: ['正餐', '名物', '蕎麥'] },
  { id: 'YS-048', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "麺屋 裕", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'YS-049', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "菓子司 瑞穗", tagIds: ['和菓子'] },
  { id: 'YS-050', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "中国料理 再来", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'YS-051', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "無印良品 京都山科", tagIds: ['購物', '打卡'] },
  { id: 'YS-052', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "陶あん 清水焼団地店", tagIds: ['購物', '打卡'] },
  { id: 'YS-053', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "京都橘大学", tagIds: ['打卡'] },
  { id: 'YS-054', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "京都薬科大学", tagIds: ['打卡'] },
  { id: 'YS-055', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "京都市山科図書館", tagIds: ['打卡'] },
  { id: 'YS-056', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', mapQuery: "GiGO 山科", tagIds: ['ACG', '打卡'] },
  { id: 'YS-057', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', mapQuery: "Joshin 山科店", tagIds: ['ACG', '打卡'] },
  { id: 'YS-058', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', mapQuery: "TSUTAYA 山科駅前店", tagIds: ['ACG', '打卡'] },
  { id: 'YS-059', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "山科 柳月堂", tagIds: ['喫茶', '老舖', '隱密'] },
  { id: 'YS-060', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "毘沙門堂 門前甘味処 やましな", tagIds: ['和菓子', '打卡', '抹茶'] },
  { id: 'YS-061', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "追分 三条 古川屋", tagIds: ['正餐', '老舖', '隱密'] },
  { id: 'YS-062', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "山科 醍醐 志ば漬本舗 茶屋", tagIds: ['和菓子', '老舖', '打卡'] },
  { id: 'YS-063', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "ライオンカレー 山科店", tagIds: ['正餐', '名物'] },
  { id: 'YS-064', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "ふらいぱん 山科", tagIds: ['正餐', '名物'] },
  { id: 'YS-065', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "担担麺 胡", tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'YS-066', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "パティスリー ニュアージュ", tagIds: ['洋菓子', '打卡'] },
  { id: 'YS-067', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "すき焼き 牛禅 山科", tagIds: ['正餐', '壽喜燒'] },
];
