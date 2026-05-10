/**
 * @layer SSOT / Schema（結構層）
 * @ward W_SHIMOGYO — 下京區
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
 *   src/data/locales/zh/shimogyo.ts
 *   src/data/locales/ja/shimogyo.ts
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

export const SHIMOGYO_SCHEMA: SpotSchema[] = [
  { id: 'SM-001', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', mapQuery: "JR 京都駅", tagIds: ['鐵道'] },
  { id: 'SM-002', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 四条駅", tagIds: ['地鐵'] },
  { id: 'SM-003', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "西本願寺", tagIds: ['寺院', '世界遺產', '經典', '打卡'] },
  { id: 'SM-004', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東本願寺", tagIds: ['寺院', '經典', '打卡', '國寶'] },
  { id: 'SM-005', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都塔", tagIds: ['地標', '打卡', '現代'] },
  { id: 'SM-006', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "四条河原町", tagIds: ['經典', '打卡', '購物'] },
  { id: 'SM-007', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "梅小路公園", tagIds: ['賞花', '自然'] },
  { id: 'SM-008', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都鐵道博物館", tagIds: ['打卡', '現代', '博物館'] },
  { id: 'SM-009', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都水族館", tagIds: ['打卡', '現代', '博物館'] },
  { id: 'SM-010', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', mapQuery: "京都河原町駅", tagIds: ['鐵道'] },
  { id: 'SM-011', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 五条駅", tagIds: ['地鐵'] },
  { id: 'SM-012', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', mapQuery: "阪急 大宮駅", tagIds: ['鐵道'] },
  { id: 'SM-013', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', mapQuery: "JR 梅小路京都西駅", tagIds: ['鐵道'] },
  { id: 'SM-014', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "佛光寺", tagIds: ['寺院', '打卡'] },
  { id: 'SM-015', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "渉成園", tagIds: ['庭園', '打卡'] },
  { id: 'SM-016', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都 伊勢丹", tagIds: ['打卡', '購物'] },
  { id: 'SM-017', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "大丸京都店", tagIds: ['打卡', '購物'] },
  { id: 'SM-018', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "高島屋 京都店", tagIds: ['打卡', '購物'] },
  { id: 'SM-019', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "龍谷大学 龍谷ミュージアム", tagIds: ['現代', '打卡', '博物館'] },
  { id: 'SM-020', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "京都市學校歷史博物館", tagIds: ['現代', '打卡', '博物館'] },
  { id: 'SM-021', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "文子天滿宮", tagIds: ['神社', '隱密'] },
  { id: 'SM-022', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "神明神社", tagIds: ['神社', '隱密'] },
  { id: 'SM-023', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都中央卸売市場", tagIds: ['正餐', '名物', '老舖'] },
  { id: 'SM-024', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "島原 大門", tagIds: ['打卡', '歷史'] },
  { id: 'SM-025', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "角屋 幕末維新資料館", tagIds: ['打卡', '歷史'] },
  { id: 'SM-026', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "輪違屋", tagIds: ['打卡', '歷史'] },
  { id: 'SM-027', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "杉本家住宅", tagIds: ['打卡', '隱密'] },
  { id: 'SM-028', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "綾小路通", tagIds: ['打卡'] },
  { id: 'SM-029', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "和久傳", tagIds: ['正餐', '名物', '老舖', '懷石'] },
  { id: 'SM-030', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都友都八喜", tagIds: ['購物'] },
  { id: 'SM-032', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "富小路通", tagIds: ['打卡'] },
  { id: 'SM-033', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "高辻通", tagIds: ['打卡'] },
  { id: 'SM-034', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "佛光寺通", tagIds: ['打卡'] },
  { id: 'SM-035', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "松原通", tagIds: ['打卡'] },
  { id: 'SM-036', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "西洞院通", tagIds: ['打卡'] },
  { id: 'SM-037', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "堀川通", tagIds: ['打卡'] },
  { id: 'SM-038', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都駅ビル 空中径路", tagIds: ['打卡'] },
  { id: 'SM-039', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "鴨川 七条大橋", tagIds: ['打卡', '自然'] },
  { id: 'SM-040', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "七条甘春堂", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SM-041', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都站地下街 Porta", tagIds: ['購物'] },
  { id: 'SM-042', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都伊勢丹 展望台", tagIds: ['打卡'] },
  { id: 'SM-043', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "京都織物問屋街", tagIds: ['打卡'] },
  { id: 'SM-044', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "興正寺", tagIds: ['寺院', '隱密'] },
  { id: 'SM-045', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都駅 総合案内所", tagIds: ['打卡'] },
  { id: 'SM-046', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "Nintendo KYOTO 任天堂京都", tagIds: ['ACG', '打卡', '現代'] },
  { id: 'SM-047', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "任天堂 旧本社社屋 京都", tagIds: ['ACG', '打卡'] },
  { id: 'SM-048', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "ポケモンセンターキョウト", tagIds: ['ACG', '打卡'] },
  { id: 'SM-051', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "伊藤久右衛門 京都站前店", tagIds: ['抹茶', '和菓子', '老舖', '名物'] },
  { id: 'SM-052', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "末富", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SM-054', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "高瀬川", tagIds: ['打卡', '賞花'] },
  { id: 'SM-055', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "京都駅 大階段", tagIds: ['ACG', '打卡'] },
  { id: 'SM-056', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "京都駅 西口広場 ピアノ", tagIds: ['ACG', '打卡'] },
  { id: 'SM-057', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "梅小路公園 HELLO WORLD 聖地", tagIds: ['ACG', '賞花'] },
  { id: 'SM-058', wardId: 'W_SHIMOGYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "市比賣神社", tagIds: ['神社', '隱密', '打卡'] },
  { id: 'SM-059', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "京都拉麺小路", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'SM-060', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "本家 第一旭 本店", tagIds: ['正餐', '名物', '老舖', '拉麵'] },
  { id: 'SM-070', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "新福菜館 本店", tagIds: ['正餐', '名物', '老舖', '拉麵'] },
  { id: 'SM-061', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都中央郵便局", tagIds: ['打卡', '現代'] },
  { id: 'SM-062', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "大丸京都店 屋頂庭園", tagIds: ['自然'] },
  { id: 'W_SHIMOGYO_ISETAN_SHOYUKAN', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '伊勢丹 京都店 B1F 食遊館', tagIds: ['和菓子', '老舖', '打卡'] },
  { id: 'W_SHIMOGYO_YOSHINOYA', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '吉廼家', tagIds: ['和菓子', '老舖', '隱密'] },
  { id: 'W_SHIMOGYO_SARASA_KAYUKOJI', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: 'Sarasa 花遊小路', tagIds: ['喫茶', '打卡', '隱密'] },
  { id: 'SHIMOGYO_TEMPURA_YOKOTA', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '天ぷら よこ田 京都駅', tagIds: ['天婦羅', '正餐', '打卡'] },
  { id: 'SHIMOGYO_KYOTO_STATION_BLDG', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: '京都駅ビル 大空広場', tagIds: ['現代', '打卡', '購物'] },
  { id: 'SM-063', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '中村藤吉 京都駅店', tagIds: ['抹茶', '和菓子', '名物', '打卡'] },
  { id: 'SM-064', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: 'マールブランシュ JR京都伊勢丹店', tagIds: ['洋菓子', '名物', '打卡'] },
  { id: 'SM-066', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '開化堂カフェ', tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'SM-067', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: 'Walden Woods Kyoto', tagIds: ['喫茶', '打卡'] },
  { id: 'SM-068', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '阿闍梨餅本舗 満月 JR京都伊勢丹店', tagIds: ['和菓子', '名物', '老舖'] },
  { id: 'SM-071', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '寿しのむさし 京都駅八条口店', tagIds: ['正餐', '名物', '壽司'] },
  { id: 'SM-072', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '瓢斗 京都駅前本店', tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'SM-073', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: 'とんかつ一番', tagIds: ['正餐', '名物'] },
  { id: 'SM-074', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '山本まんぼ', tagIds: ['正餐', '名物', '老舖'] },
  { id: 'SM-075', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "焼肉 弘 京都駅前店", tagIds: ['正餐', '名物', '燒肉'] },
  { id: 'SM-076', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "蓮 (Hasu) しゃぶしゃぶ", tagIds: ['正餐', '涮涮鍋'] },
  { id: 'SM-077', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "すき焼き 木村", tagIds: ['正餐', '老舖', '壽喜燒'] },
  { id: 'SM-078', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "寿司 乙羽 四条店", tagIds: ['正餐', '老舖', '壽司'] },
  { id: 'SM-079', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: 'モリタ屋 JR京都伊勢丹店', tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'SM-080', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: 'すき焼き・しゃぶしゃぶ 桂', tagIds: ['正餐', '涮涮鍋'] },
  { id: 'SM-081', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '焼肉やる気 京都駅前店', tagIds: ['正餐', '燒肉'] },
  { id: 'SM-082', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '本格焼肉 チファジャ 京都駅前店', tagIds: ['正餐', '燒肉'] },
  { id: 'SM-FOOD-001', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: 'パティスリー・エス', tagIds: ['甜點', '洋菓子', '打卡'] },
  { id: 'SM-FOOD-002', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '拳ラーメン', tagIds: ['正餐', '拉麵', '打卡'] },
  { id: 'SM-FOOD-003', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: '手打ち蕎麦 実延', tagIds: ['正餐', '蕎麥'] },
  { id: 'SM-083', wardId: 'W_SHIMOGYO', areaId: 'A07', typeId: 'T_SHOP', mapQuery: 'ブックオフプラス 四条河原町店', tagIds: ['購物', '打卡'] },
  { id: 'SM-084', wardId: 'W_SHIMOGYO', areaId: 'A11', typeId: 'T_SHOP', mapQuery: 'ライフ 下京図書館前店', tagIds: ['超市'] },
  { id: 'SM-085', wardId: 'W_SHIMOGYO', areaId: 'A05', typeId: 'T_SHOP', mapQuery: 'フレスコ 七条店', tagIds: ['超市'] },
  { id: 'SM-086', wardId: 'W_SHIMOGYO', areaId: 'A05', typeId: 'T_SHOP', mapQuery: 'フレスコ 河原町七条店', tagIds: ['超市'] },
  { id: 'SM-087', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: 'パントリー JR京都伊勢丹店', tagIds: ['超市'] },
  { id: 'SM-088', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: '成城石井 京都駅店', tagIds: ['超市'] },
];
