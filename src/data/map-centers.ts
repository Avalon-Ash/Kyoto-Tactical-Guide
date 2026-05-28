// 中心點位子資料 SSOT (Single Source of Truth)
// 供地圖叢集模式使用，定義各節點真實的地理坐標 (緯度, 經度)

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
export const SPOT_POSITIONS: Record<string, { lat: number, lng: number }> = {
  'HY-003': { lat: 34.9948, lng: 135.7850 }, // 清水寺
  'KT-005': { lat: 35.0394, lng: 135.7292 }, // 金閣寺
  'FS-006': { lat: 34.9671, lng: 135.7727 }, // 伏見稲荷大社
  'UK-007': { lat: 35.0175, lng: 135.6720 }, // 竹林の小径
  'NK-006': { lat: 35.0142, lng: 135.7482 }, // 二条城
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
