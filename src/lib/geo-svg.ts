/**
 * 首頁屏風地圖的投影與程序繪圖工具。
 * 座標慣例：函式參數的 [lat, lng] 為「緯度, 經度」；GeoJSON 原始資料為 [lng, lat]。
 */
import type { WardGeometry } from '../data/geo/ward-boundaries';

/** 顯示範圍：裁掉京北/花背等北部山區，讓市中心比例變大（北緣以金雲遮蓋） */
export const VIEW_BBOX = { minLat: 34.88, maxLat: 35.13, minLng: 135.60, maxLng: 135.87 };
const K = Math.cos(((VIEW_BBOX.minLat + VIEW_BBOX.maxLat) / 2) * Math.PI / 180);
const SCALE = 4000; // 每 1 度緯度 = 4000 viewBox 單位
export const VIEW_W = Math.round((VIEW_BBOX.maxLng - VIEW_BBOX.minLng) * K * SCALE);
export const VIEW_H = Math.round((VIEW_BBOX.maxLat - VIEW_BBOX.minLat) * SCALE);

const r1 = (v: number) => Math.round(v * 10) / 10;

export function project(lat: number, lng: number): [number, number] {
  return [r1((lng - VIEW_BBOX.minLng) * K * SCALE), r1((VIEW_BBOX.maxLat - lat) * SCALE)];
}

function ringToPath(ring: number[][]): string {
  if (ring.length === 0) return '';
  return ring.map(([lng, lat], i) => {
    const [x, y] = project(lat, lng);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join('') + 'Z';
}

/** GeoJSON Polygon / MultiPolygon → SVG path d（搭配 fill-rule="evenodd"） */
export function geometryToPath(geom: WardGeometry): string {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  return polys.map(rings => rings.map(ringToPath).join('')).join('');
}

/** 經過各點的平滑曲線（Catmull-Rom → 三次貝茲），points 為 [lat, lng] */
export function smoothLinePath(points: [number, number][]): string {
  const p = points.map(([lat, lng]) => project(lat, lng));
  if (p.length < 2) return '';
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    const c1x = r1(p1[0] + (p2[0] - p0[0]) / 6), c1y = r1(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = r1(p2[0] - (p3[0] - p1[0]) / 6), c2y = r1(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** 可重現的亂數（同 seed 每次畫出同樣的雲與山） */
export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** すやり霞：上緣為連續圓弧凸起、下緣為較緩弧線的水平雲帶（viewBox 座標） */
export function cloudBandPath(x0: number, x1: number, y: number, h: number, rand: () => number): string {
  if (![x0, x1, y, h].every(Number.isFinite) || h < 0) {
    throw new RangeError('Cloud coordinates must be finite and height must be non-negative.');
  }
  if (x1 <= x0) return '';
  let d = `M${r1(x0)},${r1(y)}`;
  let x = x0;
  while (x < x1) {
    const w = 24 + rand() * 48;
    const nx = Math.min(x + w, x1);
    const rx = (nx - x) / 2;
    d += ` A${r1(rx)},${r1(rx * (0.55 + rand() * 0.45))} 0 0 1 ${r1(nx)},${r1(y)}`;
    x = nx;
  }
  d += ` L${r1(x1)},${r1(y + h)}`;
  while (x > x0) {
    const w = 40 + rand() * 70;
    const nx = Math.max(x - w, x0);
    const rx = (x - nx) / 2;
    d += ` A${r1(rx)},${r1(rx * 0.35)} 0 0 1 ${r1(nx)},${r1(y + h)}`;
    x = nx;
  }
  return d + 'Z';
}

/**
 * 山稜剪影（封閉區域）。side='top' 沿上緣、'left'/'right' 沿左右緣。
 * depth 為山體向內延伸的最大深度（viewBox 單位）。
 */
export function ridgePath(side: 'top' | 'left' | 'right', depth: number, rand: () => number, steps = 48): string {
  if (!Number.isFinite(depth) || depth < 0 || !Number.isSafeInteger(steps) || steps < 1) {
    throw new RangeError('Ridge depth must be finite and non-negative; steps must be a positive integer.');
  }
  const len = side === 'top' ? VIEW_W : VIEW_H;
  const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = (len * i) / steps;
    const n = 0.5 + 0.25 * Math.sin(s * 0.012 + ph[0]) + 0.15 * Math.sin(s * 0.029 + ph[1]) + 0.1 * Math.sin(s * 0.067 + ph[2]);
    const dd = r1(depth * n);
    const [x, y] = side === 'top' ? [r1(s), dd] : side === 'left' ? [dd, r1(s)] : [r1(VIEW_W - dd), r1(s)];
    pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }
  const close = side === 'top' ? `L${VIEW_W},0 L0,0` : side === 'left' ? `L0,${VIEW_H} L0,0` : `L${VIEW_W},${VIEW_H} L${VIEW_W},0`;
  return pts.join(' ') + ' ' + close + ' Z';
}
