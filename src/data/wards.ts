import { I18nText } from '../types';

export const WARD_KEYS = [
  'W_KITA', 'W_KAMIGYO', 'W_SAKYO', 'W_NAKAGYO', 'W_HIGASHIYAMA', 
  'W_SHIMOGYO', 'W_MINAMI', 'W_UKYO', 'W_NISHIKYO', 'W_YAMASHINA', 'W_FUSHIMI'
];

export const WARD_NAMES: Record<string, I18nText> = {
  W_KITA: { zh: "北區", ja: "北区" },
  W_KAMIGYO: { zh: "上京區", ja: "上京区" },
  W_SAKYO: { zh: "左京區", ja: "左京区" },
  W_NAKAGYO: { zh: "中京區", ja: "中京区" },
  W_HIGASHIYAMA: { zh: "東山區", ja: "東山区" },
  W_SHIMOGYO: { zh: "下京區", ja: "下京区" },
  W_MINAMI: { zh: "南區", ja: "南区" },
  W_UKYO: { zh: "右京區", ja: "右京区" },
  W_NISHIKYO: { zh: "西京區", ja: "西京区" },
  W_YAMASHINA: { zh: "山科區", ja: "山科区" },
  W_FUSHIMI: { zh: "伏見區", ja: "伏見区" }
};

export const WARD_DESCS: Record<string, I18nText> = {
  W_KITA: { zh: "皇家園林・信仰核心", ja: "皇家庭園・信仰の核心" },
  W_KAMIGYO: { zh: "御所官府・紡織西陣", ja: "御所官庁・西陣織の里" },
  W_SAKYO: { zh: "知識散策・森林秘境", ja: "知識散策・森林の秘境" },
  W_NAKAGYO: { zh: "咖啡散步・居酒屋夜戰", ja: "珈琲散歩・居酒屋夜戦" },
  W_HIGASHIYAMA: { zh: "寺社密集・工藝重鎮", ja: "寺社密集・伝統工芸" },
  W_SHIMOGYO: { zh: "交通門戶・購物商圈", ja: "交通の門・ショッピング" },
  W_MINAMI: { zh: "鐵道要衝・下町風情", ja: "鉄道要衝・レトロ下町" },
  W_UKYO: { zh: "嵐山絕景・禪宗庭園", ja: "嵐山絶景・禅宗庭園" },
  W_NISHIKYO: { zh: "苔之靈域・竹之幽嶺", ja: "苔の霊域・竹の幽嶺" },
  W_YAMASHINA: { zh: "櫻花鐵道・山科古教", ja: "桜の鉄道・山科古教" },
  W_FUSHIMI: { zh: "清酒酒窖・千本鳥居", ja: "清酒の蔵・千本鳥居" }
};

// Cached stats for performance
export const WARD_STATS: Record<string, number> = {
  W_KITA: 25,
  W_KAMIGYO: 35,
  W_SAKYO: 75,
  W_NAKAGYO: 65,
  W_HIGASHIYAMA: 62,
  W_SHIMOGYO: 42,
  W_MINAMI: 16,
  W_UKYO: 68,
  W_NISHIKYO: 18,
  W_YAMASHINA: 10,
  W_FUSHIMI: 34
};
