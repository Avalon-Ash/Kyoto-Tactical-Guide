/**
 * @layer SSOT / Schema（結構層）
 * @ward W_UKYO — 右京區
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
 *   src/data/locales/zh/ukyo.ts
 *   src/data/locales/ja/ukyo.ts
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
 *   ── 飲食 ──  正餐  甜點  喫茶  和菓子  抹茶  老舖  名物
 *               壽司  拉麵  烏龍  天婦羅  壽喜燒  涮涮鍋  懷石
 *               豆腐  洋菓子  蕎麥  燒肉
 *   ── 商業 ──  購物  超市  博物館
 *
 * 禁則：T_FOOD 禁用「世界遺產」標籤 / 禁用模糊標籤「美食」「必吃」
 */
import { SpotSchema } from '../../types';

export const UKYO_SCHEMA: SpotSchema[] = [
  { id: 'UK-001', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_HUB', mapQuery: "嵐電 嵐山駅", tagIds: ['鐵道'] },
  { id: 'UK-002', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_HUB', mapQuery: "京福 嵐電西院駅", tagIds: ['鐵道'] },
  { id: 'UK-003', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "天龍寺", tagIds: ['寺院', '世界遺產', '經典', '打卡', '國寶', '庭園'] },
  { id: 'UK-004', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "大覚寺", tagIds: ['寺院', '打卡', '國寶', '庭園'] },
  { id: 'UK-005', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "龍安寺", tagIds: ['寺院', '世界遺產', '隱密', '庭園'] },
  { id: 'UK-006', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "仁和寺", tagIds: ['寺院', '世界遺產', '賞花', '國寶'] },
  { id: 'UK-007', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "嵐山 竹林", tagIds: ['打卡', '自然'] },
  { id: 'UK-008', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "渡月橋", tagIds: ['經典', '打卡'] },
  { id: 'UK-009', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_MODERN', mapQuery: "東映太秦電影村", tagIds: ['打卡', 'ACG', '博物館'] },
  { id: 'UK-010', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_HUB', mapQuery: "JR 嵯峨嵐山駅", tagIds: ['鐵道'] },
  { id: 'UK-011', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_HUB', mapQuery: "トロッコ嵯峨駅", tagIds: ['鐵道'] },
  { id: 'UK-012', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "常寂光寺", tagIds: ['寺院', '隱密', '打卡'] },
  { id: 'UK-013', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "落柿舍", tagIds: ['隱密', '打卡'] },
  { id: 'UK-014', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "祇王寺", tagIds: ['寺院', '隱密'] },
  { id: 'UK-015', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "野宮神社", tagIds: ['神社', '打卡'] },
  { id: 'UK-016', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "化野念仏寺", tagIds: ['寺院', '打卡'] },
  { id: 'UK-017', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_SHOP', mapQuery: "嵯峨野鳥居本", tagIds: ['打卡', '歷史'] },
  { id: 'UK-018', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "妙心寺", tagIds: ['寺院', '隱密'] },
  { id: 'UK-019', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "退藏院", tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'UK-020', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "法金剛院", tagIds: ['寺院', '賞花'] },
  { id: 'UK-021', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_HUB', mapQuery: "JR 花園駅（京都府）", tagIds: ['鐵道'] },
  { id: 'UK-022', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "車折神社", tagIds: ['神社', 'ACG', '打卡'] },
  { id: 'UK-023', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_TEMPLE', mapQuery: "神護寺", tagIds: ['寺院', '打卡', '山岳'] },
  { id: 'UK-024', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_TEMPLE', mapQuery: "高山寺", tagIds: ['寺院', '世界遺產', '隱密', '國寶'] },
  { id: 'UK-025', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_TEMPLE', mapQuery: "西明寺", tagIds: ['寺院', '隱密'] },
  { id: 'UK-026', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_HUB', mapQuery: "京都市バス 栂ノ尾", tagIds: ['巴士'] },
  { id: 'UK-027', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_SHOP', mapQuery: "イオンモール京都五条", tagIds: ['購物'] },
  { id: 'UK-028', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "嵯峨野トロッコ 沿線", tagIds: ['打卡', '自然'] },
  { id: 'UK-029', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "保津川下り", tagIds: ['自然', '打卡'] },
  { id: 'UK-030', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "嵐山公園 中之島地区", tagIds: ['賞花', '自然'] },
  { id: 'UK-031', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "嵐山 亀山公園 展望台", tagIds: ['打卡', '自然'] },
  { id: 'UK-032', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "二尊院", tagIds: ['寺院', '打卡'] },
  { id: 'UK-033', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "宝厳院", tagIds: ['寺院', '庭園', '打卡'] },
  { id: 'UK-034', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "弘源寺", tagIds: ['寺院'] },
  { id: 'UK-035', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "大河内山荘", tagIds: ['庭園', '打卡'] },
  { id: 'UK-036', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "鹿王院", tagIds: ['寺院', '隱密'] },
  { id: 'UK-037', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "広隆寺", tagIds: ['寺院', '歷史'] },
  { id: 'UK-038', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "蛇塚古墳", tagIds: ['歷史', '隱密'] },
  { id: 'UK-039', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_SHOP', mapQuery: "嵐山 昇龍苑", tagIds: ['購物', '打卡'] },
  { id: 'UK-040', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "化野 竹林の小径", tagIds: ['自然', '打卡'] },
  { id: 'UK-041', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "蚕之社", tagIds: ['神社', '隱密'] },
  { id: 'UK-042', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "広沢池", tagIds: ['自然', '隱密'] },
  { id: 'UK-043', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "直指庵", tagIds: ['寺院', '隱密'] },
  { id: 'UK-044', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_TEMPLE', mapQuery: "愛宕神社", tagIds: ['神社', '山岳'] },
  { id: 'UK-045', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_NATURE', mapQuery: "清瀧川", tagIds: ['自然'] },
  { id: 'UK-046', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_FOOD', mapQuery: "高雄 錦水亭", tagIds: ['正餐', '名物', '懷石'] },
  { id: 'UK-047', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_NATURE', mapQuery: "嵐山モンキーパーク", tagIds: ['打卡'] },
  { id: 'UK-048', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵯峨野湯", tagIds: ['喫茶', '名物'] },
  { id: 'UK-049', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵯峨豆腐 竹仙", tagIds: ['正餐', '名物', '豆腐'] },
  { id: 'UK-050', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_TEMPLE', mapQuery: "斎宮神社", tagIds: ['神社', '隱密'] },
  { id: 'UK-051', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "吉兆 嵐山本店", tagIds: ['正餐', '名物', '老舖', '懷石'] },
  { id: 'UK-052', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "% Arabica 京都嵐山", tagIds: ['喫茶', '打卡'] },
  { id: 'UK-053', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "老松 嵐山本店", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'UK-054', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_SHOP', mapQuery: "嵐山 縮緬細工館", tagIds: ['購物'] },
  { id: 'UK-055', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_MODERN', mapQuery: "嵯峨嵐山文華館", tagIds: ['打卡'] },
  { id: 'UK-056', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_MODERN', mapQuery: "福田美術館", tagIds: ['打卡', '現代', '博物館'] },
  { id: 'UK-057', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_MODERN', mapQuery: "嵐山オルゴール博物館", tagIds: ['打卡', '博物館'] },
  { id: 'UK-058', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_MODERN', mapQuery: "19世紀館", tagIds: ['打卡'] },
  { id: 'UK-059', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_ACG', mapQuery: "渡月橋 名探偵コナン", tagIds: ['ACG', '打卡'] },
  { id: 'UK-060', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_ACG', mapQuery: "東映太秦電影村 ACG", tagIds: ['ACG', '打卡'] },
  { id: 'UK-061', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_ACG', mapQuery: "嵐電 嵐山駅 キモノフォレスト", tagIds: ['ACG', '打卡'] },
  { id: 'UK-062', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_ACG', mapQuery: "龍安寺 石庭 ACG", tagIds: ['ACG', '打卡'] },
  { id: 'UK-063', wardId: 'W_UKYO', areaId: 'A12', typeId: 'T_ACG', mapQuery: "車折神社 聖地", tagIds: ['ACG', '打卡'] },
  { id: 'UK-064', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵯峨嵐山 文の助茶屋", tagIds: ['抹茶', '喫茶', '老舖', '隱密'] },
  { id: 'UK-065', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "パンとエスプレッソと嵐山庭園", tagIds: ['喫茶', '打卡', '庭園'] },
  { id: 'UK-066', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 鯛匠 HANANA", tagIds: ['正餐', '名物', '打卡'] },
  { id: 'UK-067', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 MITATE", tagIds: ['抹茶', '洋菓子', '打卡'] },
  { id: 'UK-068', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "野宮神社前 竹林茶屋", tagIds: ['和菓子', '打卡', '抹茶'] },
  { id: 'UK-069', wardId: 'W_UKYO', areaId: 'A11', typeId: 'T_FOOD', mapQuery: "平野屋 嵐山", tagIds: ['正餐', '懷石', '老舖', '隱密'] },
  { id: 'UK-070', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "鶴屋吉信 嵐山店", tagIds: ['和菓子', '老舖', '打卡'] },
  { id: 'UK-071', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "うなぎ 広川", tagIds: ['正餐', '老舖', '名物'], reservationRequired: true },
  { id: 'UK-072', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 大塚", tagIds: ['正餐', '名物', '打卡'] },
  { id: 'UK-073', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 よしむら", tagIds: ['正餐', '蕎麥', '名物', '打卡'] },
  { id: 'UK-074', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "篩月", tagIds: ['正餐', '懷石', '名物', '經典'] },
  { id: 'UK-075', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵯峨野 豆腐", tagIds: ['正餐', '名物', '豆腐'] },
  { id: 'UK-076', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 しゃぶしゃぶ 嵯峨", tagIds: ['正餐', '名物', '涮涮鍋'] },
  { id: 'UK-077', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 寿司 写楽", tagIds: ['正餐', '壽司'] },
  { id: 'UK-078', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "らーめん 嵐丸", tagIds: ['正餐', '拉麵', '名物'] },
  { id: 'UK-079', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 さくらもち 本家 琴きき茶屋", tagIds: ['和菓子', '老舖', '名物'] },
  { id: 'UK-080', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "嵐山 喜重郎", tagIds: ['正餐', '名物'] },
  { id: 'UK-081', wardId: 'W_UKYO', areaId: 'A09', typeId: 'T_FOOD', mapQuery: "焼肉 弘 嵯峨野店", tagIds: ['正餐', '燒肉', '名物'] },
  { id: 'UK-082', wardId: 'W_UKYO', areaId: 'A18', typeId: 'T_TEMPLE', mapQuery: "常照皇寺", tagIds: ['寺院', '賞花', '楓葉', '隱密', '國寶'] },
  { id: 'UK-083', wardId: 'W_UKYO', areaId: 'A18', typeId: 'T_SHOP', mapQuery: "道の駅 ウッディー京北", tagIds: ['名物', '打卡', '購物'] },
];
