/**
 * @layer SSOT / Schema（結構層）
 * @ward W_KAMIGYO — 上京區
 * 本檔僅存放機器可讀欄位：id / wardId / areaId / typeId / mapQuery / tagIds
 * 禁止存放任何語言文字（name / desc / tags）。
 *
 * 新增一筆時，必須同步維護：
 *   src/data/locales/zh/kamigyo.ts
 *   src/data/locales/ja/kamigyo.ts
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

export const KAMIGYO_SCHEMA: SpotSchema[] = [
  { id: 'KG-001', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "北野天満宮", tagIds: ['神社', '賞花', '經典', '打卡'] },
  { id: 'KG-002', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "今出川駅", tagIds: ['地鐵'] },
  { id: 'KG-003', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "相國寺", tagIds: ['寺院', '庭園'] },
  { id: 'KG-004', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "廬山寺", tagIds: ['寺院', '庭園', '隱密'] },
  { id: 'KG-005', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "清淨華院", tagIds: ['寺院'] },
  { id: 'KG-006', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "梨木神社", tagIds: ['神社', '賞花'] },
  { id: 'KG-007', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "京都御所", tagIds: ['庭園', '打卡'] },
  { id: 'KG-008', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "京都御苑", tagIds: ['賞花', '楓葉'] },
  { id: 'KG-009', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "同志社大學 今出川", tagIds: ['打卡'] },
  { id: 'KG-010', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "丸太町駅", tagIds: ['地鐵'] },
  { id: 'KG-011', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_TEMPLE', mapQuery: "上七軒", tagIds: ['打卡', '老舖'] },
  { id: 'KG-012', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "晴明神社", tagIds: ['神社', '打卡'] },
  { id: 'KG-013', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "白峯神宮", tagIds: ['神社'] },
  { id: 'KG-014', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "妙顯寺", tagIds: ['寺院', '庭園'] },
  { id: 'KG-015', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "本法寺", tagIds: ['寺院', '庭園'] },
  { id: 'KG-016', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "一条戻橋", tagIds: ['打卡', '歷史'] },
  { id: 'KG-017', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "西陣織會館", tagIds: ['打卡'] },
  { id: 'KG-018', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "堀川商店街", tagIds: ['打卡'] },
  { id: 'KG-019', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_FOOD', mapQuery: "澤屋 粟餅", tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'KG-020', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "護王神社", tagIds: ['神社'] },
  { id: 'KG-021', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "京都御苑 近衛邸跡 櫻花", tagIds: ['賞花', '打卡'] },
  { id: 'KG-022', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "京都御苑 縣井 櫻花", tagIds: ['賞花'] },
  { id: 'KG-023', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "上御靈神社", tagIds: ['神社'] },
  { id: 'KG-024', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "虎屋一條 虎屋寬", tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'KG-025', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "鶴屋吉信 本店", tagIds: ['和菓子', '老舖', '必吃'] },
  { id: 'KG-026', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "本家尾張屋 本店", tagIds: ['正餐', '老舖', '必吃', '蕎麥'] },
  { id: 'KG-027', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "大將軍八神社", tagIds: ['神社', '隱密'] },
  { id: 'KG-028', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "妙蓮寺", tagIds: ['寺院'] },
  { id: 'KG-029', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "雨寶院", tagIds: ['寺院', '賞花', '隱密'] },
  { id: 'KG-030', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "千本釋迦堂", tagIds: ['寺院'] },
  { id: 'KG-031', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "千本ゑんま堂", tagIds: ['寺院'] },
  { id: 'KG-032', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "釘拔地藏 石像寺", tagIds: ['寺院', '隱密'] },
  { id: 'KG-033', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_TEMPLE', mapQuery: "幸神社", tagIds: ['神社', '隱密'] },
  { id: 'KG-034', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "三上家路地", tagIds: ['打卡', '隱密'] },
  { id: 'KG-035', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_TEMPLE', mapQuery: "清荒神 護淨院", tagIds: ['寺院', '隱密'] },
  { id: 'KG-037', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "樂美術館", tagIds: ['老舖', '打卡'] },
  { id: 'KG-038', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "菅原院天滿宮神社", tagIds: ['神社'] },
  { id: 'KG-039', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "廬山寺 通", tagIds: ['隱密'] },
  { id: 'KG-040', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "阿彌陀寺", tagIds: ['寺院', '隱密'] },
  { id: 'KG-041', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "首途八幡宮", tagIds: ['神社', '隱密'] },
  { id: 'KG-042', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_TEMPLE', mapQuery: "宥清寺", tagIds: ['寺院'] },
  { id: 'KG-043', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "上京區役所", tagIds: ['隱密'] },
  { id: 'KG-044', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_MODERN', mapQuery: "西陣產業會館", tagIds: ['打卡'] },
  { id: 'KG-045', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "梨木神社 染井水", tagIds: ['神社', '自然'] },
  { id: 'KG-046', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_HUB', mapQuery: "京都市公車 堀川今出川", tagIds: ['巴士'] },
  { id: 'KG-047', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_SHOP', mapQuery: "西陣 織成館", tagIds: ['打卡'] },
  { id: 'KG-048', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: "西陣 鳥岩樓", tagIds: ['正餐', '必吃', '老舖'] },
  { id: 'KG-049', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_MODERN', mapQuery: "京都府廳舊本館", tagIds: ['打卡', '賞花'] },
  { id: 'KG-050', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_NATURE', mapQuery: "京都御苑 九條池", tagIds: ['庭園'] },
  { id: 'KG-051', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_NATURE', mapQuery: "京都御苑 拾翠亭", tagIds: ['打卡', '隱密'] },
  { id: 'KG-052', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_NATURE', mapQuery: "堀川水際公園", tagIds: ['賞花'] },
  { id: 'KG-053', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_ACG', mapQuery: "晴明神社 陰陽師 聖地", tagIds: ['ACG', '神社'] },
  { id: 'KG-054', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_ACG', mapQuery: "北野天滿宮 髭切", tagIds: ['ACG', '神社'] },
  { id: 'KG-055', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_ACG', mapQuery: "一條戾橋 有頂天家族", tagIds: ['ACG', '打卡'] },
  { id: 'KG-056', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_ACG', mapQuery: "西陣 露地 散策", tagIds: ['ACG', '打卡'] },
  { id: 'KG-057', wardId: 'W_KAMIGYO', areaId: 'A02', typeId: 'T_ACG', mapQuery: "同志社大學 彰榮館", tagIds: ['ACG', '打卡'] },
  { id: 'W_KAMIGYO_IPPODO_KAGI', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: '一保堂茶舖 嘉木', tagIds: ['抹茶', '老舖', '隱密', '喫茶'] },
  { id: 'W_KAMIGYO_ORYORI_HAYASHI', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: '御料理 はやし', tagIds: ['正餐', '懷石', '隱密'] },
  { id: 'W_KAMIGYO_CHOGOROMOCHI', wardId: 'W_KAMIGYO', areaId: 'A12', typeId: 'T_FOOD', mapQuery: '長五郎餅本舗 北野天滿宮', tagIds: ['和菓子', '老舖', '打卡'] },
  { id: 'W_KAMIGYO_FUNAHASHIYA_NIBEI', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: '船はしや仁兵衛', tagIds: ['喫茶', '老舖', '隱密', '和菓子'] },
  { id: 'KAMIGYO_TEMPURA_YOSHIKAWA', wardId: 'W_KAMIGYO', areaId: 'A03', typeId: 'T_FOOD', mapQuery: '天ぷら よしかわ 西陣', tagIds: ['天婦羅', '正餐', '隱密'] }
];
