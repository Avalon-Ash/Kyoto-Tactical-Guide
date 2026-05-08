/**
 * @layer SSOT / Schema（結構層）
 * @ward W_YAMASHINA — 山科區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
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
 * 合法 tagIds（從此集合選用）：
 *   地鐵 巴士 寺院 神社 世界遺產 庭園 山岳 歷史 自然 賞花 楓葉 打卡
 *   正餐 甜點 喫茶 和菓子 抹茶 老舖 必吃 壽司 拉麵 烏龍 天婦羅
 *   壽喜燒 涮涮鍋 懷石 豆腐 洋菓子 蕎麥 ACG 購物 現代 經典 隱密
 *
 * 禁則：T_FOOD 禁用「世界遺產」標籤 / 禁用模糊標籤「美食」
 */
import { SpotSchema } from '../../types';

export const YAMASHINA_SCHEMA: SpotSchema[] = [
  { id: 'YS-001', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "山科站", tagIds: ['地鐵'] },
  { id: 'YS-002', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "御陵站", tagIds: ['地鐵'] },
  { id: 'YS-003', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "小野站 京都", tagIds: ['地鐵'] },
  { id: 'YS-004', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "毘沙門堂", tagIds: ['寺院', '打卡', '經典'] },
  { id: 'YS-005', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "勸修寺", tagIds: ['寺院', '庭園', '打卡'] },
  { id: 'YS-006', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "隨心院", tagIds: ['寺院', '賞花', '打卡'] },
  { id: 'YS-007', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "京都 大石神社", tagIds: ['神社', '隱密'] },
  { id: 'YS-011', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科疏水", tagIds: ['自然', '賞花', '打卡'] },
  { id: 'YS-009', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "清水燒之鄉", tagIds: ['購物', '文化'] },
  { id: 'YS-010', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "Racto山科", tagIds: ['購物'] },
  { id: 'YS-011_alt', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "天智天皇 山科陵", tagIds: ['打卡', '歷史'] },
  { id: 'YS-012', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "本圀寺", tagIds: ['寺院'] },
  { id: 'YS-013', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "山科本願寺跡", tagIds: ['歷史'] },
  { id: 'YS-014', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "元慶寺", tagIds: ['寺院'] },
  { id: 'YS-015', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "岩屋寺", tagIds: ['寺院', '隱密'] },
  { id: 'YS-016', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "諸羽神社", tagIds: ['神社'] },
  { id: 'YS-017', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科大塚 公園", tagIds: ['自然'] },
  { id: 'YS-018', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科疏水 櫻花隧道", tagIds: ['自然', '賞花', '打卡'] },
  { id: 'YS-019', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "安祥寺", tagIds: ['寺院'] },
  { id: 'YS-020', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "德林庵", tagIds: ['寺院', '隱密'] },
  { id: 'YS-021', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "琵琶湖疏水 山科段", tagIds: ['自然', '賞花'] },
  { id: 'YS-022', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "山科消防署", tagIds: ['打卡'] },
  { id: 'YS-023', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "山科 區役所", tagIds: ['打卡'] },
  { id: 'YS-024', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "西友 山科店", tagIds: ['購物'] },
  { id: 'YS-025', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "椥辻站", tagIds: ['地鐵'] },
  { id: 'YS-026', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "東野站", tagIds: ['地鐵'] },
  { id: 'YS-027', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "四宮站", tagIds: ['地鐵'] },
  { id: 'YS-028', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科疏水 散步路", tagIds: ['自然', '賞花'] },
  { id: 'YS-029', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "清水燒之鄉 工坊", tagIds: ['購物', '打卡'] },
  { id: 'YS-030', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "山科地藏 德林庵", tagIds: ['寺院', '隱密'] },
  { id: 'YS-031', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "山科 正法寺", tagIds: ['寺院'] },
  { id: 'YS-032', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "大宅廢寺遺址", tagIds: ['歷史'] },
  { id: 'YS-033', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "岩屋神社", tagIds: ['神社'] },
  { id: 'YS-034', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "花山稻荷神社", tagIds: ['神社'] },
  { id: 'YS-035', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "山科本願寺 土壘", tagIds: ['歷史'] },
  { id: 'YS-036', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "醍醐道", tagIds: ['打卡'] },
  { id: 'YS-037', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "外環狀線", tagIds: ['打卡'] },
  { id: 'YS-038', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_HUB', mapQuery: "三條通 山科", tagIds: ['打卡'] },
  { id: 'YS-039', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "山科 盆地展望處", tagIds: ['打卡', '自然'] },
  { id: 'YS-040', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "山科 綠地中心", tagIds: ['打卡'] },
  { id: 'YS-041', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "牛尾山", tagIds: ['自然', '山岳'] },
  { id: 'YS-042', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "隨心院 小野梅園", tagIds: ['賞花', '打卡'] },
  { id: 'YS-043', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "勸修寺 冰室池", tagIds: ['庭園', '打卡'] },
  { id: 'YS-044', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "毘沙門堂 敷紅葉", tagIds: ['打卡', '自然'] },
  { id: 'YS-045', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "山科 熟食街", tagIds: ['正餐', '必吃'] },
  { id: 'YS-046', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "Malebranche 浪漫之森", tagIds: ['洋菓子', '打卡', '必吃'] },
  { id: 'YS-047', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "蕎麥處 胡蝶庵 山科", tagIds: ['正餐', '必吃', '蕎麥'] },
  { id: 'YS-048', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "麵屋 裕 山科", tagIds: ['正餐', '必吃', '拉麵'] },
  { id: 'YS-049', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "菓子司 瑞穗 山科", tagIds: ['和菓子'] },
  { id: 'YS-050', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: "中國料理 再來 山科", tagIds: ['正餐'] },
  { id: 'YS-051', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "無印良品 京都山科", tagIds: ['購物', '打卡'] },
  { id: 'YS-052', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_SHOP', mapQuery: "陶あん 清水燒團地店", tagIds: ['購物', '打卡'] },
  { id: 'YS-053', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "京都橘大學", tagIds: ['打卡'] },
  { id: 'YS-054', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "京都藥科大學", tagIds: ['打卡'] },
  { id: 'YS-055', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_MODERN', mapQuery: "京都市山科圖書館", tagIds: ['打卡'] },
  { id: 'YS-056', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', mapQuery: "GiGO 山科", tagIds: ['ACG', '打卡'] },
  { id: 'YS-057', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', mapQuery: "Joshin 山科店", tagIds: ['ACG', '打卡'] },
  { id: 'YS-058', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_ACG', mapQuery: "TSUTAYA 山科站前店", tagIds: ['ACG', '打卡'] },
  { id: 'W_YAMASHINA_RYUGETSUDO', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: '山科 柳月堂', tagIds: ['喫茶', '老舖', '隱密'] },
  { id: 'W_YAMASHINA_BISHAMON_MONZEN', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: '毘沙門堂 門前甘味處 やましな', tagIds: ['和菓子', '打卡', '抹茶'] },
  { id: 'W_YAMASHINA_FURUKAWAYA', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: '追分 三条 古川屋', tagIds: ['正餐', '老舖', '隱密'] },
  { id: 'W_YAMASHINA_SHIBAZUKE_CHAYA', wardId: 'W_YAMASHINA', areaId: 'A08', typeId: 'T_FOOD', mapQuery: '山科 醍醐 志ば漬本舗 茶屋', tagIds: ['和菓子', '老舖', '打卡'] }
];
