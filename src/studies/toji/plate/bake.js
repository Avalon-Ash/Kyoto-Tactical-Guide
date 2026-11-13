// Rasterises a plate's parts with Canvas 2D. The GPU side (blur, upload) lives in renderer.js.
// Channels of a painted layer:  R soft swell (blurred later)  G crisp relief  B line work  A coverage.
import {PLATE} from './vocab.js';

const trace = (ctx, d, close) => {
  ctx.beginPath();
  ctx.moveTo(d[0][0], d[0][1]);
  for (let i = 1; i < d.length; i++) ctx.lineTo(d[i][0], d[i][1]);
  if (close) ctx.closePath();
};
const toUnits = (ctx, w, h) => ctx.setTransform(w / (PLATE.halfW * 2), 0, 0, h / (PLATE.halfH * 2), w / 2, h / 2);

/** Paint one layer of the plate into ctx (w × h pixels). Layer 0 is opaque: it is the ground itself. */
export function paintLayer(ctx, w, h, parts, layer) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, w, h);
  if (layer === 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); }
  toUnits(ctx, w, h);
  ctx.lineCap = ctx.lineJoin = 'round';
  for (const p of parts) {
    if (p.layer !== layer || p.limbs) continue;
    ctx.globalCompositeOperation = 'source-over';
    for (const f of p.fills) {
      // A standing part is a pillow: its whole silhouette feeds the blurred channel, which becomes its dome.
      ctx.fillStyle = `rgb(${layer > 0 ? 255 : Math.round(f.soft * 255)},${Math.round(f.crisp * 255)},0)`;
      trace(ctx, f.d, true); ctx.fill();
    }
    // Lines add to the blue channel only, so they sit on whatever relief is already there.
    ctx.globalCompositeOperation = 'lighter';
    for (const l of p.lines) {
      ctx.strokeStyle = `rgb(0,0,${Math.round(l.amp * 255)})`; ctx.lineWidth = l.w;
      trace(ctx, l.d, false); ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Which part owns each texel, per layer, grown by the part's reach so a part that moves still finds itself
 * and a solid has room for the wall around its drawing.
 * Returns interleaved (index, material) bytes per layer, plus the bare index maps used for picking.
 */
export function identMaps(doc, parts, w, h, layers, groundMat) {
  const scratch = doc.createElement('canvas'); scratch.width = w; scratch.height = h;
  const ctx = scratch.getContext('2d', {willReadFrequently: true});
  const packed = Array.from({length: layers}, (_, i) => { const a = new Uint8Array(w * h * 2); if (i === 0) for (let k = 1; k < a.length; k += 2) a[k] = groundMat; return a; });
  const maps = Array.from({length: layers}, () => new Uint8Array(w * h));
  if (!ctx) return {packed, maps};
  const sx = w / (PLATE.halfW * 2), sz = h / (PLATE.halfH * 2);
  ctx.fillStyle = ctx.strokeStyle = '#fff'; ctx.lineCap = ctx.lineJoin = 'round';
  // Two passes: first every part with its margin, then every part's drawing alone, so a margin never eats into
  // a neighbour's own shape however wide it is.
  for (const exact of [false, true]) for (const p of parts) {
    const reach = exact ? 0 : p.reach;
    if (exact && !p.reach) continue;
    const pad = reach + 2;
    const x0 = Math.max(0, Math.floor((p.bounds[0] - pad + PLATE.halfW) * sx)), z0 = Math.max(0, Math.floor((p.bounds[1] - pad + PLATE.halfH) * sz));
    const x1 = Math.min(w, Math.ceil((p.bounds[2] + pad + PLATE.halfW) * sx)), z1 = Math.min(h, Math.ceil((p.bounds[3] + pad + PLATE.halfH) * sz));
    if (x1 <= x0 || z1 <= z0) continue;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(x0, z0, x1 - x0, z1 - z0); toUnits(ctx, w, h);
    for (const f of p.fills) { trace(ctx, f.d, true); ctx.fill(); if (reach > 0) { ctx.lineWidth = reach * 2; ctx.stroke(); } }
    for (const l of p.lines) { ctx.lineWidth = l.w + reach * 2; trace(ctx, l.d, false); ctx.stroke(); }
    const data = ctx.getImageData(x0, z0, x1 - x0, z1 - z0).data, map = maps[p.layer], pack = packed[p.layer];
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) {
      if (data[((z - z0) * (x1 - x0) + (x - x0)) * 4 + 3] < 128) continue;
      const i = z * w + x; map[i] = p.index; pack[i * 2] = p.index; pack[i * 2 + 1] = p.mat;
    }
  }
  return {packed, maps};
}
