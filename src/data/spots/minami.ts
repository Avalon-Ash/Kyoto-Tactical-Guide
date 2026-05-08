/**
 * @layer SSOT / Schema（結構層）
 * @ward W_MINAMI — 南區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/minami.ts
 *   src/data/locales/ja/minami.ts
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

export const MINAMI_SCHEMA: SpotSchema[] = [
  { id: 'MN-001', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺", tagIds: ['寺院', '世界遺產', '經典', '打卡'] },
  { id: 'MN-002', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "伏見稻荷大社 御旅所", tagIds: ['神社', '打卡'] },
  { id: 'MN-003', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "永旺夢樂城 京都", tagIds: ['購物', '打卡'] },
  { id: 'MN-004', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "十條站 京都", tagIds: ['地鐵'] },
  { id: 'MN-005', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "西大路站", tagIds: ['地鐵'] },
  { id: 'MN-006', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "羅生門址", tagIds: ['打卡', '歷史'] },
  { id: 'MN-010', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "任天堂 本社", tagIds: ['ACG', '打卡'] },
  { id: 'MN-008', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "六孫王神社", tagIds: ['神社', '隱密'] },
  { id: 'MN-009', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "吉祥院天滿宮", tagIds: ['神社', '賞花'] },
  { id: 'MN-010_alt', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "實相寺", tagIds: ['寺院'] },
  { id: 'MN-011', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "桂川 久世橋", tagIds: ['自然'] },
  { id: 'MN-012', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "九條通 京都", tagIds: ['打卡'] },
  { id: 'MN-013', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "弘法市 東寺", tagIds: ['老舖', '打卡'] },
  { id: 'MN-014', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺 觀智院", tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'MN-015', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺 唐門", tagIds: ['寺院', '打卡'] },
  { id: 'MN-016', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺 寶藏", tagIds: ['寺院', '打卡'] },
  { id: 'MN-017', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "上鳥羽神社", tagIds: ['神社'] },
  { id: 'MN-018', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "塔之森 公園", tagIds: ['自然'] },
  { id: 'MN-019', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "瓦町公園", tagIds: ['自然'] },
  { id: 'MN-020', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "お好み焼き 吉野", tagIds: ['正餐', '必吃'] },
  { id: 'MN-021', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都市西大路體育館", tagIds: ['打卡'] },
  { id: 'MN-022', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺西門", tagIds: ['寺院', '打卡'] },
  { id: 'MN-023', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "八條大宮 巴士站", tagIds: ['巴士'] },
  { id: 'MN-024', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "羅生門 公園", tagIds: ['自然'] },
  { id: 'MN-025', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "戒光寺 南區", tagIds: ['寺院'] },
  { id: 'MN-026', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "嚴島神社 南區", tagIds: ['神社'] },
  { id: 'MN-027', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "Coffee Base KANON", tagIds: ['喫茶', '必吃'] },
  { id: 'MN-028', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "惠美酒 神社", tagIds: ['神社'] },
  { id: 'MN-029', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "西大路九條 巴士站", tagIds: ['巴士'] },
  { id: 'MN-030', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "十條大宮 巴士站", tagIds: ['巴士'] },
  { id: 'MN-031', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "南十條 公園", tagIds: ['自然'] },
  { id: 'MN-032', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "鴨川 勧進橋", tagIds: ['自然'] },
  { id: 'MN-033', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "桂川 祥久橋", tagIds: ['自然'] },
  { id: 'MN-034', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "上鳥羽口站", tagIds: ['地鐵'] },
  { id: 'MN-035', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "竹田站", tagIds: ['地鐵'] },
  { id: 'MN-036', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京瓷 本社", tagIds: ['打卡'] },
  { id: 'MN-037', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "日本郵便 京都南郵便局", tagIds: ['打卡'] },
  { id: 'MN-038', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "燒肉 弘 上鳥羽店", tagIds: ['正餐', '必吃', '燒肉'] },
  { id: 'MN-039', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "瓦町 纖維街", tagIds: ['購物'] },
  { id: 'MN-040', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "油小路通", tagIds: ['打卡'] },
  { id: 'MN-041', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都南交流道", tagIds: ['打卡'] },
  { id: 'MN-042', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "山王神社 京都", tagIds: ['神社'] },
  { id: 'MN-043', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "觀進寺", tagIds: ['寺院'] },
  { id: 'MN-044', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "綾戶國中神社", tagIds: ['神社'] },
  { id: 'MN-045', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "藏王堂光福寺", tagIds: ['寺院'] },
  { id: 'MN-046', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "扭蛋百貨 永旺夢樂城KYOTO店", tagIds: ['ACG', '打卡'] },
  { id: 'MN-047', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都Avanti", tagIds: ['ACG', '購物'] },
  { id: 'MN-048', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "唐吉訶德 京都站八條口店", tagIds: ['購物', '打卡'] },
  { id: 'MN-049', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "丸福樓 (任天堂舊本社)", tagIds: ['ACG', '打卡'] },
  { id: 'MN-050_acg', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "任天堂開發中心", tagIds: ['ACG', '打卡'] },
  { id: 'MN-051', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "九條跨線橋", tagIds: ['ACG', '打卡'] },
  { id: 'MN-052', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "十條通 任天堂", tagIds: ['ACG', '打卡'] },
  { id: 'MN-053', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "東寺餅", tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'MN-054', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "Mister Donut 京都站八條口", tagIds: ['洋菓子'] },
  { id: 'MN-055', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "熟成細麵 香來 上鳥羽店", tagIds: ['正餐', '必吃', '拉麵'] },
  { id: 'MN-056', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "鳥羽水環境保全中心 藤", tagIds: ['自然', '賞花'] },
  { id: 'MN-057', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都Terrsa", tagIds: ['打卡'] },
  { id: 'MN-058', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "近鐵十條站", tagIds: ['地鐵'] },
  { id: 'MN-059', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "中村藤吉 京都站店", tagIds: ['抹茶', '和菓子', '必吃'] },
  { id: 'W_MINAMI_TORIYASA', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '京都 鳥彌三 南區', tagIds: ['正餐', '老舖', '必吃'] },
  { id: 'W_MINAMI_KISSHOKARYO', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '吉祥菓寮 東寺店', tagIds: ['和菓子', '抹茶', '打卡', '必吃'] }
];
