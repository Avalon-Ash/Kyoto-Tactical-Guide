import { WARD_BOUNDARIES, type WardGeometry } from '../data/geo/ward-boundaries';
import { WARD_KEYS } from '../data/wards';
import { SPOT_POSITIONS } from '../data/map-centers';
import type { I18nText } from '../types';

// A city-centred cartogram: monotonic axes enlarge the crowded city centre.
// Rendering, picking, and landmark placement all use this same transform.
const LONGITUDES = [135.625, 135.69, 135.735, 135.775, 135.80, 135.855];
const X = [0, .24, .43, .67, .81, 1];
const LATITUDES = [34.91, 34.96, 34.985, 35.015, 35.04, 35.085];
const Y = [1, .83, .65, .43, .25, 0];
function interpolate(value: number, source: number[], target: number[]): number {
  let i = 0;
  while (i < source.length - 2 && value > source[i + 1]) i++;
  return target[i] + (value - source[i]) / (source[i + 1] - source[i]) * (target[i + 1] - target[i]);
}
export function projectMakie(lat: number, lng: number): [number, number] {
  return [interpolate(lng, LONGITUDES, X), interpolate(lat, LATITUDES, Y)];
}
export interface MakieLandmark {
  wardId: string; spotId: string; title: I18nText; oldName: I18nText;
  shape: 'temple' | 'palace' | 'pagoda' | 'torii';
}
// Labels describe today's landmarks and historic place names, not a Heian reconstruction.
export const MAKIE_LANDMARKS: MakieLandmark[] = [
  { wardId:'W_KITA', spotId:'KT-005', title:{zh:'金閣寺',ja:'金閣寺'}, oldName:{zh:'衣笠',ja:'衣笠'}, shape:'temple' },
  { wardId:'W_KAMIGYO', spotId:'KG-007', title:{zh:'京都御所',ja:'京都御所'}, oldName:{zh:'御所・西陣',ja:'御所・西陣'}, shape:'palace' },
  { wardId:'W_SAKYO', spotId:'SK-006', title:{zh:'銀閣寺',ja:'銀閣寺'}, oldName:{zh:'東山・白川',ja:'東山・白川'}, shape:'temple' },
  { wardId:'W_NAKAGYO', spotId:'NK-004', title:{zh:'二条城',ja:'二条城'}, oldName:{zh:'二条・堀川',ja:'二条・堀川'}, shape:'palace' },
  { wardId:'W_HIGASHIYAMA', spotId:'HY-003', title:{zh:'清水寺',ja:'清水寺'}, oldName:{zh:'祇園・清水',ja:'祇園・清水'}, shape:'temple' },
  { wardId:'W_SHIMOGYO', spotId:'SG-003', title:{zh:'西本願寺',ja:'西本願寺'}, oldName:{zh:'堀川七条',ja:'堀川七条'}, shape:'temple' },
  { wardId:'W_MINAMI', spotId:'MN-001', title:{zh:'東寺',ja:'東寺'}, oldName:{zh:'東寺・九条',ja:'東寺・九条'}, shape:'pagoda' },
  { wardId:'W_UKYO', spotId:'UK-003', title:{zh:'天龍寺',ja:'天龍寺'}, oldName:{zh:'嵯峨野',ja:'嵯峨野'}, shape:'temple' },
  { wardId:'W_NISHIKYO', spotId:'NS-006', title:{zh:'桂離宮',ja:'桂離宮'}, oldName:{zh:'桂',ja:'桂'}, shape:'palace' },
  { wardId:'W_YAMASHINA', spotId:'YS-004', title:{zh:'毘沙門堂',ja:'毘沙門堂'}, oldName:{zh:'山科',ja:'山科'}, shape:'temple' },
  { wardId:'W_FUSHIMI', spotId:'FS-006', title:{zh:'伏見稻荷',ja:'伏見稲荷'}, oldName:{zh:'深草・伏見',ja:'深草・伏見'}, shape:'torii' },
];
export const landmarkPosition = (landmark: MakieLandmark): [number, number] => {
  const { lat, lng } = SPOT_POSITIONS[landmark.spotId];
  return projectMakie(lat, lng);
};

export function ringContains(ring: number[][], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function geometryContains(geometry: WardGeometry, lng: number, lat: number): boolean {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some(rings => ringContains(rings[0], lng, lat) && !rings.slice(1).some(ring => ringContains(ring, lng, lat)));
}
export function pickMakieWard(x: number, y: number): string | null {
  if (![x,y].every(Number.isFinite) || x < 0 || x > 1 || y < 0 || y > 1) return null;
  const lng = interpolate(x, X, LONGITUDES);
  const lat = interpolate(1 - y, Y.map(v => 1 - v), LATITUDES);
  return WARD_KEYS.find(id => geometryContains(WARD_BOUNDARIES[id], lng, lat)) ?? null;
}

/** Alpha-tested artwork takes priority over the geographic area behind its roof. */
export function pickLandmarkOwner(ids: Uint8Array, size: number, x: number, y: number): string | null {
  if (![x,y].every(Number.isFinite) || x < 0 || x >= 1 || y < 0 || y >= 1) return null;
  const id = ids[Math.floor(y * size) * size + Math.floor(x * size)];
  return WARD_KEYS[id - 1] ?? null;
}
