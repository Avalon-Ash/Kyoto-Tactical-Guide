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

/** ID mask, used only as a GPU material selector. Never displayed as a second map. */
export function createWardMask(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  if (!ctx) throw new Error('Canvas2D unavailable');
  const output=ctx.createImageData(size,size);
  for(let i=3;i<output.data.length;i+=4) output.data[i]=255;
  WARD_KEYS.forEach((id,index) => {
    ctx.clearRect(0,0,size,size);
    const geometry = WARD_BOUNDARIES[id];
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    ctx.fillStyle = '#fff';
    for (const rings of polygons) {
      ctx.beginPath();
      rings.forEach(ring => { ring.forEach(([lng,lat], i) => {
        const [x,y] = projectMakie(lat,lng);
        if (i === 0) ctx.moveTo(x*size,y*size); else ctx.lineTo(x*size,y*size);
      }); ctx.closePath(); });
      ctx.fill('evenodd');
    }
    // Quantize coverage before assigning the ID. Antialiased ID colours would
    // otherwise invent third districts along unrelated polygon edges.
    const coverage=ctx.getImageData(0,0,size,size).data;
    for(let i=0;i<coverage.length;i+=4) if(coverage[i+3]>=128) output.data[i]=(index+1)*20;
  });
  ctx.putImageData(output,0,0);
  return canvas;
}

export interface LandmarkAtlas {
  color: HTMLCanvasElement;
  owners: HTMLCanvasElement;
  pick(x: number, y: number): string | null;
}

/** Alpha-tested artwork takes priority over the geographic area behind its roof. */
export function pickLandmarkOwner(ids: Uint8Array, size: number, x: number, y: number): string | null {
  if (![x,y].every(Number.isFinite) || x < 0 || x >= 1 || y < 0 || y >= 1) return null;
  const id = ids[Math.floor(y * size) * size + Math.floor(x * size)];
  return WARD_KEYS[id - 1] ?? null;
}

/** Colour and quantized ownership share the very same rasterization and projection. */
export function createLandmarkAtlas(size: number, toji?: CanvasImageSource): LandmarkAtlas {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas2D unavailable');
  const color = document.createElement('canvas'), owners = document.createElement('canvas');
  color.width = color.height = owners.width = owners.height = size;
  const colorCtx = color.getContext('2d'), ownerCtx = owners.getContext('2d');
  if (!colorCtx || !ownerCtx) throw new Error('Canvas2D unavailable');
  const ids = new Uint8Array(size * size);
  for (const landmark of MAKIE_LANDMARKS) {
    ctx.clearRect(0, 0, size, size);
    const [x,y] = landmarkPosition(landmark);
    ctx.save(); ctx.translate(x*size,y*size); ctx.scale(size/1100,size/1100);
    if (landmark.spotId === 'MN-001' && toji) {
      ctx.drawImage(toji, -142, -119, 152, 152);
    } else {
      ctx.shadowColor = '#000'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
      ctx.lineWidth = 1; ctx.strokeStyle = '#f4d18c';
      const metal = ctx.createLinearGradient(-30,-35,30,18);
      metal.addColorStop(0,'#583418'); metal.addColorStop(.35,'#ecbe6d'); metal.addColorStop(.5,'#94703a'); metal.addColorStop(.8,'#dcae62'); metal.addColorStop(1,'#483016');
      ctx.fillStyle = metal;
      const roof = (width:number, top:number) => {
        ctx.beginPath(); ctx.moveTo(-width,top+14); ctx.quadraticCurveTo(-width*.5,top+12,-width*.25,top);
        ctx.lineTo(width*.25,top); ctx.quadraticCurveTo(width*.5,top+12,width,top+14);
        ctx.quadraticCurveTo(0,top+21,-width,top+14); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        for (let k=-5;k<=5;k++) { ctx.beginPath(); ctx.moveTo(k*width/20,top+2); ctx.lineTo(k*width/6,top+14); ctx.strokeStyle='#3a261a88'; ctx.stroke(); }
        ctx.strokeStyle='#f4d18c';
      };
      const hall = (w:number, top:number) => {
        ctx.fillStyle='#3a2116'; ctx.fillRect(-w*.7,top+10,w*1.4,19);
        for (let k=-3;k<=3;k++) { ctx.fillStyle='#bd8c4d'; ctx.fillRect(k*w/5-1,top+12,2,17); }
        ctx.fillStyle=metal; roof(w,top);
        ctx.fillRect(-w*.85,top+29,w*1.7,2);
      };
      if (landmark.shape === 'torii') {
        for(let j=2;j>=0;j--) { ctx.save(); ctx.translate(j*8,-j*5); ctx.scale(1-j*.16,1-j*.16);
          ctx.fillStyle='#6d2a19'; ctx.fillRect(-18,-17,5,38); ctx.fillRect(13,-17,5,38);
          ctx.fillStyle=metal; ctx.fillRect(-27,-23,54,5); ctx.fillRect(-23,-12,46,3); ctx.strokeRect(-27,-23,54,5); ctx.restore(); }
      } else if (landmark.shape === 'pagoda') {
        for(let j=0;j<5;j++) hall(26-j*3,10-j*13);
        ctx.beginPath(); ctx.moveTo(0,-42); ctx.lineTo(0,-67); ctx.stroke();
        for(let j=0;j<5;j++) { ctx.beginPath(); ctx.ellipse(0,-47-j*3,3,1,0,0,Math.PI*2); ctx.stroke(); }
      } else {
        if (landmark.shape === 'palace') { ctx.save(); ctx.translate(-27,3); hall(19,-10); ctx.translate(54,0); hall(19,-10); ctx.restore(); }
        hall(landmark.shape === 'palace' ? 33 : 29,-23);
        if (landmark.spotId === 'KT-005' || landmark.spotId === 'SK-006') hall(21,-41);
      }
    }
    ctx.restore();
    colorCtx.drawImage(canvas, 0, 0);
    // Read only the motif footprint, including soft ground, not eleven full atlases.
    const left = Math.max(0, Math.floor((x - 170 / 1100) * size));
    const top = Math.max(0, Math.floor((y - 140 / 1100) * size));
    const right = Math.min(size, Math.ceil((x + 80 / 1100) * size));
    const bottom = Math.min(size, Math.ceil((y + 70 / 1100) * size));
    const width = right - left, height = bottom - top;
    const pixels = ctx.getImageData(left, top, width, height).data;
    const owner = WARD_KEYS.indexOf(landmark.wardId) + 1;
    for (let row = 0; row < height; row++) for (let col = 0; col < width; col++) {
      if (pixels[(row * width + col) * 4 + 3] >= 64) ids[(top + row) * size + left + col] = owner;
    }
  }
  const pixels = ownerCtx.createImageData(size, size);
  for (let i = 0; i < ids.length; i++) {
    pixels.data[i * 4] = ids[i] * 20;
    pixels.data[i * 4 + 3] = 255;
  }
  ownerCtx.putImageData(pixels, 0, 0);
  return { color, owners, pick: (x, y) => pickLandmarkOwner(ids, size, x, y) };
}
