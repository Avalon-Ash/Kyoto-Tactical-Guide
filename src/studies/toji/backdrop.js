// Backdrop behind the bunko: washi paper plus suyari-gasumi (stepped gold/silver mist bands) that drift very slowly.
// Paper and band sprites are baked with Canvas 2D on resize or day/night change only; the drift is a compositor
// transform (Web Animations), so no script runs per frame.
import {project} from './geometry.js';
import {MOTIFS, WARD_ART, wardSeed} from './ward-art.js';

/**
 * World-space vertices whose projection is the convex silhouette of every cabinet (all eleven reliefs and the plain box)
 * under the fixed home camera. The camera is orthographic with a fixed direction, so this hull holds at any aspect.
 * Regenerate if geometry or the camera eye changes; scripts/ui-renewal.test.mjs checks every mesh vertex against it.
 */
export const CABINET_SILHOUETTE = [
  [-371.3, .6, 240], [-370, -32, 240], [-360, -88, 230], [360, -88, 230], [360, -88, -230], [370, -32, -240],
  [371.3, .6, -240], [370.9, 1.5, -240], [370, 1.5, -240.9], [163, 138.7, -114.9], [72, 241, 23.4],
  [-163, 138.7, -114.9], [-370, 1.5, -240.9], [-370.9, 1.5, -240], [-370.9, 1.5, 240],
];
export const BACKDROP_DPR_MAX = 1.5;
/** Share of the silhouette width, centred, that mist may never pass behind (the bands may tuck behind the box ends). */
export const CENTRE_SHARE = .5;

/** Deterministic PRNG so the composition stays identical across reloads and cabinet switches. */
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cabinet silhouette in CSS px under `matrix` (the camera matrix render() uses), as a convex polygon.
 * @param {Float32Array|number[]} matrix
 * @returns {[number, number][]}
 */
export function cabinetKeepout(matrix, width, height) {
  return CABINET_SILHOUETTE.map(p => {
    const [nx, ny] = project(matrix, p);
    return [(nx + 1) / 2 * width, (1 - ny) / 2 * height];
  });
}

/** Central zone behind the cabinet that mist must leave clear: the middle CENTRE_SHARE of the silhouette's width. */
export function centreZone(keep) {
  const xs = keep.map(p => p[0]), ys = keep.map(p => p[1]);
  const left = Math.min(...xs), right = Math.max(...xs), half = (right - left) * CENTRE_SHARE / 2, cx = (left + right) / 2;
  return {left: cx - half, right: cx + half, top: Math.min(...ys), bottom: Math.max(...ys)};
}

/**
 * Horizontal extent of a convex polygon over the rows [y0, y1]; null when the rows miss it.
 * @param {[number, number][]} poly
 */
export function spanX(poly, y0, y1) {
  let min = Infinity, max = -Infinity;
  const take = x => { min = Math.min(min, x); max = Math.max(max, x); };
  poly.forEach(([x, y], i) => {
    if (y >= y0 && y <= y1) take(x);
    const [X, Y] = poly[(i + 1) % poly.length];
    for (const edge of [y0, y1]) if ((y - edge) * (Y - edge) < 0) take(x + (X - x) * (edge - y) / (Y - y));
  });
  return min <= max ? {min, max} : null;
}

export const bandMargin = height => Math.max(10, height * .02);
export const bandHeight = (height, width = Infinity) => Math.max(24, Math.min(66, height * .085, width * .12));
export const MAX_BANDS = 5;
export const driftAmplitude = width => Math.max(24, Math.min(60, width * .08));

/**
 * Up to MAX_BANDS mist bands entering alternately from the left and right edges at staggered heights.
 * A band may tuck behind the ends of the cabinet but, even at the far end of its drift, never reaches the centre zone;
 * it must also show at least 2.5 band-heights of itself beside the cabinet, and is always cropped by its own edge.
 * @param {number} width
 * @param {number} height
 * @param {[number, number][]} keep cabinet silhouette from cabinetKeepout()
 * @param {number} [seed]
 * @returns {{x0:number, x1:number, y:number, h:number, side:-1|1, drift:number, seed:number}[]}
 */
export function layoutBands(width, height, keep, seed = 7) {
  const rand = random(seed), h = bandHeight(height, width), margin = bandMargin(height), drift = driftAmplitude(width);
  const zone = centreZone(keep), bands = [];
  // The top row enters from the right so the seal (top-left) and caption (bottom-left) stay clear.
  const rows = [[.07, 1], [.2, -1], [.34, 1], [.56, -1], [.74, 1], [.9, 1]];
  for (const [share, side] of rows) {
    const y = Math.max(h / 2, Math.min(height - h / 2, height * (share + (rand() - .5) * .06)));
    const top = y - h / 2, bottom = y + h / 2, overshoot = width * .1 + drift;
    const reach = width * (.42 + rand() * .2);
    let x0 = side < 0 ? -overshoot : width - reach, x1 = side < 0 ? reach : width + overshoot;
    const hitsZone = bottom > zone.top - margin && top < zone.bottom + margin;
    if (hitsZone) {
      if (side < 0) x1 = Math.min(x1, zone.left - margin - drift);
      else x0 = Math.max(x0, zone.right + margin + drift);
    }
    const body = spanX(keep, top, bottom);
    const visible = !body ? reach : side < 0 ? Math.min(x1, body.min) : width - Math.max(x0, body.max);
    const clear = bands.every(b => Math.abs(b.y - y) >= (b.h + h) / 2 + margin || b.x1 + b.drift < x0 - drift || x1 + drift < b.x0 - b.drift);
    if (bands.length < MAX_BANDS && x1 - x0 >= h * 3 && visible >= h * 2.5 && clear) bands.push({x0, x1, y, h, side, drift, seed: Math.floor(rand() * 1e9)});
  }
  return bands;
}

/**
 * Stadium segments whose union is one suyari-gasumi band: a main run plus one or two shorter tiers above or below it,
 * which gives the stepped outline and several rounded ends of painted mist.
 * Coordinates are relative to the band's own box (0..x1-x0, 0..h).
 */
export function bandSegments(band) {
  const rand = random(band.seed ^ 0x2545f491), length = band.x1 - band.x0, h = band.h;
  const main = h * (.5 + rand() * .1), up = rand() < .5;
  const mainY = up ? h - main / 2 - h * .04 : main / 2 + h * .04;
  const segments = [{x0: 0, x1: length, cy: mainY, h: main}];
  const inner = band.side < 0 ? length : 0;
  const tiers = rand() < .55 ? 2 : 1;
  for (let i = 0; i < tiers; i++) {
    const tier = h * (.34 + rand() * .14), len = length * (.28 + rand() * .32);
    const start = band.side < 0 ? inner - len - length * rand() * .18 - (i ? length * .25 : 0) : inner + length * rand() * .18 + (i ? length * .25 : 0);
    const cy = up ? tier / 2 + h * .02 + i * h * .06 : h - tier / 2 - h * .02 - i * h * .06;
    const seg = {x0: Math.max(0, start), x1: Math.min(length, start + len), cy, h: tier};
    if (seg.x1 - seg.x0 >= tier * 2) segments.push(seg);
  }
  return segments;
}

/**
 * Floating motes: by day, kirikane flakes that tumble down and glint as they turn; by moonlight, silver dust rising.
 * Pure data so tests can check counts, ranges and direction; mountBackdrop turns each into a small animated element.
 * @returns {{x:number, y:number, size:number, travel:number, sway:number, spin:number, duration:number, delay:number, peak:number}[]}
 */
export function particleSpecs(width, height, night, seed = 7) {
  const rand = random(seed ^ (night ? 0x6a09e667 : 0xbb67ae85));
  const count = Math.round(Math.max(16, Math.min(32, width * height / 16000)));
  return Array.from({length: count}, () => {
    const duration = 14000 + rand() * 14000;
    return {
      x: rand() * width,
      // Day flakes start in the upper part and fall; night dust starts low and rises.
      y: night ? height * (.45 + rand() * .6) : height * (-.1 + rand() * .5),
      size: night ? 2 + rand() * 3 : 2.6 + rand() * 3.4,
      travel: (night ? -1 : 1) * height * (.35 + rand() * .45),
      sway: (rand() - .5) * 70,
      spin: night ? 0 : (rand() < .5 ? -1 : 1) * (180 + rand() * 360),
      duration,
      delay: -rand() * duration,
      peak: night ? .5 + rand() * .4 : .65 + rand() * .3,
    };
  });
}

/** Palette per theme. Gold mud by day, silver by moonlight; night stays the more transparent of the two. */
export const BACKDROP_PALETTE = {
  day: {
    paper: ['#efe6d2', '#dfcfb0', '#cbb894'], vignette: 'rgba(92,70,40,.16)',
    fiberLight: 'rgba(255,251,242,.16)', fiberDark: 'rgba(122,96,58,.06)', grain: .05,
    fill: '#d9b46a', fillDeep: '#b88c45', edge: '#8e6a2e', alpha: .58,
    poolLight: 'rgba(255,238,190,.35)', poolDark: 'rgba(140,100,40,.28)', dust: 'rgba(164,120,46,', dustAlpha: .55,
    motifInk: '#8a6428', motif: .2,
  },
  night: {
    paper: ['#474844', '#33393e', '#262d33'], vignette: 'rgba(8,12,16,.32)',
    fiberLight: 'rgba(214,220,224,.045)', fiberDark: 'rgba(8,12,16,.1)', grain: .045,
    fill: '#b9c4c8', fillDeep: '#8e9aa0', edge: '#d8e0e2', alpha: .3,
    poolLight: 'rgba(236,242,244,.3)', poolDark: 'rgba(40,48,54,.3)', dust: 'rgba(214,220,222,', dustAlpha: .4,
    motifInk: '#c9d3d6', motif: .13,
  },
};

/**
 * Mounts the backdrop as the first child of `host` (the .stage): one paper canvas and one sprite canvas per band.
 * @param {HTMLElement} host
 * @param {{night:boolean, motion:boolean, wardId?:string}} options
 */
export function mountBackdrop(host, options) {
  const doc = host.ownerDocument;
  const layer = doc.createElement('div');
  layer.className = 'backdrop';
  layer.setAttribute('aria-hidden', 'true');
  host.prepend(layer);
  const paper = doc.createElement('canvas');
  layer.append(paper);
  let night = options.night, motion = options.motion, wardId = options.wardId, size = null, grainTile = null, sprites = [];
  // Paper fibres and grain are the same sheet everywhere; pattern, mist and motes belong to the ward.
  const seed = 7;
  const context = canvas => { try { return canvas.getContext('2d'); } catch { return null; } };

  function clearSprites() { for (const s of sprites) { s.animation?.cancel(); s.canvas.remove(); } sprites = []; }
  function draw() {
    if (!size) return;
    const {width, height, dpr, keep} = size, p = BACKDROP_PALETTE[night ? 'night' : 'day'];
    const ctx = context(paper);
    clearSprites();
    if (!ctx) return;
    paper.width = Math.max(1, Math.round(width * dpr)); paper.height = Math.max(1, Math.round(height * dpr));
    paper.style.width = `${width}px`; paper.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintPaper(ctx, width, height, keep, p, seed);
    paintMotif(doc, ctx, width, height, dpr, keep, p, WARD_ART[wardId]?.motif);
    const placed = wardSeed(wardId);
    grainTile ??= makeGrain(doc, seed);
    const pattern = grainTile && ctx.createPattern(grainTile, 'repeat');
    if (pattern) { ctx.globalAlpha = p.grain; ctx.fillStyle = pattern; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1; }
    for (const band of layoutBands(width, height, keep, placed)) {
      const canvas = paintBand(doc, band, p, dpr);
      if (!canvas) continue;
      layer.append(canvas);
      sprites.push({canvas, band, animation: null});
    }
    for (const spec of particleSpecs(width, height, night, placed)) {
      const mote = doc.createElement('span');
      mote.className = night ? 'mote mote-night' : 'mote mote-day';
      Object.assign(mote.style, {left: `${spec.x}px`, top: `${spec.y}px`, width: `${spec.size}px`, height: `${spec.size}px`});
      layer.append(mote);
      sprites.push({canvas: mote, band: null, spec, animation: null});
    }
    layer.dataset.bands = String(sprites.filter(s => s.band).length);
    layer.dataset.motes = String(sprites.filter(s => s.spec).length);
    layer.dataset.theme = night ? 'night' : 'day';
    layer.dataset.motif = WARD_ART[wardId]?.motif ?? '';
    animate();
  }
  function animate() {
    for (const [i, s] of sprites.entries()) {
      if (typeof s.canvas.animate !== 'function') continue;
      if (s.spec) {
        const {travel, sway, spin, duration, delay, peak} = s.spec;
        // rotateY makes a flake narrow to an edge and widen again, which reads as a glint of gold leaf.
        const turn = t => spin ? ` rotate(${spin * t}deg) rotateY(${spin * 2 * t}deg)` : '';
        s.animation = s.canvas.animate([
          {transform: `translate(0,0)${turn(0)}`, opacity: 0},
          {transform: `translate(${sway * .4}px,${travel * .15}px)${turn(.15)}`, opacity: peak, offset: .15},
          {transform: `translate(${-sway * .3}px,${travel * .6}px)${turn(.6)}`, opacity: peak * .85, offset: .6},
          {transform: `translate(${sway}px,${travel}px)${turn(1)}`, opacity: 0},
        ], {duration, delay, iterations: Infinity, easing: 'linear'});
        continue;
      }
      // Each band breathes sideways on its own period (24–36 s per sweep), out of phase with its neighbours.
      const rand = random(s.band.seed ^ 0x51ed27), period = 24000 + rand() * 12000, d = s.band.drift * s.band.side;
      s.animation = s.canvas.animate(
        [{transform: `translateX(${-d}px)`}, {transform: `translateX(${d}px)`}],
        {duration: period, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', delay: -period * (i * .37 + rand() * .3)},
      );
    }
    applyMotion();
  }
  // Pause rather than cancel, so a cabinet switch or a closed book resumes the drift where it stopped instead of jumping.
  function applyMotion() {
    for (const s of sprites) if (s.animation) motion ? s.animation.play() : s.animation.pause();
    // At rest the motes would freeze mid-fade at random; reduced motion hides them and keeps only paper and mist.
    layer.dataset.still = String(!motion);
    layer.dataset.motion = String(motion && sprites.some(s => s.animation));
  }

  return {
    element: layer,
    /** Re-bake only when the stage size changes. */
    resize(width, height, dpr, keep) {
      const ratio = Math.min(dpr || 1, BACKDROP_DPR_MAX);
      if (size && size.width === width && size.height === height && size.dpr === ratio) return;
      size = {width, height, dpr: ratio, keep};
      draw();
    },
    setNight(next) { if (next !== night) { night = next; draw(); } },
    /** Another cabinet: re-bake its pattern and mist, and let the new sheet breathe in rather than pop. */
    setWard(next) {
      if (next === wardId) return;
      wardId = next; draw();
      if (motion && size && typeof layer.animate === 'function') layer.animate([{opacity: .35}, {opacity: 1}], {duration: 420, easing: 'ease-out'});
    },
    /** Drift only while the cabinet is closed and motion is allowed; reduced motion keeps every band at rest. */
    setMotion(next) { if (next !== motion) { motion = next; applyMotion(); } },
    /** Paper and bands at rest, for the "save image" export. */
    compose(ctx, width, height) {
      if (!size) return;
      ctx.drawImage(paper, 0, 0, width, height);
      const scale = width / size.width;
      for (const s of sprites.filter(s => s.band)) ctx.drawImage(s.canvas, s.canvas.offsetLeft * scale, s.canvas.offsetTop * scale, s.canvas.width / size.dpr * scale, s.canvas.height / size.dpr * scale);
    },
    destroy() { clearSprites(); paper.width = paper.height = 0; layer.remove(); grainTile = null; size = null; },
  };
}

function paintPaper(ctx, width, height, keep, p, seed) {
  // Light falls on the cabinet: the paper is brightest behind it and sinks toward the corners.
  const zone = centreZone(keep), cx = (zone.left + zone.right) / 2, cy = (zone.top + zone.bottom) / 2;
  const reach = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
  const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
  base.addColorStop(0, p.paper[0]); base.addColorStop(.62, p.paper[1]); base.addColorStop(1, p.paper[2]);
  ctx.fillStyle = base; ctx.fillRect(0, 0, width, height);
  const corners = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * .35, width / 2, height / 2, Math.hypot(width, height) * .62);
  corners.addColorStop(0, 'rgba(0,0,0,0)'); corners.addColorStop(1, p.vignette);
  ctx.fillStyle = corners; ctx.fillRect(0, 0, width, height);
  // Kozo fibres: short, slightly curved strands, visible only up close.
  const rand = random(seed ^ 0x5f3759df), count = Math.round(width * height / 700);
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = rand() * width, y = rand() * height, len = 5 + rand() * 24, angle = rand() * Math.PI;
    const dx = Math.cos(angle) * len, dy = Math.sin(angle) * len, bend = (rand() - .5) * len * .5;
    ctx.strokeStyle = rand() < .62 ? p.fiberLight : p.fiberDark;
    ctx.lineWidth = .35 + rand() * .6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + dx / 2 - dy / len * bend, y + dy / 2 + dx / len * bend, x + dx, y + dy); ctx.stroke();
  }
}

/**
 * The ward's ground pattern, woven into the paper: absent behind the cabinet, rising toward the edges of the sheet.
 * Baked once per draw; nothing here runs per frame.
 */
function paintMotif(doc, ctx, width, height, dpr, keep, p, name) {
  const tile = name && MOTIFS[name]?.();
  if (!tile) return;
  const sheet = doc.createElement('canvas'), stamp = doc.createElement('canvas');
  let s = null, t = null;
  try { s = sheet.getContext('2d'); t = stamp.getContext('2d'); } catch { return; }
  if (!s || !t) return;
  const cell = Math.max(26, Math.min(38, width * .08)) * tile.cell * dpr;
  stamp.width = Math.max(8, Math.round(cell)); stamp.height = Math.max(8, Math.round(stamp.width * tile.h / tile.w));
  const sx = stamp.width / tile.w, sy = stamp.height / tile.h, at = ([x, y]) => [x * sx, y * sy];
  t.strokeStyle = t.fillStyle = p.motifInk; t.lineWidth = dpr; t.lineJoin = t.lineCap = 'round';
  for (const line of tile.lines ?? []) { t.beginPath(); line.forEach((point, i) => (i ? t.lineTo(...at(point)) : t.moveTo(...at(point)))); t.stroke(); }
  for (const [cx, cy, r] of tile.circles ?? []) { t.beginPath(); t.ellipse(cx * sx, cy * sy, r * sx, r * sy, 0, 0, Math.PI * 2); t.stroke(); }
  t.globalAlpha = .45;
  for (const shape of tile.fills ?? []) { t.beginPath(); shape.forEach((point, i) => (i ? t.lineTo(...at(point)) : t.moveTo(...at(point)))); t.closePath(); t.fill(); }
  sheet.width = Math.max(1, Math.round(width * dpr)); sheet.height = Math.max(1, Math.round(height * dpr));
  const pattern = s.createPattern(stamp, 'repeat');
  if (!pattern) return;
  s.fillStyle = pattern; s.fillRect(0, 0, sheet.width, sheet.height);
  // Keep the pattern off the cabinet: clear in the middle, full strength only near the corners.
  const zone = centreZone(keep), cx = (zone.left + zone.right) / 2 * dpr, cy = (zone.top + zone.bottom) / 2 * dpr;
  const inner = Math.max(zone.right - zone.left, zone.bottom - zone.top) * .8 * dpr;
  const reach = Math.hypot(Math.max(cx, sheet.width - cx), Math.max(cy, sheet.height - cy));
  const mask = s.createRadialGradient(cx, cy, Math.min(inner, reach * .5), cx, cy, reach);
  mask.addColorStop(0, 'rgba(0,0,0,0)'); mask.addColorStop(.45, 'rgba(0,0,0,.55)'); mask.addColorStop(1, 'rgba(0,0,0,1)');
  s.globalCompositeOperation = 'destination-in'; s.fillStyle = mask; s.fillRect(0, 0, sheet.width, sheet.height);
  ctx.globalAlpha = p.motif; ctx.drawImage(sheet, 0, 0, width, height); ctx.globalAlpha = 1;
  sheet.width = sheet.height = stamp.width = stamp.height = 0;
}

function makeGrain(doc, seed) {
  const tile = doc.createElement('canvas'); tile.width = tile.height = 128;
  let g = null; try { g = tile.getContext('2d'); } catch { g = null; }
  if (!g) return null;
  const image = g.createImageData(128, 128), rand = random(seed ^ 0x9e3779b9);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = rand() < .5 ? 0 : 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v; image.data[i + 3] = Math.round(rand() * 255);
  }
  g.putImageData(image, 0, 0);
  return tile;
}

/** Wobbly stadium path: hand-painted edges, ends slightly flattened or swollen. */
function stadium(path, seg, rand) {
  const r = seg.h / 2, left = seg.x0 + r, right = Math.max(left + 1, seg.x1 - r);
  const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const wobble = (x, k) => Math.sin(x / 57 + ph[k]) * seg.h * .04 + Math.sin(x / 19 + ph[k + 1]) * seg.h * .018;
  const steps = Math.max(6, Math.ceil((right - left) / 9));
  for (let i = 0; i <= steps; i++) { const x = left + (right - left) * i / steps, y = seg.cy - r + wobble(x, 0); i ? path.lineTo(x, y) : path.moveTo(x, y); }
  path.ellipse(right, seg.cy, r * (.9 + rand() * .35), r, 0, -Math.PI / 2, Math.PI / 2);
  for (let i = steps; i >= 0; i--) { const x = left + (right - left) * i / steps; path.lineTo(x, seg.cy + r + wobble(x, 2)); }
  path.ellipse(left, seg.cy, r * (.9 + rand() * .35), r, 0, Math.PI / 2, Math.PI * 1.5);
  path.closePath();
}

/**
 * One band as its own sprite canvas, positioned in the layer. The union of its segments is painted opaque first
 * (outline under fill, so only the outer edge survives), then laid onto the sprite at the theme alpha; gold dust goes on top.
 */
function paintBand(doc, band, p, dpr) {
  const rand = random(band.seed), pad = Math.ceil(band.h * .9), length = band.x1 - band.x0;
  const w = Math.ceil(length + pad * 2), h = Math.ceil(band.h + pad * 2);
  const shape = doc.createElement('canvas'), sprite = doc.createElement('canvas');
  shape.width = sprite.width = Math.max(1, Math.round(w * dpr)); shape.height = sprite.height = Math.max(1, Math.round(h * dpr));
  let s = null, out = null;
  try { s = shape.getContext('2d'); out = sprite.getContext('2d'); } catch { return null; }
  if (!s || !out || typeof Path2D === 'undefined') return null;
  s.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * dpr); out.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * dpr);
  const union = new Path2D(), segments = bandSegments(band);
  for (const seg of segments) { const one = new Path2D(); stadium(one, seg, rand); union.addPath(one); s.lineWidth = 2.2; s.strokeStyle = p.edge; s.stroke(one); }
  const fill = s.createLinearGradient(0, 0, 0, band.h);
  fill.addColorStop(0, p.fillDeep); fill.addColorStop(.4, p.fill); fill.addColorStop(1, p.fillDeep);
  s.fillStyle = fill; s.fill(union);
  // Kindei is never even: pools where the mud gathered, then short brush marks along the band.
  s.save(); s.clip(union);
  for (let i = 0, pools = Math.max(3, Math.round(length / 45)); i < pools; i++) {
    const px = rand() * length, py = rand() * band.h, rx = band.h * (.6 + rand() * 1.4);
    const pool = s.createRadialGradient(px, py, 0, px, py, rx);
    pool.addColorStop(0, rand() < .55 ? p.poolLight : p.poolDark); pool.addColorStop(1, 'rgba(0,0,0,0)');
    s.fillStyle = pool; s.fillRect(px - rx, py - rx, rx * 2, rx * 2);
  }
  s.lineCap = 'round';
  for (let i = 0, strokes = Math.round(length / 12); i < strokes; i++) {
    const sx = rand() * length, sy = rand() * band.h, len = 14 + rand() * 46;
    s.strokeStyle = rand() < .5 ? p.poolLight : p.poolDark; s.lineWidth = .5 + rand() * .9;
    s.beginPath(); s.moveTo(sx, sy); s.bezierCurveTo(sx + len * .33, sy + (rand() - .5) * 2, sx + len * .66, sy + (rand() - .5) * 2, sx + len, sy + (rand() - .5) * 1.4); s.stroke();
  }
  s.restore();
  out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = p.alpha; out.drawImage(shape, 0, 0); out.globalAlpha = 1;
  out.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * dpr);
  // Sunago: dust thickest along the band edges, thinning into the paper; a few kirikane squares.
  for (let i = 0, dust = Math.round(length / 2.2); i < dust; i++) {
    const seg = segments[Math.floor(rand() * segments.length)], x = seg.x0 + rand() * (seg.x1 - seg.x0);
    const side = rand() < .5 ? -1 : 1, spread = Math.pow(rand(), 2.4) * band.h * .8, size = .5 + rand() * 1.2;
    out.fillStyle = `${p.dust}${(p.dustAlpha * (1 - spread / band.h)).toFixed(3)})`;
    out.fillRect(x, seg.cy + side * (seg.h * .42 + spread), size, size);
  }
  for (let i = 0, cut = Math.round(length / 70); i < cut; i++) {
    const x = rand() * length, y = rand() * band.h, k = 1.6 + rand() * 2.2;
    out.save(); out.translate(x, y); out.rotate(rand() * Math.PI / 2);
    out.fillStyle = `${p.dust}${(p.dustAlpha * .9).toFixed(3)})`; out.fillRect(-k / 2, -k / 2, k, k); out.restore();
  }
  shape.width = shape.height = 0;
  sprite.style.width = `${w}px`; sprite.style.height = `${h}px`;
  sprite.style.left = `${band.x0 - pad}px`; sprite.style.top = `${band.y - band.h / 2 - pad}px`;
  return sprite;
}
