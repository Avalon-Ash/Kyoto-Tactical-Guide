// Ground ornaments that fill the bare nashiji between the landmarks (docs/MAKIE_COMPOSITION_PLAN.md C1–C4).
// The Hatsune lids leave almost no bare ground: tiny tsukegaki grasses and young pines, silver plum blossoms and
// brushwood fences fill every gap, distant hills sit flat (togidashi) under the sky, and the sky itself carries clouds.
// Depth on the flat lid comes from the gradient: near the viewer (bottom, +z) things are larger, closer and brighter;
// toward the top they shrink, thin out and fade.
//
// Channels of the ornament texture: R gold line work, G silver work, B distant hills (togidashi), A clouds.
// Everything here is plain data or Canvas 2D; the shader that colours it lives in three-pack.js.
import {PLATE, rand} from './vocab.js';

const lerp = (a, b, t) => a + (b - a) * t;
/** 0 at the far (top) edge of the lid, 1 at the near (bottom) edge. */
export const nearness = z => (z + PLATE.halfH) / (PLATE.halfH * 2);

/**
 * Distance from every texel to the nearest drawn one (chamfer 3-4), and what it says about bare ground.
 * @param {Uint8Array} drawn w*h, non-zero where something is drawn
 * @param {number} unitsPerTexel plate units per texel
 * @param {number} [gap] plate units: a texel farther than this from anything counts as visibly bare
 * @returns {{ratio: number, radius: number}} ratio of visibly bare texels, and the largest empty radius in units
 */
export function blankStats(drawn, w, h, unitsPerTexel, gap = 12) {
  const big = 1e9, d = new Float64Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = drawn[i] ? 0 : big;
  for (let z = 0; z < h; z++) for (let x = 0; x < w; x++) {
    const i = z * w + x; let v = d[i];
    if (x > 0) v = Math.min(v, d[i - 1] + 3);
    if (z > 0) { v = Math.min(v, d[i - w] + 3); if (x > 0) v = Math.min(v, d[i - w - 1] + 4); if (x < w - 1) v = Math.min(v, d[i - w + 1] + 4); }
    d[i] = v;
  }
  for (let z = h - 1; z >= 0; z--) for (let x = w - 1; x >= 0; x--) {
    const i = z * w + x; let v = d[i];
    if (x < w - 1) v = Math.min(v, d[i + 1] + 3);
    if (z < h - 1) { v = Math.min(v, d[i + w] + 3); if (x < w - 1) v = Math.min(v, d[i + w + 1] + 4); if (x > 0) v = Math.min(v, d[i + w - 1] + 4); }
    d[i] = v;
  }
  let bare = 0, far = 0;
  const limit = gap / unitsPerTexel * 3;
  for (let i = 0; i < d.length; i++) { if (d[i] > limit) bare++; if (d[i] > far) far = d[i]; }
  return {ratio: bare / d.length, radius: far >= big ? Infinity : far / 3 * unitsPerTexel};
}

/**
 * Where the small scenes go: dart throwing over the lid, spacing wide at the top and close at the bottom.
 * @param {(x: number, z: number, r: number) => boolean} free true when a disc of radius r at (x, z) is bare ground
 * @param {number} seed
 * @returns {{x: number, z: number, t: number, s: number, kind: string}[]}
 */
export function scatter(free, seed, {tries = 5000, skyTop = .2} = {}) {
  const r = rand(seed), out = [], mx = PLATE.halfW - 16, mz = PLATE.halfH - 14;
  for (let k = 0; k < tries; k++) {
    const x = (r() * 2 - 1) * mx, z = (r() * 2 - 1) * mz, t = nearness(z);
    if (t < skyTop) continue;
    const s = lerp(.8, 1.65, t), gap = lerp(58, 28, t);
    if (!free(x, z, 9 * s)) continue;
    if (out.some(o => Math.hypot(o.x - x, o.z - z) < gap * .5 + lerp(58, 28, o.t) * .5)) continue;
    const pick = r();
    const kind = pick < .42 ? 'grass' : pick < .66 ? 'pine' : pick < .88 ? 'plum' : 'fence';
    out.push({x, z, t, s, kind, seed: Math.floor(r() * 1e6)});
  }
  return out;
}

/** Clouds for the sky band: a few long, low, overlapping lobes (kasumi heads), spaced across the width. */
export function skyClouds(free, seed, {skyTop = .2} = {}) {
  const r = rand(seed + 17), out = [];
  for (let k = 0; k < 400 && out.length < 5; k++) {
    const x = (r() * 2 - 1) * (PLATE.halfW - 50), z = -PLATE.halfH + 18 + r() * (PLATE.halfH * 2 * skyTop - 6);
    if (!free(x, z, 16)) continue;
    if (out.some(o => Math.abs(o.x - x) < 120 && Math.abs(o.z - z) < 30)) continue;
    out.push({x, z, w: 46 + r() * 50, seed: Math.floor(r() * 1e6)});
  }
  return out;
}

const stroke = (ctx, pts, width) => {
  ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
};

/** One small scene at (x, z): drawn in plate units, gold strokes into R and silver into G, amplitude by nearness. */
function paintScene(ctx, o) {
  const r = rand(o.seed), a = Math.round(lerp(.42, 1, o.t) * 255), s = o.s, {x, z} = o;
  const gold = `rgb(${a},0,0)`, silver = `rgb(0,${a},0)`, w = lerp(.8, 1.35, o.t);
  if (o.kind === 'grass') {
    ctx.strokeStyle = gold;
    const blades = 4 + Math.floor(r() * 3);
    for (let i = 0; i < blades; i++) {
      const lean = (i / (blades - 1) - .5) * 1.5 + (r() - .5) * .3, len = (6 + r() * 5) * s;
      const tip = [x + Math.sin(lean) * len, z - Math.cos(lean) * len], mid = [x + Math.sin(lean) * len * .4 + lean * 1.4 * s, z - Math.cos(lean) * len * .55];
      stroke(ctx, [[x + (i - blades / 2) * .8 * s, z], mid, tip], .75 * w);
    }
    if (r() < .5) { ctx.fillStyle = silver; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(x + (r() - .5) * 8 * s, z - (5 + r() * 6) * s, 1.1 * s, 0, 6.283); ctx.fill(); } }
  } else if (o.kind === 'pine') {
    // Komatsu: a young pine pulled at the New Year (the Hatsune chapter's own motif): short stem, needle fans.
    ctx.strokeStyle = gold;
    const top = z - 13 * s;
    stroke(ctx, [[x, z], [x + 1.5 * s, z - 6 * s], [x - .5 * s, top]], 1.1 * w);
    for (const [cx, cz, rad] of [[x - .5 * s, top, 4.2], [x + 2.6 * s, z - 7.5 * s, 3.6], [x - 2.4 * s, z - 9.5 * s, 3.4]]) {
      for (let k = 0; k < 7; k++) {
        const ang = Math.PI * (1.05 + k / 6 * .9);
        stroke(ctx, [[cx, cz], [cx + Math.cos(ang) * rad * s, cz + Math.sin(ang) * rad * s]], .55 * w);
      }
    }
  } else if (o.kind === 'plum') {
    // Silver plum blossoms on a short gold twig, as on the Hatsune lids.
    ctx.strokeStyle = gold;
    const twig = [[x - 8 * s, z], [x - 2 * s, z - 4 * s], [x + 6 * s, z - 6 * s]];
    stroke(ctx, twig, .9 * w);
    ctx.fillStyle = silver;
    for (const [bx, bz] of [twig[1], twig[2], [x - 6 * s, z - 2 * s]]) {
      for (let p = 0; p < 5; p++) {
        const ang = p / 5 * 6.283 + r();
        ctx.beginPath(); ctx.arc(bx + Math.cos(ang) * 1.5 * s, bz + Math.sin(ang) * 1.5 * s, 1.15 * s, 0, 6.283); ctx.fill();
      }
    }
  } else {
    // A low brushwood fence (magaki) in silver: two rails and crossed slats.
    ctx.strokeStyle = silver;
    const half = 11 * s, hgt = 7 * s;
    stroke(ctx, [[x - half, z - hgt * .3], [x + half, z - hgt * .3]], .7 * w);
    stroke(ctx, [[x - half, z - hgt * .85], [x + half, z - hgt * .85]], .7 * w);
    for (let k = -half; k <= half; k += 3.2 * s) {
      stroke(ctx, [[x + k, z], [x + k + 2.4 * s, z - hgt]], .5 * w);
      stroke(ctx, [[x + k + 2.4 * s, z], [x + k, z - hgt]], .5 * w);
    }
  }
}

/** Two ridges of distant hills under the sky: flat togidashi into B, fading toward the foot. */
function paintDistance(ctx, seed, skyTop) {
  const r = rand(seed + 41), ph = r() * 6.283, ph2 = r() * 6.283;
  for (const [base, amp, level] of [[-PLATE.halfH + PLATE.halfH * 2 * skyTop * .7, 20, .5], [-PLATE.halfH + PLATE.halfH * 2 * skyTop * 1.25, 26, .78]]) {
    const ridge = [];
    for (let x = -PLATE.halfW; x <= PLATE.halfW; x += 6) {
      const u = x / PLATE.halfW;
      ridge.push([x, base - amp * (.55 + .45 * Math.sin(u * 3.1 + ph) * Math.sin(u * 1.7 + ph2 + level))]);
    }
    const g = ctx.createLinearGradient(0, base - amp, 0, base + 46);
    g.addColorStop(0, `rgb(0,0,${Math.round(level * 255)})`); g.addColorStop(1, 'rgb(0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ridge[0][0], ridge[0][1]);
    for (const p of ridge) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(PLATE.halfW, base + 46); ctx.lineTo(-PLATE.halfW, base + 46); ctx.closePath(); ctx.fill();
  }
}

/**
 * Paints the ornament layer and masks it off every part.
 * @param {CanvasRenderingContext2D} ctx scratch context of w × h
 * @param {Uint8Array[]} maps part-ownership maps per layer (identMaps), mw × mh
 * @returns {{data: Uint8Array, scenes: number, before: {ratio: number, radius: number}, after: {ratio: number, radius: number}}}
 */
export function bakeOrnaments(ctx, w, h, maps, mw, mh, seed, {skyTop = .2} = {}) {
  const occupied = new Uint8Array(mw * mh);
  for (const map of maps) for (let i = 0; i < map.length; i++) if (map[i]) occupied[i] = 1;
  const toTexel = (x, z) => [Math.floor((x + PLATE.halfW) / (PLATE.halfW * 2) * mw), Math.floor((z + PLATE.halfH) / (PLATE.halfH * 2) * mh)];
  const at = (x, z) => { const [tx, tz] = toTexel(x, z); return tx < 0 || tz < 0 || tx >= mw || tz >= mh || occupied[tz * mw + tx]; };
  const free = (x, z, rad) => !at(x, z) && !at(x - rad, z) && !at(x + rad, z) && !at(x, z - rad) && !at(x, z + rad);
  const unitsPerTexel = PLATE.halfW * 2 / mw;
  const before = blankStats(occupied, mw, mh, unitsPerTexel);

  // Canvas stores premultiplied colour, so nothing is encoded in alpha: every pass starts from opaque black and adds
  // opaque colour with 'lighter'. Pass 1 draws the clouds (read back from R into A), pass 2 everything else.
  const begin = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    ctx.setTransform(w / (PLATE.halfW * 2), 0, 0, h / (PLATE.halfH * 2), w / 2, h / 2);
    ctx.lineCap = ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
  };
  begin();
  ctx.fillStyle = 'rgb(140,0,0)';
  for (const c of skyClouds(free, seed, {skyTop})) {
    const r = rand(c.seed);
    for (let k = 0; k < 3; k++) {
      const ox = (k - 1) * c.w * .42 + (r() - .5) * 8, oz = (k === 1 ? -4 : 1) + (r() - .5) * 3;
      ctx.beginPath(); ctx.ellipse(c.x + ox, c.z + oz, c.w * .34, 6.5, 0, 0, 6.283); ctx.fill();
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const cloud = ctx.getImageData(0, 0, w, h).data;
  begin();
  paintDistance(ctx, seed, skyTop);
  const scenes = scatter(free, seed, {skyTop});
  for (const o of scenes) paintScene(ctx, o);
  ctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const data = new Uint8Array(ctx.getImageData(0, 0, w, h).data);
  const drawn = Uint8Array.from(occupied);
  for (let z = 0; z < h; z++) for (let x = 0; x < w; x++) {
    const i = (z * w + x) * 4, m = Math.min(mh - 1, Math.floor(z * mh / h)) * mw + Math.min(mw - 1, Math.floor(x * mw / w));
    data[i + 3] = cloud[i];
    if (occupied[m]) { data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0; continue; }
    if (data[i] > 40 || data[i + 1] > 40 || data[i + 2] > 60 || data[i + 3] > 60) drawn[m] = 1;
  }
  return {data, scenes: scenes.length, before, after: blankStats(drawn, mw, mh, unitsPerTexel)};
}
