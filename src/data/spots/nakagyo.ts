/**
 * @layer SSOT / Schema（結構層）
 * @ward W_NAKAGYO — 中京區
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
 *   src/data/locales/zh/nakagyo.ts
 *   src/data/locales/ja/nakagyo.ts
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

export const NAKAGYO_SCHEMA: SpotSchema[] = [
  { id: 'NC-001', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 二条城前駅", tagIds: ['地鐵'] },
  { id: 'NC-002', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 京都市役所前駅", tagIds: ['地鐵'] },
  { id: 'NC-003', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 烏丸御池駅", tagIds: ['地鐵'] },
  { id: 'NC-004', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "二条城", tagIds: ['寺院', '世界遺產', '經典', '打卡', '國寶'] },
  { id: 'NC-005', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "錦市場", tagIds: ['名物', '老舖', '經典', '打卡'] },
  { id: 'NC-006', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "先斗町", tagIds: ['打卡', '正餐', '老舖'] },
  { id: 'NC-007', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "木屋町通", tagIds: ['打卡', '賞花'] },
  { id: 'NC-008', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "京都文化博物館", tagIds: ['打卡', '博物館'] },
  { id: 'NC-009', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "JR 二条駅", tagIds: ['鐵道'] },
  { id: 'NC-010', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "神泉苑", tagIds: ['寺院', '賞花', '庭園'] },
  { id: 'NC-011', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "壬生寺", tagIds: ['寺院', '打卡'] },
  { id: 'NC-012', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "頂法寺 六角堂", tagIds: ['寺院', '打卡'] },
  { id: 'NC-013', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "本能寺", tagIds: ['寺院', '打卡'] },
  { id: 'NC-014', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "寺町通 商店街", tagIds: ['打卡'] },
  { id: 'NC-015', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "新京極 商店街", tagIds: ['打卡'] },
  { id: 'NC-016', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "三条名店街", tagIds: ['打卡'] },
  { id: 'NC-017', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "高瀬川 一の船入", tagIds: ['自然', '打卡'] },
  { id: 'NC-018', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "二条城 二の丸庭園", tagIds: ['庭園', '世界遺產'] },
  { id: 'NC-019', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "京都国際マンガミュージアム", tagIds: ['ACG', '打卡', '博物館'] },
  { id: 'NC-020', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "八木邸", tagIds: ['打卡', '隱密'] },
  { id: 'NC-021', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "前川邸", tagIds: ['打卡', '隱密'] },
  { id: 'NC-022', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "瑞泉寺", tagIds: ['寺院'] },
  { id: 'NC-023', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "酢屋", tagIds: ['老舖', '打卡'] },
  { id: 'NC-024', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "御金神社", tagIds: ['神社', '打卡'] },
  { id: 'NC-025', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "中京郵便局", tagIds: ['打卡'] },
  { id: 'NC-026', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "三条大橋", tagIds: ['打卡'] },
  { id: 'NC-027', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "鴨川 三条大橋", tagIds: ['打卡', '自然'] },
  { id: 'NC-028', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "先斗町歌舞練場", tagIds: ['打卡'] },
  { id: 'NC-029', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "錦天満宮", tagIds: ['神社', '打卡'] },
  { id: 'NC-030', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "柳小路 京都", tagIds: ['隱密', '打卡'] },
  { id: 'NC-031', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "麩屋町通", tagIds: ['打卡'] },
  { id: 'NC-032', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "俵屋旅館", tagIds: ['老舖'] },
  { id: 'NC-033', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "柊家旅館", tagIds: ['老舖'] },
  { id: 'NC-034', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "京都 BAL", tagIds: ['打卡'] },
  { id: 'NC-035', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "丸善 京都本店", tagIds: ['打卡'] },
  { id: 'NC-036', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "六角通", tagIds: ['打卡'] },
  { id: 'NC-037', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "矢田寺", tagIds: ['寺院'] },
  { id: 'NC-038', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "誠心院", tagIds: ['寺院', '隱密'] },
  { id: 'NC-039', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "誓願寺", tagIds: ['寺院'] },
  { id: 'NC-040', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "スターバックス 京都烏丸六角店", tagIds: ['喫茶', '打卡'] },
  { id: 'NC-041', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "1928ビル 京都", tagIds: ['打卡'] },
  { id: 'NC-042', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "三条通 近代建築群", tagIds: ['打卡'] },
  { id: 'NC-043', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "蛸薬師通", tagIds: ['打卡'] },
  { id: 'NC-044', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "中京区役所", tagIds: ['隱密'] },
  { id: 'NC-045', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "京福電気鉄道 西院車庫", tagIds: ['打卡'] },
  { id: 'NC-046', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "アニメイト 京都", tagIds: ['ACG', '打卡'] },
  { id: 'NC-047', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "三嶋亭", tagIds: ['正餐', '老舖', '名物', '打卡', '壽喜燒', '涮涮鍋'] },
  { id: 'NC-048', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "モリタ屋 木屋町本店", tagIds: ['正餐', '老舖', '名物', '壽喜燒', '涮涮鍋'] },
  { id: 'NC-049', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "京の焼肉処 弘 三条木屋町店", tagIds: ['正餐', '名物', '打卡', '燒肉'] },
  { id: 'NC-050', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "六曜社珈琲店", tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'NC-052', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: 'ちいかわ専門店 京都', tagIds: ['ACG', '打卡'] },
  { id: 'NC-053', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "鴨川 納涼床", tagIds: ['打卡', '正餐'] },
  { id: 'NC-054', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "神泉苑 法成橋", tagIds: ['賞花', '打卡'] },
  { id: 'NC-055', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "高瀬川 桜並木", tagIds: ['賞花', '打卡'] },
  { id: 'NC-056', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "二条城 清流園", tagIds: ['庭園', '賞花'] },
  { id: 'NC-057', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "駿河屋 京都寺町店", tagIds: ['ACG', '打卡'] },
  { id: 'NC-058', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "ガチャガチャの森 寺町店", tagIds: ['ACG', '打卡'] },
  { id: 'NC-059', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "喫茶 築地", tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'NC-060', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "INODA COFFEE 本店", tagIds: ['喫茶', '老舖', '名物', '打卡'] },
  { id: 'NC-061', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "前田珈琲 明倫店", tagIds: ['喫茶', '打卡'] },
  { id: 'NC-062', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "本家尾張屋 本店", tagIds: ['正餐', '老舖', '名物', '蕎麥'] },
  { id: 'NC-063', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "京都五行", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'NC-064', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "亀屋良長", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'NC-065', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "キル フェ ボン 京都", tagIds: ['洋菓子', '名物', '打卡'] },
  { id: 'NC-066', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "スマート珈琲店", tagIds: ['喫茶', '老舖', '名物'] },
  { id: 'NC-067', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "天ぷら 吉川", tagIds: ['天婦羅', '懷石', '老舖'] },
  { id: 'NC-068', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "麺屋 猪一", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'NC-069', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "STARDUST 京都", tagIds: ['喫茶', '隱密', '打卡'] },
  { id: 'NC-071', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "焼肉 益市 市役所前店", tagIds: ['正餐', '名物', '燒肉'] },
  { id: 'NC-072', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "こま井亭", tagIds: ['正餐', '老舖', '壽喜燒'] },
  { id: 'NC-073', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "天ぷら 点邑", tagIds: ['天婦羅', '正餐', '隱密'] },
  { id: 'W_NAKAGYO_NISHIKI_NISHIKAWA', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: '錦・西川 錦市場', tagIds: ['老舖', '名物'] },
  { id: 'W_NAKAGYO_TAKAGI', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '割烹 たか木', tagIds: ['正餐', '懷石', '隱密'] },
  { id: 'W_NAKAGYO_KIKUNOI_KIYAMACHI', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '菊乃井 木屋町店', tagIds: ['正餐', '懷石', '名物'] },
  { id: 'NAKAGYO_TEMPURA_TAIAN', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '天ぷら 大安 錦', tagIds: ['天婦羅', '正餐', '名物'] },
  { id: 'NAKAGYO_SHINPUHKAN', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: '新風館 京都', tagIds: ['現代', '購物', '打卡'] },
  { id: 'NK-FOOD-001', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: '龍旗信 京都店', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'NK-FOOD-002', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: 'La Maison JOUVAUD 京都祇園店', tagIds: ['甜點', '洋菓子', '打卡'] },
  { id: 'NK-FOOD-003', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: '河道屋 養老別館', tagIds: ['正餐', '蕎麥', '老舖'] },
  { id: 'NK-FOOD-004', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '京都 豚しゃぶ 英', tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'NK-FOOD-005', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '京都 瓢斗 四条烏丸店', tagIds: ['正餐', '名物', '涮涮鍋'] },
];
