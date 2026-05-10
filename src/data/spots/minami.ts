/**
 * @layer SSOT / Schema（結構層）
 * @ward W_MINAMI — 南區
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
  { id: 'MN-001', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺", tagIds: ['寺院', '世界遺產', '經典', '打卡', '國寶', '庭園'] },
  { id: 'MN-002', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "伏見稲荷大社 御旅所", tagIds: ['神社', '打卡'] },
  { id: 'MN-003', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "イオンモールKYOTO", tagIds: ['購物', '打卡'] },
  { id: 'MN-004', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "十条駅 京都", tagIds: ['地鐵'] },
  { id: 'MN-005', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "JR 西大路駅", tagIds: ['鐵道'] },
  { id: 'MN-006', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "羅生門址", tagIds: ['打卡', '歷史'] },
  { id: 'MN-010', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "任天堂 本社", tagIds: ['ACG', '打卡'] },
  { id: 'MN-008', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "六孫王神社", tagIds: ['神社', '隱密'] },
  { id: 'MN-009', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "吉祥院天満宮", tagIds: ['神社', '賞花'] },
  { id: 'MN-010_alt', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "実相寺", tagIds: ['寺院'] },
  { id: 'MN-011', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "桂川 久世橋", tagIds: ['自然'] },
  { id: 'MN-012', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "九条通 京都", tagIds: ['打卡'] },
  { id: 'MN-013', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "弘法市 東寺", tagIds: ['老舖', '打卡'] },
  { id: 'MN-014', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺 観智院", tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'MN-015', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺 唐門", tagIds: ['寺院', '打卡'] },
  { id: 'MN-016', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺 宝蔵", tagIds: ['寺院', '打卡'] },
  { id: 'MN-017', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "上鳥羽神社", tagIds: ['神社'] },
  { id: 'MN-018', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "塔之森 公園", tagIds: ['自然'] },
  { id: 'MN-019', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "瓦町公園", tagIds: ['自然'] },
  { id: 'MN-020', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "お好み焼き 吉野", tagIds: ['正餐', '名物'] },
  { id: 'MN-021', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都市西大路体育館", tagIds: ['打卡'] },
  { id: 'MN-022', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東寺西門", tagIds: ['寺院', '打卡'] },
  { id: 'MN-023', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "八条大宮 バス停", tagIds: ['巴士'] },
  { id: 'MN-024', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "羅生門 公園", tagIds: ['自然'] },
  { id: 'MN-025', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "戒光寺 南區", tagIds: ['寺院'] },
  { id: 'MN-026', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "厳島神社 南区", tagIds: ['神社'] },
  { id: 'MN-027', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "おもに 本店", tagIds: ['正餐', '燒肉', '名物'] },
  { id: 'MN-028', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "惠美酒 神社", tagIds: ['神社'] },
  { id: 'MN-029', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "西大路九条 バス停", tagIds: ['巴士'] },
  { id: 'MN-030', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "十条大宮 バス停", tagIds: ['巴士'] },
  { id: 'MN-031', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "南十条 公園", tagIds: ['自然'] },
  { id: 'MN-032', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "鴨川 勧進橋", tagIds: ['自然'] },
  { id: 'MN-033', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "桂川 祥久橋", tagIds: ['自然'] },
  { id: 'MN-034', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "近鉄 上鳥羽口駅", tagIds: ['鐵道'] },
  { id: 'MN-035', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "地下鉄 竹田駅", tagIds: ['地鐵'] },
  { id: 'MN-036', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京セラ 本社", tagIds: ['打卡'] },
  { id: 'MN-037', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "日本郵便 京都南郵便局", tagIds: ['打卡'] },
  { id: 'MN-038', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "焼肉 弘 上鳥羽店", tagIds: ['正餐', '燒肉', '名物'] },
  { id: 'MN-039', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "瓦町 繊維街", tagIds: ['購物'] },
  { id: 'MN-040', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "油小路通", tagIds: ['打卡'] },
  { id: 'MN-041', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都南交流道", tagIds: ['打卡'] },
  { id: 'MN-042', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "山王神社 京都", tagIds: ['神社'] },
  { id: 'MN-043', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "観進寺", tagIds: ['寺院'] },
  { id: 'MN-044', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "綾戶国中神社", tagIds: ['神社'] },
  { id: 'MN-045', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "蔵王堂光福寺", tagIds: ['寺院'] },
  { id: 'MN-046', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "ガシャポンバンダイオフィシャルショップ イオンモールKYOTO店", tagIds: ['ACG', '打卡'] },
  { id: 'MN-047', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都Avanti", tagIds: ['ACG', '購物'] },
  { id: 'MN-048', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "ドン・キホーテ 京都駅八条口店", tagIds: ['購物', '打卡'] },
  { id: 'MN-049', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "丸福樓", tagIds: ['ACG', '打卡'] },
  { id: 'MN-050_acg', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "任天堂開発センター", tagIds: ['ACG', '打卡'] },
  { id: 'MN-051', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "九条跨線橋", tagIds: ['ACG', '打卡'] },
  { id: 'MN-052', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_ACG', mapQuery: "十条通 任天堂", tagIds: ['ACG', '打卡'] },
  { id: 'MN-053', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "東寺餅", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'MN-054', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "寿しのむさし 京都駅八条口店", tagIds: ['正餐', '壽司', '老舖'] },
  { id: 'MN-055', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "熟成細麺 香来 上鳥羽店", tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'MN-056', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "鳥羽水環境保全中心 藤", tagIds: ['自然', '賞花'] },
  { id: 'MN-057', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都Terrsa", tagIds: ['打卡'] },
  { id: 'MN-058', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_HUB', mapQuery: "近鉄 十条駅", tagIds: ['鐵道'] },
  { id: 'MN-059', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "ミスターギョーザ", tagIds: ['正餐', '名物'] },
  { id: 'W_MINAMI_TEUCHI_SOBA_MARU', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '手打ち蕎麦 まる', tagIds: ['正餐', '名物', '蕎麥'] },
  { id: 'W_MINAMI_KYOTO_RAMEN_LAB', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '京都ラーメン研究所', tagIds: ['正餐', '拉麵', '打卡'] },
  { id: 'W_MINAMI_TORIYASA', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '殿田', tagIds: ['正餐', '老舖', '名物', '烏龍'] },
  { id: 'W_MINAMI_KISSHOKARYO', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '吉祥菓寮 東寺店', tagIds: ['和菓子', '抹茶', '打卡', '名物'] },
  { id: 'MN-FOOD-001', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: 'ラーメン 霽レ空', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'MN-FOOD-002', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: 'パティスリー オ・グルニエ・ドール', tagIds: ['甜點', '洋菓子', '打卡'] },
  { id: 'MN-FOOD-003', wardId: 'W_MINAMI', areaId: 'A04', typeId: 'T_FOOD', mapQuery: 'すき焼き 弘', tagIds: ['正餐', '壽喜燒', '燒肉'] },
  { id: 'MN-060', wardId: 'W_MINAMI', areaId: 'A06', typeId: 'T_SHOP', mapQuery: '東寺 弘法市', tagIds: ['購物', '名物', '打卡', '老舖'] },
  { id: 'MN-061', wardId: 'W_MINAMI', areaId: 'A06', typeId: 'T_SHOP', mapQuery: 'イオンモールKYOTO', tagIds: ['購物', '現代'] },
];
