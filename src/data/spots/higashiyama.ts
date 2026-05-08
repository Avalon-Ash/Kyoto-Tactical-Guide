/**
 * @layer SSOT / Schema（結構層）
 * @ward W_HIGASHIYAMA — 東山區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/higashiyama.ts
 *   src/data/locales/ja/higashiyama.ts
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

export const HIGASHIYAMA_SCHEMA: SpotSchema[] = [
  { id: 'HY-001', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', mapQuery: "京阪電車 祇園四條站", tagIds: ['地鐵'] },
  { id: 'HY-002', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', mapQuery: "京阪電車 三條京阪站", tagIds: ['地鐵'] },
  { id: 'HY-003', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "清水寺", tagIds: ['寺院', '世界遺產', '經典', '打卡'] },
  { id: 'HY-004', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "八坂神社", tagIds: ['神社', '經典', '打卡'] },
  { id: 'HY-005', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "知恩院", tagIds: ['寺院', '打卡'] },
  { id: 'HY-006', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "建仁寺", tagIds: ['寺院', '庭園', '打卡'] },
  { id: 'HY-007', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "三十三間堂", tagIds: ['寺院', '經典'] },
  { id: 'HY-008', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', mapQuery: "祇園 花見小路", tagIds: ['經典', '打卡'] },
  { id: 'HY-009', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', mapQuery: "二年坂 三年坂", tagIds: ['經典', '打卡'] },
  { id: 'HY-010', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', mapQuery: "京都市巴士 東山安井", tagIds: ['巴士'] },
  { id: 'HY-011', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', mapQuery: "京都市巴士 清水道", tagIds: ['巴士'] },
  { id: 'HY-012', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "高台寺", tagIds: ['寺院', '庭園', '打卡'] },
  { id: 'HY-013', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "圓德院", tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'HY-014', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "安井金比羅宮", tagIds: ['神社', '打卡'] },
  { id: 'HY-015', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "智積院", tagIds: ['寺院', '庭園', '楓葉'] },
  { id: 'HY-016', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "養源院", tagIds: ['寺院', '隱密'] },
  { id: 'HY-017', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_MODERN', mapQuery: "京都國立博物館", tagIds: ['打卡'] },
  { id: 'HY-060', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_HUB', mapQuery: "京都市營地下鐵 東山站", tagIds: ['地鐵'] },
  { id: 'HY-018', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_NATURE', mapQuery: "白川一本橋", tagIds: ['自然', '打卡'] },
  { id: 'HY-019', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_NATURE', mapQuery: "圓山公園 櫻花", tagIds: ['賞花', '打卡'] },
  { id: 'HY-020', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "法觀寺 八坂塔", tagIds: ['打卡', '經典'] },
  { id: 'HY-021', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_MODERN', mapQuery: "靈山歷史館", tagIds: ['打卡'] },
  { id: 'HY-022', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "京都靈山護國神社", tagIds: ['神社'] },
  { id: 'HY-023', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "地主神社", tagIds: ['神社', '打卡'] },
  { id: 'HY-024', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_NATURE', mapQuery: "音羽之瀧", tagIds: ['自然', '打卡'] },
  { id: 'HY-025', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "六波羅蜜寺", tagIds: ['寺院'] },
  { id: 'HY-026', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "六道珍皇寺", tagIds: ['寺院', '隱密'] },
  { id: 'HY-027', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', mapQuery: "宮川町", tagIds: ['打卡'] },
  { id: 'HY-028', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "京都惠美須神社", tagIds: ['神社'] },
  { id: 'HY-029', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "仲源寺", tagIds: ['寺院'] },
  { id: 'HY-030', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "辰巳大明神", tagIds: ['神社', '打卡'] },
  { id: 'HY-031', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_NATURE', mapQuery: "白川南通", tagIds: ['打卡', '賞花'] },
  { id: 'HY-032', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', mapQuery: "石塀小路", tagIds: ['打卡', '隱密'] },
  { id: 'HY-033', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', mapQuery: "寧寧之道", tagIds: ['打卡', '經典'] },
  { id: 'HY-034', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "豐國神社", tagIds: ['神社'] },
  { id: 'HY-035', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "方廣寺", tagIds: ['寺院'] },
  { id: 'HY-036', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "耳塚", tagIds: ['打卡'] },
  { id: 'HY-037', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "東福寺", tagIds: ['寺院', '楓葉', '庭園'] },
  { id: 'HY-038', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_NATURE', mapQuery: "臥雲橋", tagIds: ['楓葉', '打卡'] },
  { id: 'HY-039', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "東福寺 通天橋", tagIds: ['楓葉', '打卡'] },
  { id: 'HY-040', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "光明院", tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'HY-041', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "泉涌寺", tagIds: ['寺院'] },
  { id: 'HY-042', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "今熊野觀音寺", tagIds: ['寺院', '楓葉'] },
  { id: 'HY-043', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "泉涌寺 雲龍院", tagIds: ['寺院', '隱密'] },
  { id: 'HY-044', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_TEMPLE', mapQuery: "瀧尾神社", tagIds: ['神社', '打卡'] },
  { id: 'HY-045', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_TEMPLE', mapQuery: "崇德天皇御廟", tagIds: ['打卡', '隱密'] },
  { id: 'HY-046', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: "茶寮都路里 高台寺店", tagIds: ['抹茶', '和菓子', '必吃'] },
  { id: 'HY-047', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: "長樂館", tagIds: ['打卡', '正餐', '喫茶'] },
  { id: 'HY-050', wardId: 'W_HIGASHIYAMA', areaId: 'A07', typeId: 'T_NATURE', mapQuery: "九條池 東福寺", tagIds: ['自然'] },
  { id: 'HY-051', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', mapQuery: "清水寺 舞台 柯南", tagIds: ['ACG', '寺院'] },
  { id: 'HY-052', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', mapQuery: "八坂神社 舞殿 刀劍亂舞", tagIds: ['ACG', '神社'] },
  { id: 'HY-053', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', mapQuery: "巽橋 有頂天家族", tagIds: ['ACG', '打卡'] },
  { id: 'HY-054', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', mapQuery: "建仁寺 雙龍圖 咒術迴戰", tagIds: ['ACG', '寺院'] },
  { id: 'HY-055', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_ACG', mapQuery: "祇園 白川 宵山 柯南", tagIds: ['ACG', '打卡'] },
  { id: 'HY-056', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: "鍵善良房 四條本店", tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'HIGASHIYAMA_TEMPURA_ENDO', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: '天ぷら えんどう 祇園', tagIds: ['天婦羅', '正餐', '老舖'] },
  { id: 'HY-058', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: "祇園 萬養軒", tagIds: ['正餐', '老舖'] },
  { id: 'HY-059', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: "ぎをん 萬屋", tagIds: ['正餐', '必吃', '烏龍'] },
  { id: 'HY-061', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: "茶寮都路里 祇園本店", tagIds: ['抹茶', '和菓子', '必吃', '打卡'] },
  { id: 'HY-062', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_SHOP', mapQuery: "祇園辻利 祇園本店", tagIds: ['抹茶', '和菓子', '老舖'] },
  { id: 'HY-063', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: "中村藤吉 京都祇園店", tagIds: ['抹茶', '和菓子', '必吃'] },
  { id: 'W_HIGASHIYAMA_AKOYA_CHAYA', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: '阿古屋茶屋 清水寺', tagIds: ['正餐', '老舖', '隱密', '豆腐'] },
  { id: 'W_HIGASHIYAMA_SHICHIMIYA_HONPO_CHASEKI', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: '七味家本舖 茶席 産寧坂', tagIds: ['和菓子', '老舖', '打卡'] },
  { id: 'W_HIGASHIYAMA_JUNIDANYA', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: '十二段家 祇園', tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'W_HIGASHIYAMA_GION_YATA', wardId: 'W_HIGASHIYAMA', areaId: 'A06', typeId: 'T_FOOD', mapQuery: '祇をん 八咫 祇園白川', tagIds: ['正餐', '和牛', '隱密', '懷石'] }
];
