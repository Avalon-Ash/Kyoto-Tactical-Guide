/**
 * @layer SSOT / Schema（結構層）
 * @ward W_NISHIKYO — 西京區
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
 *   src/data/locales/zh/nishikyo.ts
 *   src/data/locales/ja/nishikyo.ts
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

export const NISHIKYO_SCHEMA: SpotSchema[] = [
  { id: 'NK-001', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_HUB', mapQuery: "阪急 嵐山駅", tagIds: ['鐵道'] },
  { id: 'NK-002', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_HUB', mapQuery: "松尾大社駅", tagIds: ['鐵道'] },
  { id: 'NK-004', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_HUB', mapQuery: "上桂駅", tagIds: ['鐵道'] },
  { id: 'NK-005', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_HUB', mapQuery: "洛西口駅", tagIds: ['鐵道'] },
  { id: 'NK-006', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_HUB', mapQuery: "桂駅 バス停", tagIds: ['巴士'] },
  { id: 'NK-007', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "桂離宮", tagIds: ['庭園', '世界遺產', '打卡', '國寶'], reservationRequired: true },
  { id: 'NK-008', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "松尾大社", tagIds: ['神社', '打卡'] },
  { id: 'NK-009', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "大原野神社", tagIds: ['神社', '打卡'] },
  { id: 'NK-010', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "勝持寺", tagIds: ['寺院', '賞花'] },
  { id: 'NK-011', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "京都 正法寺", tagIds: ['寺院', '庭園'] },
  { id: 'NK-012', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_HUB', mapQuery: "阪急 桂駅", tagIds: ['鐵道'] },
  { id: 'NK-013', wardId: 'W_NISHIKYO', areaId: 'A19', typeId: 'T_TEMPLE', mapQuery: "善峯寺", tagIds: ['寺院', '打卡', '隱密', '國寶'] },
  { id: 'NK-017', wardId: 'W_NISHIKYO', areaId: 'A19', typeId: 'T_TEMPLE', mapQuery: "十輪寺 京都", tagIds: ['寺院', '隱密'] },
  { id: 'NK-018', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "西芳寺", tagIds: ['寺院', '世界遺產', '隱密', '打卡', '庭園'], reservationRequired: true },
  { id: 'NK-019', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "地藏院 竹之寺", tagIds: ['寺院', '隱密'] },
  { id: 'NK-020', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "華厳寺 鈴虫寺", tagIds: ['寺院', '打卡', '經典'] },
  { id: 'NK-021', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "虚空蔵法輪寺", tagIds: ['寺院', '歷史'] },
  { id: 'NK-022', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "桂川 嵐山東公園", tagIds: ['自然'] },
  { id: 'NK-023', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "嵐山中之島公園 (西京區)", tagIds: ['自然', '自然'] },
  { id: 'NK-024', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_SHOP', mapQuery: "洛西地下街", tagIds: ['購物'] },
  { id: 'NK-025', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "西山公園", tagIds: ['自然'] },
  { id: 'NK-026', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "沓掛交流道", tagIds: ['打卡'] },
  { id: 'NK-027', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "洛西新城 景観", tagIds: ['打卡'] },
  { id: 'NK-028', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: "寿司 誠 桂店", tagIds: ['正餐', '名物', '壽司'] },
  { id: 'NK-029', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "桂川 渡月橋南側", tagIds: ['展望', '打卡'] },
  { id: 'NK-030', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "法輪寺 展望台", tagIds: ['展望', '打卡'] },
  { id: 'NK-031', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "西芳寺川 步道", tagIds: ['自然', '隱密'] },
  { id: 'NK-032', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "洛西 桜通り", tagIds: ['賞花', '打卡'] },
  { id: 'NK-033', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "大原野 菜の花畑", tagIds: ['賞花'] },
  { id: 'NK-034', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "正法寺 しだれ桜", tagIds: ['賞花', '打卡'] },
  { id: 'NK-035', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "善峯寺 遊龍の松", tagIds: ['打卡', '國寶'] },
  { id: 'NK-036', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "松尾大社 酒資料館", tagIds: ['博物館', '打卡'] },
  { id: 'NK-037', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "西京区役所", tagIds: ['打卡'] },
  { id: 'NK-038', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "阪急 桂車庫 景観", tagIds: ['鐵道', '打卡'] },
  { id: 'NK-039', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "桂川 堤防自行車道", tagIds: ['自然'] },
  { id: 'NK-040', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "勝持寺 櫻花", tagIds: ['賞花', '打卡'] },
  { id: 'NK-041', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_SHOP', mapQuery: "大原野神社 參道", tagIds: ['神社', '楓葉', '打卡'] },
  { id: 'NK-042', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "京都 桂溫泉", tagIds: ['溫泉', '打卡'] },
  { id: 'NK-043', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "京都市立芸術大学", tagIds: ['打卡', '現代'] },
  { id: 'NK-044', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_NATURE', mapQuery: "嵐山 展望路 (西京側)", tagIds: ['展望', '打卡'] },
  { id: 'NK-045', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_TEMPLE', mapQuery: "西京 庚申堂", tagIds: ['神社', '歷史'] },
  { id: 'NK-046', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: "中村軒", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'NK-047', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_SHOP', mapQuery: "桂東口商店街", tagIds: ['購物'] },
  { id: 'NK-048', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_SHOP', mapQuery: "高島屋 洛西店", tagIds: ['購物'] },
  { id: 'NK-049', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_ACG', mapQuery: "阪急 嵐山站 K-ON", tagIds: ['ACG', '打卡'] },
  { id: 'NK-050', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_ACG', mapQuery: "松尾大社 ACG", tagIds: ['ACG', '打卡'] },
  { id: 'NK-051', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_ACG', mapQuery: "鈴蟲寺 ACG", tagIds: ['ACG', '打卡'] },
  { id: 'NK-052', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_ACG', mapQuery: "嵐山モンキーパーク", tagIds: ['ACG', '打卡'] },
  { id: 'NK-053', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_ACG', mapQuery: "阪急 上桂站 K-ON", tagIds: ['ACG', '打卡'] },
  { id: 'NK-054', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: "麺たんぴん", tagIds: ['正餐', '名物', '拉麵'] },
  { id: 'NK-055', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: "喫茶 ヤマモト", tagIds: ['喫茶', '名物'] },
  { id: 'NK-056', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: "そば切り 十二屋", tagIds: ['正餐', '名物', '蕎麥'] },
  { id: 'NK-057', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: "柿本 豆富店", tagIds: ['正餐', '名物', '豆腐'] },
  { id: 'NK-058', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_MODERN', mapQuery: "京都大学 桂キャンパス", tagIds: ['打卡', '現代'] },
  { id: 'NK-059', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: "ステーキ大彦", tagIds: ['正餐', '名物'] },
  { id: 'W_NISHIKYO_TSUTA', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: '松尾 桂離宮前 懷石 蔦', tagIds: ['正餐', '懷石', '隱密'] },
  { id: 'W_NISHIKYO_SHIOGAMA', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: '洛西 塩竈の杜', tagIds: ['正餐', '隱密', '豆腐'] },
  { id: 'W_NISHIKYO_YAMADAYA', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: '柚餅子 山田屋', tagIds: ['和菓子', '老舖'] },
  { id: 'W_NISHIKYO_SMART_COFFEE', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: 'スマート珈琲 西京店', tagIds: ['喫茶', '老舖'] },
  { id: 'W_NISHIKYO_MUSETTE', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: 'パティスリー ミュゼット', tagIds: ['洋菓子', '打卡'] },
  { id: 'NISHIKYO_PASS_THE_BATON', wardId: 'W_NISHIKYO', areaId: 'A09', typeId: 'T_SHOP', mapQuery: 'アミティエ 嵐山 カフェ', tagIds: ['現代', '打卡', '洋菓子'] },
  { id: 'NX-FOOD-001', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: 'らーめん ぎん琉', tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'NX-FOOD-002', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: '菓子工房 & カフェ KINEEL', tagIds: ['洋菓子', '打卡'] },
  { id: 'NX-FOOD-003', wardId: 'W_NISHIKYO', areaId: 'A10', typeId: 'T_FOOD', mapQuery: 'すき焼き はり重 桂', tagIds: ['正餐', '壽喜燒', '老舖'] },
  { id: 'NK-060', wardId: 'W_NISHIKYO', areaId: 'A19', typeId: 'T_TEMPLE', mapQuery: '長岡天滿宮', tagIds: ['神社', '賞花', '打卡'] },
  { id: 'NK-061', wardId: 'W_NISHIKYO', areaId: 'A19', typeId: 'T_TEMPLE', mapQuery: '光明寺 長岡京', tagIds: ['寺院', '楓葉', '打卡'] },
];
