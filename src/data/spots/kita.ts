/**
 * @layer SSOT / Schema（結構層）
 * @ward W_KITA — 北區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/kita.ts
 *   src/data/locales/ja/kita.ts
 *
 * 合法 typeId：
 *   T_HUB=交通要津  T_TEMPLE=寺社名所  T_SHOP=商肆茶寮
 *   T_FOOD=口福食處  T_NATURE=山水風景  T_MODERN=近代設施  T_ACG=ACG聖地
 *
 * 類型禁則：通道散策路→T_SHOP非T_HUB / 橋梁河畔→T_NATURE非T_SHOP / 展望台廣場→T_MODERN非T_NATURE
 *
 * 合法 tagIds（從此集合選用）：
 *   地鐵 巴士 寺院 神社 世界遺產 庭園 山岳 歷史 自然 賞花 楓葉 打卡
 *   正餐 甜點 喫茶 和菓子 抹茶 老舖 必吃 壽司 拉麵 烏龍 天婦羅
 *   壽喜燒 涮涮鍋 懷石 豆腐 洋菓子 蕎麥 ACG 購物 現代 經典 隱密
 *
 * 禁則：T_FOOD 禁用「世界遺產」標籤 / 禁用模糊標籤「美食」
 */
import { SpotSchema } from '../../types';

export const KITA_SCHEMA: SpotSchema[] = [
  { id: 'KT-001', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', mapQuery: "北野白梅町駅", tagIds: ['鐵道'] },
  { id: 'KT-002', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', mapQuery: "金閣寺道 バス停", tagIds: ['巴士'] },
  { id: 'KT-003', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', mapQuery: "金閣寺前 バス停", tagIds: ['巴士'] },
  { id: 'KT-004', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_HUB', mapQuery: "立命館大學前 バス停", tagIds: ['巴士'] },
  { id: 'KT-005', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "金閣寺", tagIds: ['寺院', '世界遺產', '打卡'] },
  { id: 'KT-006', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "大徳寺", tagIds: ['寺院', '庭園'] },
  { id: 'KT-007', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "今宮神社 京都", tagIds: ['神社', '賞花'] },
  { id: 'KT-008', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "平野神社", tagIds: ['神社', '賞花'] },
  { id: 'KT-009', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_MODERN', mapQuery: "立命館大學 京都", tagIds: ['打卡'] },
  { id: 'KT-010', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', mapQuery: "北大路駅", tagIds: ['地鐵'] },
  { id: 'KT-011', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', mapQuery: "北山駅 京都", tagIds: ['地鐵'] },
  { id: 'KT-012', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', mapQuery: "鞍馬口駅", tagIds: ['地鐵'] },
  { id: 'KT-013', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', mapQuery: "北大路バスターミナル", tagIds: ['巴士'] },
  { id: 'KT-014', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_HUB', mapQuery: "上賀茂神社前 バス停", tagIds: ['巴士'] },
  { id: 'KT-015', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "上賀茂神社", tagIds: ['神社', '世界遺產', '打卡'] },
  { id: 'KT-016', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "建勲神社", tagIds: ['神社', '隱密'] },
  { id: 'KT-017', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "光悅寺", tagIds: ['寺院', '楓葉', '隱密'] },
  { id: 'KT-018', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "源光庵", tagIds: ['寺院', '楓葉', '打卡'] },
  { id: 'KT-019', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "常照寺", tagIds: ['寺院', '賞花'] },
  { id: 'KT-020', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', mapQuery: "船岡山公園", tagIds: ['山岳'] },
  { id: 'KT-021', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_SHOP', mapQuery: "北山通 京都", tagIds: ['打卡'] },
  { id: 'KT-022', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_SHOP', mapQuery: "御薗橋801商店街", tagIds: ['打卡'] },
  { id: 'KT-023', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_SHOP', mapQuery: "新大宮商店街", tagIds: ['打卡'] },
  { id: 'KT-024', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "志明院", tagIds: ['寺院', '隱密'] },
  { id: 'KT-025', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "神光院 京都", tagIds: ['寺院'] },
  { id: 'KT-026', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "平野神社 夜櫻", tagIds: ['神社', '賞花', '打卡'] },
  { id: 'KT-027', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_MODERN', mapQuery: "船岡温泉", tagIds: ['打卡', '老舖'] },
  { id: 'KT-028', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_SHOP', mapQuery: "さらさ西陣", tagIds: ['喫茶', '打卡', '老舖'] },
  { id: 'KT-029', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_FOOD', mapQuery: "一文字屋和助", tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'KT-030', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', mapQuery: "京都府立植物園", tagIds: ['賞花', '庭園'] },
  { id: 'KT-031', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_MODERN', mapQuery: "京都府立陶板名畫之庭", tagIds: ['打卡'] },
  { id: 'KT-032', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_MODERN', mapQuery: "堂本印象美術館", tagIds: ['打卡'] },
  { id: 'KT-033', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "等持院", tagIds: ['寺院', '庭園'] },
  { id: 'KT-034', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "正傳寺", tagIds: ['寺院', '庭園'] },
  { id: 'KT-035', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', mapQuery: "深泥池", tagIds: ['自然', '隱密'] },
  { id: 'KT-036', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_MODERN', mapQuery: "上賀茂 社家町", tagIds: ['打卡', '隱密'] },
  { id: 'KT-037', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', mapQuery: "賀茂川 柊野地區", tagIds: ['賞花'] },
  { id: 'KT-038', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', mapQuery: "船山", tagIds: ['山岳'] },
  { id: 'KT-039', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', mapQuery: "加茂みたらし茶屋", tagIds: ['和菓子', '必吃', '老舖'] },
  { id: 'KT-040', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_SHOP', mapQuery: "マールブランシュ 北山本店", tagIds: ['洋菓子', '打卡'] },
  { id: 'KT-041', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "大德寺 高桐院", tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'KT-042', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "大德寺 龍源院", tagIds: ['寺院', '庭園'] },
  { id: 'KT-043', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_NATURE', mapQuery: "賀茂川 半木之道", tagIds: ['賞花', '打卡'] },
  { id: 'KT-044', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_MODERN', mapQuery: "北區役所 京都", tagIds: ['隱密'] },
  { id: 'KT-045', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "鹿苑寺 鏡湖池", tagIds: ['打卡', '世界遺產'] },
  { id: 'KT-046', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', mapQuery: "かざりや", tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'KT-047', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', mapQuery: "中華のサカイ 本店", tagIds: ['正餐', '必吃', '老舖'] },
  { id: 'KT-048', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', mapQuery: "グリルはせがわ", tagIds: ['正餐', '打卡'] },
  { id: 'KT-049', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', mapQuery: "東洋亭 本店", tagIds: ['正餐', '老舖', '必吃'] },
  { id: 'KT-050', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_ACG', mapQuery: "船岡山 公園 柯南", tagIds: ['ACG', '打卡'] },
  { id: 'KT-051', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_ACG', mapQuery: "上賀茂神社 有頂天家族", tagIds: ['ACG', '神社'] },
  { id: 'KT-052', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_MODERN', mapQuery: "佛教大学 紫野キャンパス", tagIds: ['隱密'] },
  { id: 'KT-053', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_ACG', mapQuery: "北野白梅町駅", tagIds: ['ACG', '鐵道'] },
  { id: 'KT-054', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_ACG', mapQuery: "北大路橋 鴨川 輕音部", tagIds: ['ACG', '打卡'] },
  { id: 'KT-055', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_MODERN', mapQuery: "立命館大学 西園寺記念館", tagIds: ['隱密'] },
  { id: 'KT-056', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_ACG', mapQuery: "金閣寺 アニメ", tagIds: ['ACG', '打卡'] },
  { id: 'W_KITA_WIFE_AND_HUSBAND', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', mapQuery: 'WIFE & HUSBAND', tagIds: ['喫茶', '打卡', '自然'] },
  { id: 'W_KITA_CHIKUSEI', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_FOOD', mapQuery: '金閣寺 陸舟の松そば 近清', tagIds: ['正餐', '老舖', '打卡', '蕎麥'] },
  { id: 'W_KITA_NISHIJIN_UOSHIN', wardId: 'W_KITA', areaId: 'A12', typeId: 'T_FOOD', mapQuery: '西陣 魚新', tagIds: ['正餐', '懷石', '隱密'] },
  { id: 'W_KITA_KAMIGAMO_YAKIMOCHI', wardId: 'W_KITA', areaId: 'A14', typeId: 'T_FOOD', mapQuery: '上賀茂 やきもち總本家', tagIds: ['和菓子', '老舖', '必吃'] }
];
