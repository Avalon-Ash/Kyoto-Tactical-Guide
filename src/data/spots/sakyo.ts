/**
 * @layer SSOT / Schema（結構層）
 * @ward W_SAKYO — 左京區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/sakyo.ts
 *   src/data/locales/ja/sakyo.ts
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

export const SAKYO_SCHEMA: SpotSchema[] = [
  { id: 'SK-001', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_HUB', mapQuery: "京阪本線 出町柳駅", tagIds: ['鐵道'] },
  { id: 'SK-002', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_TEMPLE', mapQuery: "下鴨神社", tagIds: ['神社', '世界遺產', '打卡'] },
  { id: 'SK-003', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_NATURE', mapQuery: "鴨川三角洲", tagIds: ['打卡', '自然'] },
  { id: 'SK-004', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "南禪寺", tagIds: ['寺院', '打卡', '庭園'] },
  { id: 'SK-005', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "永觀堂 禪林寺", tagIds: ['寺院', '楓葉', '打卡'] },
  { id: 'SK-006', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "銀閣寺", tagIds: ['寺院', '世界遺產', '庭園'] },
  { id: 'SK-007', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_NATURE', mapQuery: "哲學之道", tagIds: ['賞花', '打卡'] },
  { id: 'SK-008', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "平安神宮", tagIds: ['神社', '賞花', '打卡'] },
  { id: 'SK-009', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_NATURE', mapQuery: "岡崎公園 京都", tagIds: ['賞花'] },
  { id: 'SK-010', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_MODERN', mapQuery: "京都大學 本部校區", tagIds: ['打卡'] },
  { id: 'SK-011', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_TEMPLE', mapQuery: "貴船神社", tagIds: ['神社', '打卡', '隱密'] },
  { id: 'SK-012', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_TEMPLE', mapQuery: "鞍馬寺", tagIds: ['寺院', '山岳'] },
  { id: 'SK-013', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', mapQuery: "三千院", tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'SK-014', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', mapQuery: "瑠璃光院", tagIds: ['寺院', '楓葉', '打卡'] },
  { id: 'SK-015', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_HUB', mapQuery: "叡山電車 出町柳駅", tagIds: ['鐵道'] },
  { id: 'SK-016', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_HUB', mapQuery: "地下鉄 蹴上駅", tagIds: ['地鐵'] },
  { id: 'SK-018', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_TEMPLE', mapQuery: "河合神社", tagIds: ['神社', '打卡'] },
  { id: 'SK-019', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "真如堂", tagIds: ['寺院', '楓葉', '隱密'] },
  { id: 'SK-020', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "金戒光明寺", tagIds: ['寺院', '隱密'] },
  { id: 'SK-021', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "法然院", tagIds: ['寺院', '隱密'] },
  { id: 'SK-022', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "水路閣", tagIds: ['打卡'] },
  { id: 'SK-023', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_NATURE', mapQuery: "蹴上傾斜鐵道", tagIds: ['打卡', '賞花'] },
  { id: 'SK-024', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_SHOP', mapQuery: "百萬遍知恩寺 手作市集", tagIds: ['打卡'] },
  { id: 'SK-025', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', mapQuery: "寂光院", tagIds: ['寺院', '隱密'] },
  { id: 'SK-026', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', mapQuery: "寶泉院", tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'SK-027', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', mapQuery: "實光院", tagIds: ['寺院', '庭園'] },
  { id: 'SK-028', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', mapQuery: "詩仙堂", tagIds: ['寺院', '庭園'] },
  { id: 'SK-029', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', mapQuery: "曼殊院", tagIds: ['寺院', '庭園'] },
  { id: 'SK-030', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', mapQuery: "圓光寺", tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'SK-031', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_TEMPLE', mapQuery: "修學院離宮", tagIds: ['庭園', '世界遺產'] },
  { id: 'SK-032', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_SHOP', mapQuery: "出町枡形商店街", tagIds: ['打卡', 'ACG'] },
  { id: 'SK-033', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_SHOP', mapQuery: "一乘寺 惠文社", tagIds: ['打卡'] },
  { id: 'SK-034', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', mapQuery: "一乘寺 激戰區 麵屋極雞", tagIds: ['正餐', '名物', '打卡', '拉麵'] },
  { id: 'SK-035', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', mapQuery: "茶寮 寶泉", tagIds: ['和菓子', '老舖', '名物', '抹茶'] },
  { id: 'SK-036', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_NATURE', mapQuery: "白川一乘寺 櫻花", tagIds: ['賞花'] },
  { id: 'SK-037', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_NATURE', mapQuery: "貴船川遊步道", tagIds: ['賞花', '自然'] },
  { id: 'SK-038', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_SHOP', mapQuery: "比叡山頂 展望台", tagIds: ['打卡'] },
  { id: 'SK-039', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_TEMPLE', mapQuery: "比叡山 延曆寺", tagIds: ['寺院', '世界遺產', '山岳'] },
  { id: 'SK-040', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_HUB', mapQuery: "叡山ケーブル 八瀬駅", tagIds: ['鐵道'] },
  { id: 'SK-041', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_HUB', mapQuery: "比叡山內巴士 延曆寺巴士站", tagIds: ['巴士'] },
  { id: 'SK-042', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "蓮華寺", tagIds: ['寺院', '隱密'] },
  { id: 'SK-043', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "崇道神社", tagIds: ['神社', '隱密'] },
  { id: 'SK-044', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "三宅八幡宮", tagIds: ['神社'] },
  { id: 'SK-045', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_TEMPLE', mapQuery: "妙滿寺", tagIds: ['寺院'] },
  { id: 'SK-046', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_TEMPLE', mapQuery: "圓通寺", tagIds: ['寺院', '庭園'] },
  { id: 'SK-047', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', mapQuery: "京都市動物園", tagIds: ['打卡'] },
  { id: 'SK-048', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "無鄰菴", tagIds: ['庭園', '打卡'] },
  { id: 'SK-049', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_SHOP', mapQuery: "泉屋博古館", tagIds: ['隱密'] },
  { id: 'SK-050', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_MODERN', mapQuery: "駒井家住宅", tagIds: ['打卡', '隱密'] },
  { id: 'SK-051', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', mapQuery: "進進堂 京大前店", tagIds: ['喫茶', '老舖', '洋菓子', '名物'] },
  { id: 'SK-052', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', mapQuery: "滿月 阿闍梨餅 本店", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SK-053', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_SHOP', mapQuery: "洛北阪急 Square", tagIds: ['打卡'] },
  { id: 'SK-054', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_NATURE', mapQuery: "寶池公園", tagIds: ['自然'] },
  { id: 'SK-055', wardId: 'W_SAKYO', areaId: 'A14', typeId: 'T_MODERN', mapQuery: "國立京都國際會館", tagIds: ['打卡'] },
  { id: 'SK-056', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', mapQuery: "瓢亭 本店", tagIds: ['正餐', '老舖', '名物', '懷石'] },
  { id: 'SK-057', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', mapQuery: "聖護院八ッ橋總本店", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SK-058', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', mapQuery: "京都市京セラ美術館", tagIds: ['打卡', '現代'] },
  { id: 'SK-059', wardId: 'W_SAKYO', areaId: 'A16', typeId: 'T_ACG', mapQuery: "叡山電車 きらら", tagIds: ['ACG', '鐵道'] },
  { id: 'SK-060', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_ACG', mapQuery: "下鴨神社 糺之森 有頂天家族", tagIds: ['ACG', '神社'] },
  { id: 'SK-061', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_ACG', mapQuery: "鴨川三角洲 けいおん", tagIds: ['ACG', '自然'] },
  { id: 'SK-062', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_ACG', mapQuery: "鞍馬寺 有頂天家族", tagIds: ['ACG', '寺院'] },
  { id: 'SK-063', wardId: 'W_SAKYO', areaId: 'A17', typeId: 'T_ACG', mapQuery: "貴船神社 境界の彼方", tagIds: ['ACG', '神社'] },
  { id: 'SK-064', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', mapQuery: "藤井有鄰館", tagIds: ['隱密'] },
  { id: 'SK-065', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_MODERN', mapQuery: "京都傳統産業ミュージアム", tagIds: ['打卡'] },
  { id: 'SK-066', wardId: 'W_SAKYO', areaId: 'A02', typeId: 'T_FOOD', mapQuery: "出町ふたば", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SK-067', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: "グリル小宝", tagIds: ['正餐', '名物', '打卡'] },
  { id: 'W_SAKYO_OKAKITA', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: '岡北 京都', tagIds: ['正餐', '名物', '老舖', '烏龍'] },
  { id: 'W_SAKYO_MOAN', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: '茂庵', tagIds: ['抹茶', '喫茶', '隱密', '打卡'] },
  { id: 'W_SAKYO_YAMAMOTO_MENZOU', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: '山元麺蔵', tagIds: ['正餐', '名物', '烏龍'] },
  { id: 'W_SAKYO_HINODE_UDON', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: '日の出うどん', tagIds: ['正餐', '名物', '烏龍'] },
  { id: 'W_SAKYO_OMEN', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: 'おめん 銀閣寺本店', tagIds: ['正餐', '名物', '烏龍', '老舖'] },
  { id: 'W_SAKYO_ICHIRIJO_NAKATANI', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', mapQuery: '一乗寺 中谷', tagIds: ['和菓子', '抹茶', '打卡', '名物'] },
  { id: 'W_SAKYO_RAKUCHU_RAKUGAI', wardId: 'W_SAKYO', areaId: 'A15', typeId: 'T_FOOD', mapQuery: '修学院離宮前 洛中洛外', tagIds: ['正餐', '隱密', '蕎麥'] },
  { id: 'SK-068', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: '南禪寺 順正', tagIds: ['正餐', '老舖', '豆腐'] },
  { id: 'SK-069', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: '奧丹 南禪寺店', tagIds: ['正餐', '老舖', '豆腐'] },
  { id: 'SK-070', wardId: 'W_SAKYO', areaId: 'A05', typeId: 'T_FOOD', mapQuery: '天婦羅 圓堂 岡崎店', tagIds: ['天婦羅', '正餐', '名物'] },
];
