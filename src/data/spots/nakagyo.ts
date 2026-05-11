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

export const NAKAGYO_SCHEMA: SpotSchema[] = [
  { id: 'NK-001', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 二条城前駅", tagIds: ['地鐵'] },
  { id: 'NK-002', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 京都市役所前駅", tagIds: ['地鐵'] },
  { id: 'NK-003', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 烏丸御池駅", tagIds: ['地鐵'] },
  { id: 'NK-004', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "二条城", tagIds: ['寺院', '世界遺產', '經典', '打卡', '國寶'] },
  { id: 'NK-005', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "錦市場", tagIds: ['名物', '老舖', '經典', '打卡'] },
  { id: 'NK-006', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "先斗町", tagIds: ['打卡', '正餐', '老舖'] },
  { id: 'NK-007', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "木屋町通", tagIds: ['打卡', '賞花'] },
  { id: 'NK-008', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "京都文化博物館", tagIds: ['打卡', '博物館'] },
  { id: 'NK-009', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "JR 二条駅", tagIds: ['鐵道'] },
  { id: 'NK-010', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "神泉苑", tagIds: ['寺院', '賞花', '庭園'] },
  { id: 'NK-011', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "壬生寺", tagIds: ['寺院', '打卡'] },
  { id: 'NK-012', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "頂法寺 六角堂", tagIds: ['寺院', '打卡'] },
  { id: 'NK-013', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "本能寺", tagIds: ['寺院', '打卡'] },
  { id: 'NK-014', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "寺町通 商店街", tagIds: ['打卡'] },
  { id: 'NK-015', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "新京極 商店街", tagIds: ['打卡'] },
  { id: 'NK-016', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "三条名店街", tagIds: ['打卡'] },
  { id: 'NK-017', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "高瀬川 一の船入", tagIds: ['自然', '打卡'] },
  { id: 'NK-018', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "二条城 二の丸庭園", tagIds: ['庭園', '世界遺產'] },
  { id: 'NK-019', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "京都国際マンガミュージアム", tagIds: ['ACG', '打卡', '博物館'] },
  { id: 'NK-020', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "八木邸", tagIds: ['打卡', '隱密'] },
  { id: 'NK-021', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "前川邸", tagIds: ['打卡', '隱密'] },
  { id: 'NK-022', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "瑞泉寺", tagIds: ['寺院'] },
  { id: 'NK-023', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "酢屋", tagIds: ['老舖', '打卡'] },
  { id: 'NK-024', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "御金神社", tagIds: ['神社', '打卡'] },
  { id: 'NK-025', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "中京郵便局", tagIds: ['打卡'] },
  { id: 'NK-026', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "三条大橋", tagIds: ['打卡'] },
  { id: 'NK-027', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "鴨川 三条大橋", tagIds: ['打卡', '自然'] },
  { id: 'NK-028', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "先斗町歌舞練場", tagIds: ['打卡'] },
  { id: 'NK-029', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "錦天滿宮", tagIds: ['神社', '打卡'] },
  { id: 'NK-030', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "柳小路 京都", tagIds: ['隱密', '打卡'] },
  { id: 'NK-031', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "麩屋町通", tagIds: ['打卡'] },
  { id: 'NK-032', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "俵屋旅館", tagIds: ['老舖'] },
  { id: 'NK-033', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "柊家旅館", tagIds: ['老舖'] },
  { id: 'NK-034', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "京都 BAL", tagIds: ['打卡'] },
  { id: 'NK-035', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "丸善 京都本店", tagIds: ['打卡'] },
  { id: 'NK-036', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "六角通", tagIds: ['打卡'] },
  { id: 'NK-037', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "矢田寺", tagIds: ['寺院'] },
  { id: 'NK-038', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "誠心院", tagIds: ['寺院', '隱密'] },
  { id: 'NK-039', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "誓願寺", tagIds: ['寺院'] },
  { id: 'NK-040', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "スターバックス 京都烏丸六角店", tagIds: ['喫茶', '打卡'] },
  { id: 'NK-041', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "1928ビル 京都", tagIds: ['打卡'] },
  { id: 'NK-042', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "三条通 近代建築群", tagIds: ['打卡'] },
  { id: 'NK-043', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "蛸薬師通", tagIds: ['打卡'] },
  { id: 'NK-044', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "中京区役所", tagIds: ['隱密'] },
  { id: 'NK-045', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "京福電気鉄道 西院車庫", tagIds: ['打卡'] },
  { id: 'NK-046', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "アニメイト 京都", tagIds: ['ACG', '打卡'] },
  { id: 'NK-047', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "三嶋亭", tagIds: ['正餐', '老舖', '名物', '打卡', '壽喜燒', '涮涮鍋'] },
  { id: 'NK-048', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "モリタ屋 木屋町本店", tagIds: ['正餐', '老舖', '名物', '壽喜燒', '涮涮鍋'] },
  { id: 'NK-049', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "京の焼肉処 弘 三条木屋町店", tagIds: ['正餐', '名物', '打卡', '燒肉'] },
  { id: 'NK-050', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "六曜社珈琲店", tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'NK-051', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "ちいかわ専門店 京都", tagIds: ['ACG', '打卡'] },
  { id: 'NK-052', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "鴨川 納涼床", tagIds: ['打卡', '正餐'] },
  { id: 'NK-053', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "神泉苑 法成橋", tagIds: ['賞花', '打卡'] },
  { id: 'NK-054', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "高瀬川 桜並木", tagIds: ['賞花', '打卡'] },
  { id: 'NK-055', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "二条城 清流園", tagIds: ['庭園', '賞花'] },
  { id: 'NK-056', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "駿河屋 京都寺町店", tagIds: ['ACG', '打卡'] },
  { id: 'NK-057', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "ガチャガチャの森 寺町店", tagIds: ['ACG', '打卡'] },
  { id: 'NK-058', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "喫茶 築地", tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'NK-059', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "INODA COFFEE 本店", tagIds: ['喫茶', '老舖', '名物', '打卡'] },
  { id: 'NK-060', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "前田珈琲 明倫店", tagIds: ['喫茶', '打卡'] },
  { id: 'NK-061', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "本家尾張屋 本店", tagIds: ['正餐', '老舖', '名物', '蕎麥'] },
  { id: 'NK-062', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "京都五行", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'NK-063', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "亀屋良長", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'NK-064', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "キル フェ ボン 京都", tagIds: ['洋菓子', '名物', '打卡'] },
  { id: 'NK-065', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "スマート珈琲店", tagIds: ['喫茶', '老舖', '名物'] },
  { id: 'NK-066', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "天ぷら 吉川", tagIds: ['天婦羅', '懷石', '老舖'] },
  { id: 'NK-067', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "麺屋 猪一", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'NK-068', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "STARDUST 京都", tagIds: ['喫茶', '隱密', '打卡'] },
  { id: 'NK-069', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "焼肉 益市 市役所前店", tagIds: ['正餐', '名物', '燒肉'] },
  { id: 'NK-070', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "こま井亭", tagIds: ['正餐', '老舖', '壽喜燒'] },
  { id: 'NK-071', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "天ぷら 点邑", tagIds: ['天婦羅', '正餐', '隱密'] },
  { id: 'NK-072', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "国産牛焼肉 食べ放題 あぶりや 四条河原町駅前店", tagIds: ['正餐', '燒肉'] },
  { id: 'NK-073', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "本格焼肉 チファジャ 四条河原町店", tagIds: ['正餐', '燒肉'] },
  { id: 'NK-074', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "セカンドストリート 京都三条店", tagIds: ['購物', '打卡'] },
  { id: 'NK-075', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "古着屋JAM 京都三条店", tagIds: ['購物', '打卡'] },
  { id: 'NK-076', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "フレスコ 御池店", tagIds: ['超市'] },
  { id: 'NK-077', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "錦・西川 錦市場", tagIds: ['老舖', '名物'] },
  { id: 'NK-078', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "割烹 たか木", tagIds: ['正餐', '懷石', '隱密'] },
  { id: 'NK-079', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "菊乃井 木屋町店", tagIds: ['正餐', '懷石', '名物'] },
  { id: 'NK-080', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "天ぷら 大安 錦", tagIds: ['天婦羅', '正餐', '名物'] },
  { id: 'NK-081', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "新風館 京都", tagIds: ['現代', '購物', '打卡'] },
  { id: 'NK-082', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "龍旗信 京都店", tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'NK-083', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "La Maison JOUVAUD 京都祇園店", tagIds: ['洋菓子', '打卡'] },
  { id: 'NK-084', wardId: 'W_NAKAGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "河道屋 養老別館", tagIds: ['正餐', '蕎麥', '老舖'] },
  { id: 'NK-085', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "京都 豚しゃぶ 英", tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'NK-086', wardId: 'W_NAKAGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "京都 瓢斗 四条烏丸店", tagIds: ['正餐', '名物', '涮涮鍋'] },
];
