// 中心點位子資料 SSOT (Single Source of Truth)
// 供地圖叢集模式使用，定義各節點真實的地理坐標 (緯度, 經度)
// ⚠️ 新增/維護規則 (2026/05 新增)：
// 凡有【世界遺產】、【國寶】或為各區【超重要經典寺社】(如金閣、清水、伏見稻荷) 等名勝古蹟，
// 必須在此檔案的 `SPOT_POSITIONS` 中註冊其「真實經緯度」。如此便會在地圖 (`ClusterMap`) 上以 Icon + Name 的地標形式固定渲染，而非隨機群集點。

// 【真實地理座標對應表】
// 對應京都官方觀光指南的分區，提供精確的地圖中心點
export const AREA_CENTERS: Record<string, { lat: number, lng: number }> = {
  A01: { lat: 35.0036, lng: 135.7596 }, // 烏丸・河原町
  A02: { lat: 35.0254, lng: 135.7621 }, // 御所・西陣
  A03: { lat: 35.0142, lng: 135.7482 }, // 二条城・堀川
  A04: { lat: 34.9811, lng: 135.7476 }, // 東寺・九条
  A05: { lat: 34.9948, lng: 135.7850 }, // 祇園・清水寺
  A06: { lat: 35.0159, lng: 135.7824 }, // 岡崎・平安神宮
  A07: { lat: 35.0058, lng: 135.7830 }, // 東山・知恩院
  A08: { lat: 34.9506, lng: 135.8197 }, // 山科・醍醐
  A09: { lat: 35.0141, lng: 135.6775 }, // 嵯峨野・嵐山
  A10: { lat: 34.9829, lng: 135.7029 }, // 桂・洛西
  A11: { lat: 35.0560, lng: 135.6726 }, // 高雄・周山
  A12: { lat: 35.0393, lng: 135.7292 }, // 鷹峯・衣笠 (金閣寺周邊)
  A13: { lat: 34.9317, lng: 135.7621 }, // 伏見・桃山
  A14: { lat: 35.1189, lng: 135.7725 }, // 鞍馬・貴船
  A15: { lat: 35.0450, lng: 135.7951 }, // 修学院・一乗寺
  A16: { lat: 35.1182, lng: 135.8306 }, // 大原・八瀬
  A17: { lat: 35.2155, lng: 135.7909 }, // 花背・久多
  A18: { lat: 35.1585, lng: 135.6453 }, // 京北・周山街道
  A19: { lat: 34.9295, lng: 135.6983 }  // 向日・長岡京
};

// 特定點位座標覆寫區 (針對單獨景點的真實座標)
// 格式: 'spot_id': { lat, lng }
// 2026-10-28 補登來源與錨點語意見 docs/agent-runs/2026-10-28-landmarks.md；園內錨點不代表幾何中心。
export const SPOT_POSITIONS: Record<string, { lat: number, lng: number }> = {
  // Kita
  'KT-006': { lat: 35.044258, lng: 135.744919 }, // 大徳寺
  'KT-005': { lat: 35.0394, lng: 135.7292 }, // 金閣寺
  'KT-015': { lat: 35.0594, lng: 135.7516 }, // 上賀茂神社

  // Kamigyo
  'KG-029': { lat: 35.031864, lng: 135.739865 }, // 千本釋迦堂（大報恩寺本堂）
  'KG-003': { lat: 35.033409, lng: 135.760574 }, // 相國寺
  'KG-001': { lat: 35.0314, lng: 135.7352 }, // 北野天滿宮
  'KG-007': { lat: 35.0249, lng: 135.7621 }, // 京都御所
  'KG-012': { lat: 35.0264, lng: 135.7514 }, // 晴明神社

  // Sakyo
  'SK-038': { lat: 35.070463, lng: 135.841128 }, // 比叡山 延暦寺（實際位於大津市）
  'SK-080': { lat: 35.235772, lng: 135.793888 }, // 大悲山 峰定寺
  'SK-005': { lat: 35.014173, lng: 135.7954022 }, // 永観堂
  'SK-006': { lat: 35.0269, lng: 135.7982 }, // 銀閣寺
  'SK-008': { lat: 35.0159, lng: 135.7824 }, // 平安神宮
  'SK-012': { lat: 35.1171, lng: 135.7712 }, // 鞍馬寺
  'SK-011': { lat: 35.1221, lng: 135.7629 }, // 貴船神社
  'SK-144': { lat: 35.1158, lng: 135.7721 }, // 由岐神社
  'SK-002': { lat: 35.0396, lng: 135.7725 }, // 下鴨神社
  'SK-004': { lat: 35.0116, lng: 135.7937 }, // 南禅寺

  // Nakagyo
  'NK-018': { lat: 35.0131667, lng: 135.7495 }, // 二条城 二の丸庭園（園内指定石碑）
  'NK-004': { lat: 35.01263, lng: 135.7503 }, // 二条城（二の丸御殿唐門）
  'NK-005': { lat: 35.0049, lng: 135.7649 }, // 錦市場

  // Higashiyama
  'HY-006': { lat: 35.0010773, lng: 135.7739072 }, // 建仁寺
  'HY-003': { lat: 34.9948, lng: 135.7850 }, // 清水寺
  'HY-004': { lat: 35.0036, lng: 135.7785 }, // 八坂神社
  'HY-005': { lat: 35.0059, lng: 135.7830 }, // 知恩院
  'HY-007': { lat: 34.9877, lng: 135.7718 }, // 三十三間堂

  // Shimogyo
  'SG-003': { lat: 34.9915, lng: 135.7519 }, // 西本願寺
  'SG-004': { lat: 34.9906, lng: 135.7594 }, // 東本願寺
  'SG-005': { lat: 34.9874, lng: 135.7595 }, // 京都塔

  // Minami
  'MN-001': { lat: 34.9810, lng: 135.7476 }, // 東寺

  // Ukyo
  'UK-024': { lat: 35.060564, lng: 135.678454 }, // 高山寺
  'UK-082': { lat: 35.200915, lng: 135.685366 }, // 常照皇寺
  'UK-004': { lat: 35.028292, lng: 135.6779631 }, // 大覚寺
  'UK-007': { lat: 35.0175, lng: 135.6720 }, // 竹林の小径
  'UK-003': { lat: 35.0157, lng: 135.6737 }, // 天龍寺
  'UK-005': { lat: 35.0345, lng: 135.7182 }, // 龍安寺
  'UK-006': { lat: 35.0305, lng: 135.7138 }, // 仁和寺

  // Fushimi
  'FS-006': { lat: 34.9671, lng: 135.7727 }, // 伏見稲荷大社
  'FS-007': { lat: 34.9506, lng: 135.8197 }, // 醍醐寺

  // Yamashina
  'YS-006': { lat: 34.959499, lng: 135.816287 }, // 隨心院
  'YS-005': { lat: 34.961773, lng: 135.8075725 }, // 勧修寺
  'YS-004': { lat: 35.0028, lng: 135.8197 }, // 毘沙門堂

  // Nishikyo
  'NS-006': { lat: 34.9840, lng: 135.7093 }, // 桂離宮
  'NS-014': { lat: 34.9922, lng: 135.6841 }, // 西芳寺
  'NS-016': { lat: 34.9926, lng: 135.6881 }, // 鈴虫寺
};

/**
 * 取得節點在真實地圖上的經緯度座標
 */
export function getLatLng(id: string, parentMode?: string, parentId?: string): { lat: number, lng: number } {
  // 若模式為行政區 (Ward)，則 id 為區域 (Area)
  if (parentMode === 'ward' && AREA_CENTERS[id]) {
    return AREA_CENTERS[id];
  } 
  
  // 若模式為區域 (Area)，則 id 為單獨景點 (Spot)
  if (parentMode === 'area') {
    if (SPOT_POSITIONS[id]) return SPOT_POSITIONS[id];
    
    // 如果單一景點沒有真實座標，退而求其次：
    // 使用其所屬 Area 的中心點加一點微調擴散 (Scatter fallback)，這樣不會全部擠在同一個點上
    if (parentId && AREA_CENTERS[parentId]) {
      const baseLat = AREA_CENTERS[parentId].lat;
      const baseLng = AREA_CENTERS[parentId].lng;
      
      // 使用 id 產生確定性的隨機微調值
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const jitterLat = (Math.sin(hash) * 0.005);
      const jitterLng = (Math.cos(hash) * 0.005);
      
      return {
        lat: baseLat + jitterLat,
        lng: baseLng + jitterLng
      };
    }
  }

  // 預設京都車站周邊
  return { lat: 34.985, lng: 135.758 };
}
