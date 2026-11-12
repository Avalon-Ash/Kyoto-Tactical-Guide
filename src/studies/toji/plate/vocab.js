// The drawing vocabulary of a makie plate: hills, water, mist, pines, rocks and buildings in picture view.
// Pure geometry. A plate is a flat picture 720 × 460 units: x runs right, z runs down toward the viewer.
// Every builder returns parts; a part is plain data (polygons and polylines), baked into relief by bake.js.
//
// Part: {id, kind, group, order, layer, mat, reach, thick, bias, attach?, anchor:[x,z], fills:[{d, soft, crisp}], lines:[{d, w, amp}]}
//   layer 0 is the ground itself (it swells); layers 1–3 are texture slots for parts that stand up from the lid
//   thick       how far the part's relief is built out when it is awake, in units
//   bias        a small offset along the part's normal so overlapping members of one tree do not share a plane
//   attach      a part that rides on another group's plane (the bird on its pine)
//   soft  0..1  shishiai swell: blurred into a slope that sinks into the ground
//   crisp 0..1  takamaki edge: a raised plane with a defined border
//   lines       tsukegaki: fine raised line work

export const PLATE = {halfW: 360, halfH: 230};
export const MAT = {ground: 1, nashijiLight: 2, mura: 3, gyobu: 4, gold: 5, silver: 6, kirikane: 7, kirigin: 8, aogai: 9,
  hyomonGold: 10, hyomonSilver: 11, water: 12, kasumi: 13, lacquer: 14, lamp: 15};
export const KIND = {still: 0, tier: 1, pine: 2, rock: 3, hill: 4, water: 5, mist: 6, bird: 7};

/** Deterministic noise in 0..1 so a plate bakes the same on every device. */
export function rand(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const lerp = (a, b, t) => a + (b - a) * t;
const quad = (a, c, b, n = 10) => Array.from({length: n + 1}, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
});
const part = (id, kind, layer, mat, anchor, extra = {}) => ({id, kind, group: id, order: 0, layer, mat, reach: 1.5, thick: 10, bias: 0, anchor, fills: [], lines: [], ...extra});

/** An organic closed outline. */
export function blob(cx, cz, rx, rz, seed, wobble = .1, n = 44) {
  const r = rand(seed), a = r() * 6.283, b = r() * 6.283, k1 = 2 + Math.floor(r() * 3), k2 = 5 + Math.floor(r() * 3);
  return Array.from({length: n}, (_, i) => {
    const t = i / n * 6.283, s = 1 + wobble * Math.sin(t * k1 + a) + wobble * .5 * Math.sin(t * k2 + b);
    return [cx + Math.cos(t) * rx * s, cz + Math.sin(t) * rz * s];
  });
}

/** Dohā: a rounded earth bank. Its crown is firm, its foot dissolves into the ground. */
export function hill(id, x0, x1, crown, foot, seed, {amp = .7, mat = MAT.mura, layer = 0, humps = 2} = {}) {
  const r = rand(seed), top = [], n = 36;
  const ph = r() * 6.283;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = lerp(x0, x1, t), arch = Math.pow(Math.sin(Math.PI * t), .6);
    top.push([x, foot - (foot - crown) * arch * (.78 + .22 * Math.sin(t * Math.PI * humps * 2 + ph))]);
  }
  const p = part(id, KIND.hill, layer, mat, [(x0 + x1) / 2, (crown + foot) / 2]);
  p.fills.push({d: [...top, [x1, foot + 26], [x0, foot + 26]], soft: amp, crisp: 0});
  // A second, smaller swell inside gives the bank a body instead of a flat cut-out.
  p.fills.push({d: blob(lerp(x0, x1, .42 + r() * .2), lerp(crown, foot, .52), (x1 - x0) * .26, (foot - crown) * .3, seed + 5, .14), soft: Math.min(1, amp + .25), crisp: 0});
  p.lines.push({d: top.slice(3, n - 2), w: .9, amp: .5});
  return [p];
}

/** A stream: a band that widens as it nears the viewer, with togidashi flow lines inside. */
export function stream(id, points, widths, layer = 0) {
  const n = 64, centre = [], left = [], right = [];
  const at = t => {
    const f = t * (points.length - 1), i = Math.min(points.length - 2, Math.floor(f)), u = f - i;
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    // Catmull–Rom keeps the bends round.
    const c = k => .5 * (2 * p1[k] + (p2[k] - p0[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * u * u * u);
    return [c(0), c(1), lerp(widths[i], widths[i + 1], u)];
  };
  for (let i = 0; i <= n; i++) centre.push(at(i / n));
  const normal = i => {
    const a = centre[Math.max(0, i - 1)], b = centre[Math.min(n, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  };
  for (let i = 0; i <= n; i++) { const [x, z, w] = centre[i], [nx, nz] = normal(i); left.push([x + nx * w, z + nz * w]); right.push([x - nx * w, z - nz * w]); }
  const p = part(id, KIND.water, layer, MAT.water, [centre[n >> 1][0], centre[n >> 1][1]]);
  p.fills.push({d: [...left, ...right.reverse()], soft: 0, crisp: .12});
  for (const [offset, from, to] of [[-.62, 0, 1], [-.22, .08, .94], [.2, .02, .86], [.6, .12, 1], [0, .3, .7]]) {
    const line = [];
    for (let i = Math.round(from * n); i <= Math.round(to * n); i++) {
      const [x, z, w] = centre[i], [nx, nz] = normal(i), sway = Math.sin(i * .42 + offset * 9) * .12;
      line.push([x + nx * w * (offset + sway), z + nz * w * (offset + sway)]);
    }
    p.lines.push({d: line, w: .8, amp: 1});
  }
  return [p];
}

/** Suyari-gasumi: the stepped mist band of the picture scrolls. Flat; it carries powder, not height. */
export function suyari(id, x0, x1, z, thick, seed, layer = 1) {
  const r = rand(seed), bars = [], p = part(id, KIND.mist, layer, MAT.kasumi, [(x0 + x1) / 2, z], {reach: 12, thick: 0});
  const bar = (a, b, zc, h) => {
    const d = [], rad = h / 2;
    for (let i = 0; i <= 10; i++) { const t = Math.PI / 2 + i / 10 * Math.PI; d.push([a + rad + Math.cos(t) * rad, zc - Math.sin(t) * rad]); }
    for (let i = 0; i <= 10; i++) { const t = -Math.PI / 2 + i / 10 * Math.PI; d.push([b - rad + Math.cos(t) * rad, zc - Math.sin(t) * rad]); }
    return d;
  };
  const span = x1 - x0;
  bars.push(bar(x0, x1 - span * (.12 + r() * .1), z, thick));
  bars.push(bar(x0 + span * (.2 + r() * .12), x1, z + thick * .82, thick * .8));
  if (r() > .35) bars.push(bar(x0 + span * .06, x0 + span * (.5 + r() * .2), z - thick * .8, thick * .62));
  for (const d of bars) p.fills.push({d, soft: 1, crisp: 0});
  return [p];
}

/** A rock: angular, raised, with a few facet lines; cut gold sits on its lit faces (material). */
export function rock(id, cx, cz, w, h, seed, {mat = MAT.kirikane, layer = 1} = {}) {
  const r = rand(seed), n = 8, d = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * 6.283 - Math.PI * .9, k = .72 + r() * .38, lower = Math.sin(t) > 0 ? .55 : 1;
    d.push([cx + Math.cos(t) * w * k, cz + Math.sin(t) * h * k * lower]);
  }
  const p = part(id, KIND.rock, layer, mat, [cx, cz + h * .4], {thick: 20});
  p.fills.push({d, soft: .35, crisp: .7});
  p.fills.push({d: d.map(([x, z]) => [cx + (x - cx) * .55 - w * .1, cz + (z - cz) * .5 - h * .12]), soft: .5, crisp: 1});
  p.lines.push({d: [d[1], [cx - w * .1, cz - h * .1], d[5]], w: .7, amp: .8});
  p.lines.push({d: [d[3], [cx + w * .2, cz], d[6]], w: .6, amp: .6});
  return [p];
}

/**
 * A roof in elevation: eaves that lift at the corners, a concave slope, tile lines fanning to the ridge.
 * zEave is the eave line; the roof rises toward -z.
 */
function roofShape(cx, zEave, halfW, rise, ridgeHalf, upturn) {
  const left = quad([cx - halfW, zEave - upturn], [cx - halfW * .72, zEave + upturn * .25], [cx - halfW * .3, zEave], 8);
  const right = quad([cx + halfW * .3, zEave], [cx + halfW * .72, zEave + upturn * .25], [cx + halfW, zEave - upturn], 8);
  const slopeR = quad([cx + halfW, zEave - upturn], [cx + halfW * .5, zEave - rise * .38], [cx + ridgeHalf, zEave - rise], 8);
  const slopeL = quad([cx - ridgeHalf, zEave - rise], [cx - halfW * .5, zEave - rise * .38], [cx - halfW, zEave - upturn], 8);
  return {outline: [...left, ...right, ...slopeR, ...slopeL], eave: [...left, ...right], slopeL, slopeR};
}
export function roof(id, cx, zEave, halfW, rise, {ridgeHalf = halfW * .2, upturn = halfW * .09, layer = 2, group = id, order = 0, tiles = 15, mat = MAT.gold} = {}) {
  const s = roofShape(cx, zEave, halfW, rise, ridgeHalf, upturn);
  const p = part(id, KIND.tier, layer, mat, [cx, zEave], {group, order});
  p.fills.push({d: s.outline, soft: .25, crisp: .8});
  for (let i = 0; i <= tiles; i++) {
    const t = i / tiles, e = s.eave[Math.round(t * (s.eave.length - 1))];
    p.lines.push({d: [[lerp(cx - ridgeHalf, cx + ridgeHalf, t), zEave - rise + 1], [e[0], e[1] - 1.2]], w: .55, amp: .8});
  }
  p.lines.push({d: [[cx - ridgeHalf, zEave - rise], [cx + ridgeHalf, zEave - rise]], w: 1.6, amp: 1});
  // The eave edge itself: a silver lip under the gold.
  const lip = part(`${id}-lip`, KIND.tier, layer, MAT.silver, [cx, zEave], {group, order});
  lip.fills.push({d: [...s.eave, ...s.eave.map(([x, z]) => [x, z + 2.6]).reverse()], soft: 0, crisp: 1});
  return [p, lip];
}

/** A storey in elevation: black lacquer wall, gold posts, and paper windows that can hold a light. */
export function storey(id, cx, zTop, zBottom, halfW, {bays = 3, layer = 2, group = id, order = 0} = {}) {
  const wall = part(id, KIND.tier, layer, MAT.lacquer, [cx, zBottom], {group, order});
  wall.fills.push({d: [[cx - halfW, zTop], [cx + halfW, zTop], [cx + halfW, zBottom], [cx - halfW, zBottom]], soft: 0, crisp: .45});
  for (let i = 0; i <= bays; i++) { const x = lerp(cx - halfW, cx + halfW, i / bays); wall.lines.push({d: [[x, zTop], [x, zBottom]], w: 1.5, amp: 1}); }
  wall.lines.push({d: [[cx - halfW - 3, zBottom], [cx + halfW + 3, zBottom]], w: 1.3, amp: 1});
  wall.lines.push({d: [[cx - halfW - 2, lerp(zTop, zBottom, .72)], [cx + halfW + 2, lerp(zTop, zBottom, .72)]], w: .7, amp: .8});
  const lamp = part(`${id}-lamp`, KIND.tier, layer, MAT.lamp, [cx, zBottom], {group, order, thick: 6});
  const bay = halfW * 2 / bays;
  for (let i = 0; i < bays; i++) {
    const x0 = cx - halfW + bay * i + bay * .2, x1 = x0 + bay * .6, z0 = lerp(zTop, zBottom, .16), z1 = lerp(zTop, zBottom, .66);
    lamp.fills.push({d: [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], soft: 0, crisp: .3});
  }
  return [wall, lamp];
}

/** Five-storey pagoda in elevation. Each storey is its own group member so the tower can wake from the ground up. */
export function pagoda(id, cx, zBase, {storeys = 5, halfW = 66, taper = 6.5, pitch = 40, layer = 2} = {}) {
  const parts = [];
  const base = part(`${id}-base`, KIND.tier, layer, MAT.kirigin, [cx, zBase + 10], {group: id, order: 0});
  base.fills.push({d: [[cx - halfW * .95, zBase], [cx + halfW * .95, zBase], [cx + halfW * 1.04, zBase + 9], [cx - halfW * 1.04, zBase + 9]], soft: .2, crisp: .9});
  parts.push(base);
  for (let i = 0; i < storeys; i++) {
    const w = halfW - i * taper, zEave = zBase - 17 - i * pitch, group = id, order = i + 1;
    parts.push(...storey(`${id}-wall-${i}`, cx, zEave + 1, zEave + 18, w * .5, {layer, group, order}));
    parts.push(...roof(`${id}-roof-${i}`, cx, zEave, w, i === storeys - 1 ? 25 : 19, {layer, group, order, ridgeHalf: w * (i === storeys - 1 ? .05 : .46), tiles: 13 - i}));
  }
  // Sōrin: the mast and its nine rings are sheet gold, cut and laid flat.
  const top = zBase - 17 - (storeys - 1) * pitch - 25;
  const finial = part(`${id}-finial`, KIND.tier, layer, MAT.hyomonGold, [cx, top], {group: id, order: storeys + 1});
  finial.fills.push({d: [[cx - 1.1, top - 62], [cx + 1.1, top - 62], [cx + 1.4, top + 1], [cx - 1.4, top + 1]], soft: 0, crisp: 1});
  finial.fills.push({d: [[cx - 6, top - 3], [cx + 6, top - 3], [cx + 4, top + 1], [cx - 4, top + 1]], soft: 0, crisp: 1});
  for (let k = 0; k < 9; k++) { const z = top - 9 - k * 4.2, w = 6.2 - k * .42; finial.fills.push({d: [[cx - w, z - 1.1], [cx + w, z - 1.1], [cx + w, z + 1.1], [cx - w, z + 1.1]], soft: 0, crisp: 1}); }
  finial.fills.push({d: blob(cx, top - 52, 3.6, 5.4, 3, .2, 14), soft: 0, crisp: 1});
  finial.fills.push({d: blob(cx, top - 63, 1.7, 1.7, 4, 0, 10), soft: 0, crisp: 1});
  parts.push(finial);
  return parts;
}

/** A hall: one broad hipped roof over a row of bays. */
export function hall(id, cx, zEave, halfW, rise, {layer = 2, bays = 7, wallH = 24} = {}) {
  return [
    ...storey(`${id}-wall`, cx, zEave + 1, zEave + wallH, halfW * .74, {bays, layer, group: id, order: 0}),
    ...roof(`${id}-roof`, cx, zEave, halfW, rise, {layer, group: id, order: 1, ridgeHalf: halfW * .52, tiles: 23, upturn: halfW * .06}),
  ];
}

/**
 * A pine as makie draws it: a leaning trunk and flat "kasa" clusters of needles, gold and pale gold in turn.
 * The whole tree answers the wind about its foot; each cluster lags a little behind the one below.
 */
export function pine(id, x, z, height, lean, seed, {trunkLayer = 2, leafLayer = 3, clusters = 4} = {}) {
  const r = rand(seed), anchor = [x, z], spine = [], parts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; spine.push([x + lean * t * t + Math.sin(t * 5 + seed) * height * .035, z - height * t]); }
  const trunk = part(`${id}-trunk`, KIND.pine, trunkLayer, MAT.gold, anchor, {group: id, order: 0, reach: 5, thick: 9});
  const half = t => lerp(height * .045, height * .012, t);
  trunk.fills.push({d: [...spine.map(([px, pz], i) => [px - half(i / 12), pz]), ...spine.map(([px, pz], i) => [px + half(i / 12), pz]).reverse()], soft: .3, crisp: .85});
  for (let i = 2; i < 11; i += 2) trunk.lines.push({d: [[spine[i][0] - half(i / 12) * .5, spine[i][1] + 3], [spine[i + 1][0] + half(i / 12) * .4, spine[i + 1][1] - 2]], w: .6, amp: .7});
  parts.push(trunk);
  for (let k = 0; k < clusters; k++) {
    const t = .46 + k / clusters * .54, s = spine[Math.round(t * 12)], side = k % 2 ? -1 : 1;
    const w = height * lerp(.34, .2, k / clusters) * (.9 + r() * .2), h = w * .34;
    const cx = k === clusters - 1 ? s[0] : s[0] + side * w * (.55 + r() * .25), cz = s[1] - h * .2;
    const leaf = part(`${id}-leaf-${k}`, KIND.pine, leafLayer, k % 2 ? MAT.nashijiLight : MAT.gold, anchor, {group: id, order: k + 1, reach: 6, thick: 9, bias: 3 + k * .6});
    // The kasa: a low dome with a nearly flat underside.
    const dome = [];
    for (let i = 0; i <= 22; i++) { const a = Math.PI + i / 22 * Math.PI, bump = 1 + .07 * Math.sin(i * 1.9 + k); dome.push([cx + Math.cos(a) * w * bump, cz + Math.sin(a) * h * 2 * bump]); }
    dome.push([cx + w * .82, cz + h * .16], [cx, cz + h * .3], [cx - w * .82, cz + h * .16]);
    leaf.fills.push({d: dome, soft: .45, crisp: .6});
    for (let i = 1; i < 16; i++) { const a = Math.PI + i / 16 * Math.PI; leaf.lines.push({d: [[cx + Math.cos(a) * w * .16, cz + h * .1], [cx + Math.cos(a) * w * .94, cz + Math.sin(a) * h * 1.86]], w: .5, amp: .9}); }
    // The bough that carries it.
    trunk.lines.push({d: [s, [lerp(s[0], cx, .6), lerp(s[1], cz, .3) + h * .3], [cx, cz + h * .28]], w: 1.5, amp: 1});
    parts.push(leaf);
  }
  return parts;
}

/** Uguisu, the first song of the year: a small bird of cut silver. It rests at one perch at a time. */
export function bird(id, perches, layer = 3) {
  return perches.map(([x, z, flip = 1, attach], i) => {
    const p = part(`${id}-${i}`, KIND.bird, layer, MAT.hyomonSilver, [x, z], {group: id, order: i, reach: 2, thick: 4, bias: 13, attach});
    const f = (dx, dz) => [x + dx * flip, z + dz];
    p.fills.push({d: blob(x, z - 3.4, 5.6, 3.3, 9, .04, 18), soft: 0, crisp: 1});                       // body
    p.fills.push({d: blob(x + 5 * flip, z - 6.4, 2.5, 2.3, 4, 0, 12), soft: 0, crisp: 1});             // head
    p.fills.push({d: [f(7, -6.8), f(10.4, -6.1), f(7, -5.5)], soft: 0, crisp: 1});                     // bill
    p.fills.push({d: [f(-4, -4.4), f(-13.5, -1.2), f(-12.6, .9), f(-3.4, -1.6)], soft: 0, crisp: 1});  // tail
    p.lines.push({d: [f(-1, -4.4), f(-5.6, -2.5)], w: .5, amp: 1}, {d: [f(.6, 0), f(.6, 2.6)], w: .5, amp: 1}, {d: [f(2.4, 0), f(2.4, 2.6)], w: .5, amp: 1});
    return p;
  });
}

/** A few petals of shell, used sparingly. */
export function shell(id, spots, layer = 0) {
  const p = part(id, KIND.still, layer, MAT.aogai, spots[0].slice(0, 2));
  for (const [x, z, s, seed] of spots) p.fills.push({d: blob(x, z, s, s * .62, seed, .16, 12), soft: 0, crisp: .5});
  return [p];
}
