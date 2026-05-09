/**
 * @layer SSOT / Schema（結構層）
 * @ward W_SHIMOGYO — 下京區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
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
  { id: 'SM-002', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', mapQuery: "京都市營地下鐵 四條站", tagIds: ['地鐵'] },
  { id: 'SM-003', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "西本願寺", tagIds: ['寺院', '世界遺產', '經典', '打卡'] },
  { id: 'SM-004', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "東本願寺", tagIds: ['寺院', '經典', '打卡'] },
  { id: 'SM-005', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都塔", tagIds: ['地標', '打卡', '現代'] },
  { id: 'SM-006', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "四條河原町", tagIds: ['經典', '打卡', '購物'] },
  { id: 'SM-007', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_NATURE', mapQuery: "梅小路公園", tagIds: ['賞花', '自然'] },
  { id: 'SM-008', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都鐵道博物館", tagIds: ['打卡', '現代'] },
  { id: 'SM-009', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都水族館", tagIds: ['打卡', '現代'] },
  { id: 'SM-010', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', mapQuery: "京都河原町駅", tagIds: ['鐵道'] },
  { id: 'SM-011', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_HUB', mapQuery: "京都市営地下鉄 五条駅", tagIds: ['地鐵'] },
  { id: 'SM-012', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', mapQuery: "阪急 大宮駅", tagIds: ['鐵道'] },
  { id: 'SM-013', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_HUB', mapQuery: "JR 梅小路京都西駅", tagIds: ['鐵道'] },
  { id: 'SM-014', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_TEMPLE', mapQuery: "佛光寺", tagIds: ['寺院', '打卡'] },
  { id: 'SM-015', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "涉成園", tagIds: ['庭園', '打卡'] },
  { id: 'SM-016', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都 伊勢丹", tagIds: ['打卡', '購物'] },
  { id: 'SM-017', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "大丸京都店", tagIds: ['打卡', '購物'] },
  { id: 'SM-018', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_SHOP', mapQuery: "高島屋 京都店", tagIds: ['打卡', '購物'] },
  { id: 'SM-019', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "龍谷大學 龍谷資料館", tagIds: ['現代', '打卡'] },
  { id: 'SM-020', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "京都市學校歷史博物館", tagIds: ['現代', '打卡'] },
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
  { id: 'SM-038', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都站大樓 空中徑", tagIds: ['打卡'] },
  { id: 'SM-039', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "鴨川 七條大橋", tagIds: ['打卡', '自然'] },
  { id: 'SM-040', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "七條甘春堂", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SM-041', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_SHOP', mapQuery: "京都站地下街 Porta", tagIds: ['購物'] },
  { id: 'SM-042', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都伊勢丹 展望台", tagIds: ['打卡'] },
  { id: 'SM-043', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_MODERN', mapQuery: "京都織物問屋街", tagIds: ['打卡'] },
  { id: 'SM-044', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_TEMPLE', mapQuery: "興正寺", tagIds: ['寺院', '隱密'] },
  { id: 'SM-045', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都站 綜合導覽所", tagIds: ['打卡'] },
  { id: 'SM-046', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "Nintendo KYOTO 任天堂京都", tagIds: ['ACG', '打卡', '現代'] },
  { id: 'SM-047', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "任天堂 舊本社大樓 京都", tagIds: ['ACG', '打卡'] },
  { id: 'SM-048', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_ACG', mapQuery: "寶可夢中心 京都", tagIds: ['ACG', '打卡'] },
  { id: 'SM-051', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "伊藤久右衛門 京都站前店", tagIds: ['抹茶', '和菓子', '老舖', '名物'] },
  { id: 'SM-052', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_FOOD', mapQuery: "末富", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'SM-054', wardId: 'W_SHIMOGYO', areaId: 'A01', typeId: 'T_NATURE', mapQuery: "高瀨川", tagIds: ['打卡', '賞花'] },
  { id: 'SM-055', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "京都站 大階梯", tagIds: ['ACG', '打卡'] },
  { id: 'SM-056', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "京都站 西口廣場 鋼琴", tagIds: ['ACG', '打卡'] },
  { id: 'SM-057', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_ACG', mapQuery: "梅小路公園 HELLO WORLD 聖地", tagIds: ['ACG', '賞花'] },
  { id: 'SM-058', wardId: 'W_SHIMOGYO', areaId: 'A05', typeId: 'T_TEMPLE', mapQuery: "市比賣神社", tagIds: ['神社', '隱密', '打卡'] },
  { id: 'SM-059', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "京都拉麵小路", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'SM-060', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "本家 第一旭 本店", tagIds: ['正餐', '名物', '老舖', '拉麵'] },
  { id: 'SM-070', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: "新福菜館 本店", tagIds: ['正餐', '名物', '老舖', '拉麵'] },
  { id: 'SM-061', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_MODERN', mapQuery: "京都中央郵局", tagIds: ['打卡', '現代'] },
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
  { id: 'SM-074', wardId: 'W_SHIMOGYO', areaId: 'A04', typeId: 'T_FOOD', mapQuery: '山本まんぼ', tagIds: ['正餐', '名物', '老舖'] }
];
