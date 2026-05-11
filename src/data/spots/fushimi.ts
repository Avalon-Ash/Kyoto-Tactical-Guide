/**
 * @layer SSOT / Schema（結構層）
 * @ward W_FUSHIMI — 伏見區
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
 *   src/data/locales/zh/fushimi.ts
 *   src/data/locales/ja/fushimi.ts
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

export const FUSHIMI_SCHEMA: SpotSchema[] = [
  { id: 'FS-001', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', mapQuery: "稲荷駅", tagIds: ['鐵道'] },
  { id: 'FS-002', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', mapQuery: "伏見稲荷駅", tagIds: ['鐵道'] },
  { id: 'FS-003', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', mapQuery: "中書島駅", tagIds: ['鐵道'] },
  { id: 'FS-004', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', mapQuery: "伏見桃山駅", tagIds: ['鐵道'] },
  { id: 'FS-005', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_HUB', mapQuery: "丹波橋駅", tagIds: ['鐵道'] },
  { id: 'FS-006', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "伏見稲荷大社", tagIds: ['神社', '打卡', '經典'] },
  { id: 'FS-007', wardId: 'W_FUSHIMI', areaId: 'A08', typeId: 'T_TEMPLE', mapQuery: "醍醐寺", tagIds: ['寺院', '世界遺產', '賞花', '國寶', '庭園'] },
  { id: 'FS-008', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "城南宮", tagIds: ['神社', '庭園', '賞花'] },
  { id: 'FS-009', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "長建寺", tagIds: ['寺院', '隱密'] },
  { id: 'FS-010', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "伏見大手筋商店街", tagIds: ['打卡'] },
  { id: 'FS-011', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "月の桂 増田徳兵衛商店", tagIds: ['老舖', '隱密'] },
  { id: 'FS-012', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "寺田屋", tagIds: ['老舖', '打卡'] },
  { id: 'FS-013', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', mapQuery: "伏見十石舟", tagIds: ['打卡', '賞花'] },
  { id: 'FS-014', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', mapQuery: "月桂冠大倉記念館", tagIds: ['老舖', '打卡', '現代', '博物館'] },
  { id: 'FS-015', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', mapQuery: "黄桜カッパカントリー", tagIds: ['打卡', '正餐', '現代', '博物館'] },
  { id: 'FS-016', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "伏見稲荷大社 奥社奉拝所", tagIds: ['神社', '打卡'] },
  { id: 'FS-017', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "伏見稲荷大社 根上がり松", tagIds: ['神社', '隱密'] },
  { id: 'FS-018', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "伏見酒蔵小路", tagIds: ['打卡', '正餐'] },
  { id: 'FS-019', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', mapQuery: "伏見桃山城", tagIds: ['打卡', '現代'] },
  { id: 'FS-020', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', mapQuery: "伏見 宇治川派流", tagIds: ['打卡', '賞花'] },
  { id: 'FS-021', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "伏見 竜馬通り", tagIds: ['打卡', '喫茶'] },
  { id: 'FS-022', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "伏見 納屋町商店街", tagIds: ['打卡'] },
  { id: 'FS-023', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "明治天皇 伏見桃山陵", tagIds: ['打卡', '山岳'] },
  { id: 'FS-024', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "乃木神社 伏見", tagIds: ['神社', '隱密'] },
  { id: 'FS-025', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "御香宮神社", tagIds: ['神社', '老舖'] },
  { id: 'FS-026', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "宝塔寺", tagIds: ['寺院', '隱密'] },
  { id: 'FS-027', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "瑞光寺", tagIds: ['寺院', '隱密'] },
  { id: 'FS-028', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "墨染寺", tagIds: ['寺院', '賞花', '隱密'] },
  { id: 'FS-029', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "藤森神社", tagIds: ['神社', '賞花'] },
  { id: 'FS-030', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "キザクラ 伏見蔵", tagIds: ['打卡'] },
  { id: 'FS-031', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_SHOP', mapQuery: "伏見夢百衆", tagIds: ['喫茶', '老舖', '打卡'] },
  { id: 'FS-032', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', mapQuery: "三棲閘門資料館", tagIds: ['隱密', '博物館'] },
  { id: 'FS-033', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "西岸寺 油懸地蔵", tagIds: ['寺院', '隱密'] },
  { id: 'FS-034', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', mapQuery: "京都府立 桃山高等学校", tagIds: ['隱密'] },
  { id: 'FS-035', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_TEMPLE', mapQuery: "荒木神社 伏見稲荷", tagIds: ['神社', '打卡', '隱密'] },
  { id: 'FS-036', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', mapQuery: "ちいかわもぐもぐ本舗 伏見稲荷店", tagIds: ['ACG', '打卡'] },
  { id: 'FS-037', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', mapQuery: "伏見港公園", tagIds: ['賞花'] },
  { id: 'FS-038', wardId: 'W_FUSHIMI', areaId: 'A08', typeId: 'T_NATURE', mapQuery: "醍醐山 登山道", tagIds: ['山岳', '世界遺產'] },
  { id: 'FS-039', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_NATURE', mapQuery: "鴨川 伏見区", tagIds: ['賞花', '自然', '打卡'] },
  { id: 'FS-040', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', mapQuery: "京都アニメーション第1スタジオ跡地", tagIds: ['ACG', '隱密'] },
  { id: 'FS-041', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', mapQuery: "墨染駅 響け！ユーフォニアム", tagIds: ['ACG', '打卡'] },
  { id: 'FS-042', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', mapQuery: "三棲閘門 響け！ユーフォニアム 聖地", tagIds: ['ACG', '打卡'] },
  { id: 'FS-043', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_ACG', mapQuery: "伏見稲荷大社 いなり、こんこん、恋いろは。 聖地", tagIds: ['ACG', '神社'] },
  { id: 'FS-044', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "鳥せい 本店", tagIds: ['正餐', '老舖', '名物'], reservationRequired: true },
  { id: 'FS-045', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "酒粕ラーメン 玄屋", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'FS-046', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "禰ざめや", tagIds: ['正餐', '老舖', '名物', '壽司'] },
  { id: 'FS-047', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "大黒ラーメン", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'FS-048', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "伏見 駿河屋", tagIds: ['和菓子', '老舖'] },
  { id: 'FS-049', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_MODERN', mapQuery: "JRA 京都競馬場", tagIds: ['打卡', '現代'] },
  { id: 'FS-050', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "伊藤久右衛門 JR伏見稲荷店", tagIds: ['抹茶', '和菓子', '名物', '打卡'] },
  { id: 'FS-051', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "藤岡酒造 酒蔵Barえん", tagIds: ['正餐', '老舖', '經典'] },
  { id: 'FS-052', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "魚三楼 伏見", tagIds: ['正餐', '懷石', '老舖'], reservationRequired: true },
  { id: 'FS-053', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "月桂冠 酒蔵茶屋", tagIds: ['和菓子', '老舖', '隱密'] },
  { id: 'FS-054', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "稲荷茶屋 天ぷらそば", tagIds: ['天婦羅', '打卡', '名物'] },
  { id: 'FS-055', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "Vermillion - Cafe", tagIds: ['喫茶', '打卡'] },
  { id: 'FS-056', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "宝玉堂 伏見稲荷", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'FS-057', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "ラー麺 陽はまた昇る", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'FS-058', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "お食事処 山本浜", tagIds: ['正餐', '名物'] },
  { id: 'FS-059', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "伏見 辻利兵衛本店", tagIds: ['和菓子', '老舖', '抹茶'] },
  { id: 'FS-060', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "地球規模で考えろ", tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'FS-061', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "パティスリー ラ ベルダン", tagIds: ['洋菓子', '打卡'] },
  { id: 'FS-062', wardId: 'W_FUSHIMI', areaId: 'A13', typeId: 'T_FOOD', mapQuery: "そば処 手打ち 楽礼", tagIds: ['正餐', '蕎麥'] },
];
