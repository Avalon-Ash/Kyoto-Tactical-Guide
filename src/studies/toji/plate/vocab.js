// The drawing vocabulary of a makie plate: hills, water, mist, trees, rocks, buildings and gates in picture view.
// Pure geometry. A plate is a flat picture 720 × 460 units: x runs right, z runs down toward the viewer.
// Every builder returns parts; a part is plain data (polygons and polylines), baked into relief by bake.js.
//
// Part: {id, kind, group, order, layer, mat, reach, thick, bias, attach?, anchor:[x,z], fills:[{d, soft, crisp}], lines:[{d, w, amp}]}
//   layer 0 is the ground itself (it swells); layers 1–3 are texture slots for parts that stand up from the lid
//   thick       how far the part's body stands off its own plane when it is awake, in units
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
const part = (id, kind, layer, mat, anchor, extra = {}) => ({id, kind, group: id, order: 0, layer, mat, reach: 4, thick: 24, bias: 0, anchor, fills: [], lines: [], ...extra});

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
  const p = part(id, KIND.rock, layer, mat, [cx, cz + h * .4], {thick: 30});
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
export function storey(id, cx, zTop, zBottom, halfW, {bays = 3, layer = 2, group = id, order = 0, mat = MAT.lacquer, windowMat = MAT.lamp} = {}) {
  const wall = part(id, KIND.tier, layer, mat, [cx, zBottom], {group, order});
  wall.fills.push({d: [[cx - halfW, zTop], [cx + halfW, zTop], [cx + halfW, zBottom], [cx - halfW, zBottom]], soft: 0, crisp: .45});
  for (let i = 0; i <= bays; i++) { const x = lerp(cx - halfW, cx + halfW, i / bays); wall.lines.push({d: [[x, zTop], [x, zBottom]], w: 1.5, amp: 1}); }
  wall.lines.push({d: [[cx - halfW - 3, zBottom], [cx + halfW + 3, zBottom]], w: 1.3, amp: 1});
  wall.lines.push({d: [[cx - halfW - 2, lerp(zTop, zBottom, .72)], [cx + halfW + 2, lerp(zTop, zBottom, .72)]], w: .7, amp: .8});
  const lamp = part(`${id}-lamp`, KIND.tier, layer, windowMat, [cx, zBottom], {group, order, thick: 15});
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

/** A hall: one broad hipped roof over a row of bays. Give it a group to make it one solid with what carries it. */
export function hall(id, cx, zEave, halfW, rise, {layer = 2, bays = 7, wallH = 24, group = id, order = 0} = {}) {
  return [
    ...storey(`${id}-wall`, cx, zEave + 1, zEave + wallH, halfW * .74, {bays, layer, group, order}),
    ...roof(`${id}-roof`, cx, zEave, halfW, rise, {layer, group, order: order + 1, ridgeHalf: halfW * .52, tiles: 23, upturn: halfW * .06}),
  ];
}

/** A railing in elevation, added to a part: a top bar on balusters standing on zFloor. */
function railing(p, x0, x1, zFloor, height, gap) {
  p.fills.push({d: [[x0, zFloor - height], [x1, zFloor - height], [x1, zFloor - height + 2.2], [x0, zFloor - height + 2.2]], soft: 0, crisp: 1});
  const n = Math.max(2, Math.round((x1 - x0) / gap));
  for (let i = 0; i <= n; i++) { const x = lerp(x0 + 1, x1 - 1, i / n); p.fills.push({d: [[x - 1, zFloor - height], [x + 1, zFloor - height], [x + 1, zFloor], [x - 1, zFloor]], soft: 0, crisp: 1}); }
}

/**
 * Rōmon: a two-storey gate. A lower storey of three bays, a railed balcony round its waist, a shorter upper storey
 * and one hipped roof. It wakes from the ground up, like a tower.
 */
export function romon(id, cx, zBase, halfW, {layer = 2} = {}) {
  const group = id, waist = zBase - halfW * .5, zEave = waist - 6 - halfW * .3;
  const balcony = part(`${id}-balcony`, KIND.tier, layer, MAT.kirigin, [cx, waist], {group, order: 1});
  balcony.fills.push({d: [[cx - halfW * .92, waist - 6], [cx + halfW * .92, waist - 6], [cx + halfW * .86, waist + 1.5], [cx - halfW * .86, waist + 1.5]], soft: .2, crisp: .9});
  railing(balcony, cx - halfW * .92, cx + halfW * .92, waist - 6, 8, halfW * .2);
  return [
    ...storey(`${id}-lower`, cx, waist, zBase, halfW * .78, {bays: 3, layer, group, order: 0}),
    ...storey(`${id}-upper`, cx, zEave + 1, waist - 6, halfW * .66, {bays: 3, layer, group, order: 2}),
    balcony,
    ...roof(`${id}-roof`, cx, zEave, halfW, halfW * .46, {layer, group, order: 3, ridgeHalf: halfW * .5, tiles: 19, upturn: halfW * .07}),
  ];
}

/**
 * Myōjin torii in elevation: two posts leaning together on stone feet, a tie beam through them, a strut, and a
 * lintel that lifts at both ends. `s` scales the whole gate (1 is about 116 wide and 104 tall).
 * With `cap` the lintel carries a silver lip, as the roofs do.
 */
export function torii(id, cx, zFoot, s = 1, {layer = 2, group = id, order = 0, mat = MAT.gold, cap = false} = {}) {
  const P = (dx, h) => [cx + dx * s, zFoot - h * s];
  const thick = Math.max(12, Math.min(24, 6 + 18 * s));
  const p = part(id, KIND.tier, layer, mat, [cx, zFoot], {group, order, thick});
  for (const side of [-1, 1]) {
    p.fills.push({d: [P(side * 36 - 4.4, 0), P(side * 36 + 4.4, 0), P(side * 32 + 3.8, 90), P(side * 32 - 3.8, 90)], soft: .3, crisp: .85});
    p.fills.push({d: [P(side * 36 - 7.5, 0), P(side * 36 + 7.5, 0), P(side * 36 + 5.8, 7), P(side * 36 - 5.8, 7)], soft: .2, crisp: 1});
  }
  p.fills.push({d: [P(-47, 53), P(47, 53), P(47, 60), P(-47, 60)], soft: .2, crisp: .8});
  // The strut would close a small gate's slot into two holes; only a gate large enough to show it carries one.
  if (s >= 1) p.fills.push({d: [P(-3.6, 60), P(3.6, 60), P(3.6, 90), P(-3.6, 90)], soft: .2, crisp: 1});
  p.fills.push({d: [...quad(P(-53, 94), P(0, 83), P(53, 94), 12), ...quad(P(58, 104), P(0, 91), P(-58, 104), 12)], soft: .3, crisp: .9});
  p.lines.push({d: quad(P(-54, 98.5), P(0, 86.5), P(54, 98.5), 12), w: Math.max(.5, .9 * s), amp: .9});
  for (const side of [-1, 1]) p.lines.push({d: [P(side * 36, 9), P(side * 32.6, 52)], w: Math.max(.45, .7 * s), amp: .6});
  if (!cap) return [p];
  const lip = part(`${id}-lip`, KIND.tier, layer, MAT.silver, [cx, zFoot], {group, order, thick});
  lip.fills.push({d: [...quad(P(-58, 104), P(0, 91), P(58, 104), 12), ...quad(P(58.6, 100.6), P(0, 87.6), P(-58.6, 100.6), 12)], soft: 0, crisp: 1});
  return [p, lip];
}

/**
 * Kakezukuri: a deck carried out over a drop on a lattice of posts and tie beams, with a railing along its edge.
 * The posts all meet the ground on one line (zGround), which is the line the whole structure stands on.
 */
export function kakezukuri(id, x0, x1, zDeck, zGround, {layer = 2, group = id, order = 0, posts = 9, ties = 3} = {}) {
  const cx = (x0 + x1) / 2, frame = part(`${id}-frame`, KIND.tier, layer, MAT.gold, [cx, zGround], {group, order, thick: 14, reach: 3});
  for (let i = 0; i < posts; i++) {
    const x = lerp(x0 + 4, x1 - 4, i / (posts - 1));
    frame.fills.push({d: [[x - 2.6, zDeck + 4], [x + 2.6, zDeck + 4], [x + 3, zGround], [x - 3, zGround]], soft: .3, crisp: .85});
  }
  for (let k = 1; k <= ties; k++) {
    const z = lerp(zDeck + 5, zGround, k / (ties + 1));
    frame.fills.push({d: [[x0 - 4, z - 1.8], [x1 + 4, z - 1.8], [x1 + 4, z + 1.8], [x0 - 4, z + 1.8]], soft: .2, crisp: 1});
  }
  const deck = part(`${id}-deck`, KIND.tier, layer, MAT.kirigin, [cx, zGround], {group, order: order + 1});
  deck.fills.push({d: [[x0 - 9, zDeck - 3], [x1 + 9, zDeck - 3], [x1 + 7, zDeck + 5], [x0 - 7, zDeck + 5]], soft: .2, crisp: .9});
  deck.lines.push({d: [[x0 - 8, zDeck + 1], [x1 + 8, zDeck + 1]], w: .7, amp: .8});
  railing(deck, x0 - 9, x1 + 9, zDeck - 3, 10, 13);
  return [frame, deck];
}

/** One maple leaf: five points about the head of its stalk, the middle one longest, with deep notches between. */
function mapleLeaf(cx, cz, radius, turn) {
  const tips = [1, .84, .58], d = [], at = (a, len) => d.push([cx + Math.cos(a) * len, cz + Math.sin(a) * len]);
  for (let i = -2; i <= 2; i++) {
    const a = turn + i * .95, len = radius * tips[Math.abs(i)];
    if (i > -2) at(a - .475, radius * .3);
    at(a - .2, len * .72); at(a, len); at(a + .2, len * .72);
  }
  d.push([cx - Math.cos(turn) * radius * .22, cz - Math.sin(turn) * radius * .22]);
  return d;
}
/** One lobe of a broadleaf crown: a dome with a ragged upper edge and a nearly flat underside. */
function crownLobe(cx, cz, rx, rz, seed) {
  const d = [], n = 44;
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283, c = Math.cos(a), sn = Math.sin(a);
    const edge = sn < 0 ? 1 + .07 * Math.cos(a * 9 + seed) + .04 * Math.sin(a * 4 + seed * 2) : 1;
    d.push([cx + c * rx * edge, cz + sn * rz * (sn < 0 ? edge : .42)]);
  }
  return d;
}
/**
 * A broadleaf tree is a tree first: a trunk that forks and a crown of three lobes. No solid this small can keep
 * a leaf's outline, so the crown stays a plain mass; what kind of tree it is, is told by the small marks engraved
 * on the crown and by what lies inlaid on the lid around it. It answers the wind as the pine does.
 * `lobes`: centre, half-width and half-height of each lobe in tree heights. `mark(leaf, x, z, size, turn)` engraves one leaf.
 */
function broadleaf(id, x, z, height, lean, seed, {stem = .5, lobes, mats = [MAT.gold, MAT.nashijiLight, MAT.nashijiLight], mark, girth = .062}) {
  const r = rand(seed), anchor = [x, z], spine = [], parts = [], len = height * stem;
  for (let i = 0; i <= 10; i++) { const t = i / 10; spine.push([x + lean * t * t + Math.sin(t * 3.2 + seed) * height * .035, z - len * t]); }
  const trunk = part(`${id}-trunk`, KIND.pine, 2, MAT.gold, anchor, {group: id, order: 0, reach: 5, thick: 16});
  const half = t => lerp(height * girth, height * girth * .5, t);
  trunk.fills.push({d: [...spine.map(([px, pz], i) => [px - half(i / 10), pz]), ...spine.map(([px, pz], i) => [px + half(i / 10), pz]).reverse()], soft: .3, crisp: .85});
  for (let i = 2; i < 8; i += 2) trunk.lines.push({d: [[spine[i][0] - half(i / 10) * .5, spine[i][1] + 3], [spine[i + 1][0] + half(i / 10) * .4, spine[i + 1][1] - 2]], w: .6, amp: .7});
  parts.push(trunk);
  const top = spine[10], fork = spine[5];
  lobes.forEach(([sx, sz, wx, wz], k) => {
    const cx = top[0] + sx * height, cz = top[1] + sz * height, rx = wx * height, rz = wz * height;
    const leaf = part(`${id}-leaf-${k}`, KIND.pine, 3, mats[k] ?? mats[0], anchor, {group: id, order: k + 1, reach: 5, thick: 22, bias: 9 + k * 1.5});
    leaf.fills.push({d: crownLobe(cx, cz, rx, rz, seed + k * 3), soft: .45, crisp: .6});
    for (let i = 0; i < (k ? 4 : 7); i++) {
      const a = r() * 6.283, q = Math.sqrt(r()) * .62;
      mark(leaf, cx + Math.cos(a) * rx * q, cz - Math.abs(Math.sin(a)) * rz * q * .9 - rz * .05, height * (.05 + r() * .02), r() * 6.283);
    }
    // The limb that carries it: broad enough to stand as a solid, so the trunk is seen to fork under the crown.
    if (k) { const w = height * .034, end = [cx, cz + rz * .2]; trunk.fills.push({d: [[fork[0] - w, fork[1]], [fork[0] + w, fork[1]], [end[0] + w, end[1]], [end[0] - w, end[1]]], soft: .3, crisp: .85}); }
    parts.push(leaf);
  });
  return parts;
}
const rays = (leaf, x, z, angles, lengths) => angles.forEach((a, i) => leaf.lines.push({d: [[x, z], [x + Math.cos(a) * lengths[i], z + Math.sin(a) * lengths[i]]], w: .6, amp: .9}));

/** A maple: a broad low crown, five-pointed leaves engraved on it. Pair it with fallenLeaves. */
export function maple(id, x, z, height, lean, seed, {clusters = 3} = {}) {
  return broadleaf(id, x, z, height, lean, seed, {
    lobes: [[0, -.2, .3, .25], [-.3, -.07, .24, .2], [.31, -.1, .23, .19]].slice(0, clusters),
    mark: (leaf, lx, lz, size, turn) => rays(leaf, lx, lz, [-2, -1, 0, 1, 2].map(j => turn + j * .95), [.58, .84, 1, .84, .58].map(k => k * size)),
  });
}

/**
 * Small shapes inlaid flat in the lid, one part per material. They are ground, so each keeps its outline however
 * small it is: this is where a picture says what the solids are too round to say. Densest at the centre of the drift.
 */
function scatter(id, cx, cz, rx, rz, count, seed, size, shape, mats) {
  const r = rand(seed), parts = mats.map(([name, mat]) => part(`${id}-${name}`, KIND.still, 0, mat, [cx, cz]));
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  for (let i = 0; i < count; i++) {
    const a = r() * 6.283, q = Math.pow(r(), .7), R = size * (.75 + r() * .6), m = R + 2;
    const x = clamp(cx + Math.cos(a) * rx * q, PLATE.halfW - m), z = clamp(cz + Math.sin(a) * rz * q, PLATE.halfH - m);
    parts[i % 3 === 2 ? parts.length - 1 : 0].fills.push({d: shape(x, z, R, r() * 6.283), soft: 0, crisp: 1});
  }
  return parts.filter(p => p.fills.length);
}
/** Fallen maple leaves: cut gold, and one in three cut silver. */
export function fallenLeaves(id, cx, cz, rx, rz, count, seed, {size = 11} = {}) {
  return scatter(id, cx, cz, rx, rz, count, seed, size, mapleLeaf, [['gold', MAT.kirikane], ['silver', MAT.kirigin]]);
}
/** One ginkgo leaf: a fan on a stalk, split at the middle of its rim. */
function ginkgoLeaf(cx, cz, radius, turn) {
  const d = [[cx - Math.cos(turn) * radius * .5, cz - Math.sin(turn) * radius * .5]];
  for (let i = 0; i <= 10; i++) { const t = i / 10, a = turn + (t - .5) * 2; d.push([cx + Math.cos(a) * radius * (i === 5 ? .62 : 1), cz + Math.sin(a) * radius * (i === 5 ? .62 : 1)]); }
  return d;
}
/** Fallen ginkgo leaves: a carpet of cut gold. */
export function fallenFans(id, cx, cz, rx, rz, count, seed, {size = 10} = {}) {
  return scatter(id, cx, cz, rx, rz, count, seed, size, ginkgoLeaf, [['gold', MAT.kirikane], ['pale', MAT.nashijiLight]]);
}
/** One cherry petal: a drop with a notched tip. */
function petal(cx, cz, radius, turn) {
  const at = (a, len) => [cx + Math.cos(turn + a) * len * radius, cz + Math.sin(turn + a) * len * radius];
  return [at(Math.PI, .9), at(2.2, .75), at(1.1, .95), at(.25, 1.05), at(0, .7), at(-.25, 1.05), at(-1.1, .95), at(-2.2, .75)];
}
/** Scattered cherry petals of shell. */
export function petals(id, cx, cz, rx, rz, count, seed, {size = 6} = {}) {
  return scatter(id, cx, cz, rx, rz, count, seed, size, petal, [['shell', MAT.aogai]]);
}
/** Fallen fruit of the tachibana: small rounds of cut gold. */
export function fruits(id, cx, cz, rx, rz, count, seed, {size = 4.5} = {}) {
  return scatter(id, cx, cz, rx, rz, count, seed, size, (x, z, R, turn) => blob(x, z, R, R, Math.round(turn * 10), .05, 12), [['gold', MAT.kirikane]]);
}
/** The moon, or its image in still water: a disc of shell and two or three broken strokes of cut silver beneath it. */
export function moon(id, cx, cz, radius, {ripples = 3} = {}) {
  const disc = part(id, KIND.still, 0, MAT.aogai, [cx, cz]);
  disc.fills.push({d: blob(cx, cz, radius, radius, 2, 0, 40), soft: 0, crisp: 1});
  if (!ripples) return [disc];
  const wake = part(`${id}-wake`, KIND.still, 0, MAT.kirigin, [cx, cz + radius * 2]);
  for (let i = 0; i < ripples; i++) {
    const z = cz + radius * (1.5 + i * .62), half = radius * (.95 - i * .22), h = Math.max(1.4, radius * .1), dx = (i % 2 ? -1 : 1) * radius * .22;
    wake.fills.push({d: [[cx + dx - half, z - h], [cx + dx + half, z - h], [cx + dx + half * .8, z + h], [cx + dx - half * .8, z + h]], soft: 0, crisp: 1});
  }
  return [disc, wake];
}
/** A fox's trail in cut silver: `points` are [x, z] along its way, the prints falling left and right of the line. */
export function pawPrints(id, points, {size = 4.6} = {}) {
  const p = part(id, KIND.still, 0, MAT.kirigin, points[0]);
  points.forEach(([x, z], i) => {
    const [nx, nz] = points[Math.min(i + 1, points.length - 1)], [px, pz] = points[Math.max(i - 1, 0)], a = Math.atan2(nz - pz, nx - px);
    const side = i % 2 ? 1 : -1, ox = x - Math.sin(a) * side * size * .9, oz = z + Math.cos(a) * side * size * .9;
    p.fills.push({d: blob(ox, oz, size, size * .8, 3, .04, 14), soft: 0, crisp: 1});
    for (const t of [-.6, 0, .6]) p.fills.push({d: blob(ox + Math.cos(a + t) * size * 1.7, oz + Math.sin(a + t) * size * 1.7, size * .42, size * .42, 1, 0, 8), soft: 0, crisp: 1});
  });
  return [p];
}

/** Inari's fox, seated on its stone, its brush curled low behind it: silver on a block of cut gold. `flip` -1 faces it left. */
export function fox(id, x, z, flip = 1, s = 1, {layer = 2} = {}) {
  const f = (dx, h) => [x + dx * flip * s, z - h * s], B = 16;
  const stone = part(`${id}-stone`, KIND.tier, layer, MAT.kirikane, [x, z], {group: id, order: 0});
  stone.fills.push({d: [f(-15, 0), f(15, 0), f(13, 12), f(-13, 12)], soft: .3, crisp: .9});
  stone.fills.push({d: [f(-17, 12), f(17, 12), f(17, B), f(-17, B)], soft: .2, crisp: 1});
  stone.lines.push({d: [f(-13.5, 6), f(13.5, 6)], w: .6, amp: .7});
  const body = part(`${id}-body`, KIND.tier, layer, MAT.silver, [x, z], {group: id, order: 1, thick: 14});
  body.fills.push({d: blob(...f(-2, B + 9.5), 9 * s, 10 * s, 3, .05, 22), soft: .3, crisp: .8});                         // haunch
  body.fills.push({d: [f(0, B), f(9.5, B), f(10, B + 20), f(7, B + 28), f(-1, B + 24)], soft: .3, crisp: .8});            // chest and forelegs
  body.fills.push({d: blob(...f(6.5, B + 31.5), 6.4 * s, 5.6 * s, 5, .03, 16), soft: .3, crisp: .9});                           // head
  body.fills.push({d: [f(8, B + 36), f(22, B + 29.5), f(9, B + 25.5)], soft: .2, crisp: 1});                           // muzzle
  body.fills.push({d: [f(.6, B + 33.5), f(1.6, B + 46), f(6.4, B + 36)], soft: .2, crisp: 1});                         // ears
  body.fills.push({d: [f(6, B + 36), f(10.4, B + 45), f(11.6, B + 34.4)], soft: .2, crisp: 1});
  body.fills.push({d: [...quad(f(-8, B + 1), f(-30, B + 1), f(-27, B + 26), 10), ...quad(f(-27, B + 26), f(-19, B + 15), f(-7, B + 11), 10)], soft: .3, crisp: .85});   // tail
  body.lines.push({d: quad(f(-11, B + 5), f(-25, B + 6), f(-24, B + 21), 8), w: .6, amp: .8});
  body.lines.push({d: quad(f(-9, B + 18), f(-1, B + 20), f(1, B + 8), 6), w: .6, amp: .7});
  body.lines.push({d: [f(7.6, B + 32.4), f(10, B + 31.6)], w: .7, amp: 1});
  return [stone, body];
}

/**
 * A pine as makie draws it: a leaning trunk carrying pads of foliage, gold and pale gold in turn. A pad is a low
 * cloud of two or three lobes with a nearly flat underside; its needles are drawn as small tufts, one fan to a lobe
 * and a few between, never one fan for the whole pad.
 * The whole tree answers the wind about its foot; each pad lags a little behind the one below.
 */
export function pine(id, x, z, height, lean, seed, {trunkLayer = 2, leafLayer = 3, clusters = 4} = {}) {
  const r = rand(seed), anchor = [x, z], spine = [], parts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; spine.push([x + lean * t * t + Math.sin(t * 5 + seed) * height * .035, z - height * t]); }
  const trunk = part(`${id}-trunk`, KIND.pine, trunkLayer, MAT.gold, anchor, {group: id, order: 0, reach: 5, thick: 16});
  const half = t => lerp(height * .045, height * .012, t);
  trunk.fills.push({d: [...spine.map(([px, pz], i) => [px - half(i / 12), pz]), ...spine.map(([px, pz], i) => [px + half(i / 12), pz]).reverse()], soft: .3, crisp: .85});
  for (let i = 2; i < 11; i += 2) trunk.lines.push({d: [[spine[i][0] - half(i / 12) * .5, spine[i][1] + 3], [spine[i + 1][0] + half(i / 12) * .4, spine[i + 1][1] - 2]], w: .6, amp: .7});
  parts.push(trunk);
  for (let k = 0; k < clusters; k++) {
    const t = .46 + k / clusters * .54, s = spine[Math.round(t * 12)], side = k % 2 ? -1 : 1;
    const w = height * lerp(.34, .2, k / clusters) * (.9 + r() * .2), h = w * .34;
    const cx = k === clusters - 1 ? s[0] : s[0] + side * w * (.55 + r() * .25), cz = s[1] - h * .2;
    const leaf = part(`${id}-leaf-${k}`, KIND.pine, leafLayer, k % 2 ? MAT.nashijiLight : MAT.gold, anchor, {group: id, order: k + 1, reach: 6, thick: 24, bias: 9 + k * 1.5});
    // The pad's outline: the upper envelope of its lobes over a shallow belly.
    const lobes = w > height * .26 ? 3 : 2, humps = [];
    for (let i = 0; i < lobes; i++) {
      const u = lobes === 1 ? 0 : i / (lobes - 1) * 2 - 1, mid = 1 - Math.abs(u);
      humps.push({x: cx + u * w * .56 + (r() - .5) * w * .08, r: w * (.40 + .12 * mid) * (.92 + r() * .16), lift: h * (.25 + .55 * mid)});
    }
    const top = x => Math.max(0, ...humps.map(m => { const d = (x - m.x) / m.r; return d * d < 1 ? Math.sqrt(1 - d * d) * m.r * .62 + m.lift : 0; }));
    const outline = [], n = 36;
    for (let i = 0; i <= n; i++) { const x = cx - w + 2 * w * i / n, edge = Math.sin(Math.PI * i / n); outline.push([x, cz - top(x) * Math.pow(edge, .35)]); }
    for (let i = n; i >= 0; i--) { const x = cx - w + 2 * w * i / n; outline.push([x, cz + h * .34 * Math.sin(Math.PI * i / n)]); }
    leaf.fills.push({d: outline, soft: .45, crisp: .6});
    // Needle tufts: a small fan on each lobe, and a lower row between them.
    const tuft = (tx, tz, tr, count) => { for (let i = 0; i < count; i++) { const a = Math.PI * (1.12 + .76 * i / (count - 1)); leaf.lines.push({d: [[tx + Math.cos(a) * tr * .22, tz + Math.sin(a) * tr * .22], [tx + Math.cos(a) * tr, tz + Math.sin(a) * tr]], w: .55, amp: .9}); } };
    for (const m of humps) tuft(m.x, cz - m.lift * .55, m.r * .62, 7);
    for (let i = 0; i < lobes - 1; i++) tuft((humps[i].x + humps[i + 1].x) / 2, cz + h * .12, w * .26, 5);
    // The bough that carries it.
    trunk.lines.push({d: [s, [lerp(s[0], cx, .6), lerp(s[1], cz, .3) + h * .3], [cx, cz + h * .28]], w: 1.5, amp: 1});
    parts.push(leaf);
  }
  return parts;
}

/** Uguisu, the first song of the year: a small bird of cut silver. It rests at one perch at a time. */
export function bird(id, perches, layer = 1) {
  return perches.map(([x, z, flip = 1, attach, bias = 32], i) => {
    const p = part(`${id}-${i}`, KIND.bird, layer, MAT.hyomonSilver, [x, z], {group: id, order: i, reach: 4, thick: 16, bias, attach});
    const S = 1.7, f = (dx, dz) => [x + dx * flip * S, z + dz * S];
    p.fills.push({d: blob(x, z - 3.4 * S, 5.6 * S, 3.3 * S, 9, .04, 18), soft: 0, crisp: 1});                       // body
    p.fills.push({d: blob(x + 5 * flip * S, z - 6.4 * S, 2.5 * S, 2.3 * S, 4, 0, 12), soft: 0, crisp: 1});             // head
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

/** A still pond: a closed shore and widely spaced horizontal glints, never a flowing ribbon. */
export function pond(id, cx, cz, rx, rz, seed, {reflection = null} = {}) {
  const p = part(id, KIND.water, 0, MAT.water, [cx, cz]);
  const shore = blob(cx, cz, rx, rz, seed, .055, 80);
  p.fills.push({d: shore, soft: 0, crisp: .08});
  p.lines.push({d: [...shore, shore[0]], w: .65, amp: .5});
  for (let i = 0; i < 5; i++) {
    const z = cz + (i - 2) * rz * .28, half = rx * (.5 + .14 * Math.sin(i * 2 + seed));
    p.lines.push({d: [[cx - half, z], [cx + half * .7, z]], w: .6, amp: .45});
  }
  if (!reflection) return [p];
  const {x, z, width, height} = reflection;
  const image = part(`${id}-reflection`, KIND.still, 0, MAT.nashijiLight, [x, z]);
  // Broken, inverted eaves read as a reflection without painting a second solid pavilion.
  for (let i = 0; i < 3; i++) {
    const half = width * (1 - i * .22), top = z + i * height / 3;
    image.fills.push({d: [[x - half, top], [x + half, top], [x + half * .5, top + height * .19], [x - half * .5, top + height * .19]], soft: .12, crisp: .08});
    image.lines.push({d: [[x - half * .8, top + 4], [x + half * .6, top + 4]], w: 1, amp: .5});
  }
  return [p, image];
}

/** A broad-winged phoenix crest. The wings and tail stay broad enough to survive swelling. */
export function phoenix(id, x, z, s = 1, {group = id, order = 0} = {}) {
  const p = part(id, KIND.tier, 2, MAT.hyomonGold, [x, z], {group, order, thick: 14});
  const P = (dx, dz) => [x + dx * s, z + dz * s];
  p.fills.push({d: [[-4, 0], [-8, -13], [-28, -20], [-33, -33], [-18, -28], [-5, -21], [4, -23], [17, -32], [30, -36], [25, -22], [9, -13], [5, 0]].map(([a, b]) => P(a, b)), soft: .2, crisp: .9});
  p.fills.push({d: [[-2, -19], [0, -34], [8, -38], [18, -32], [8, -29], [7, -16]].map(([a, b]) => P(a, b)), soft: .2, crisp: .9});
  p.lines.push({d: [P(-24, -26), P(-4, -17), P(0, -5), P(20, -29)], w: .8, amp: 1});
  return [p];
}

/**
 * A moon-viewing deck of bamboo: a floor, so it is inlaid flat in the lid, never stood up like a screen.
 * Its slats run toward the water; the moon it waits for is drawn in the pond (see moon).
 */
export function moonDeck(id, x0, x1, zBack, zFront) {
  const p = part(id, KIND.still, 0, MAT.gold, [(x0 + x1) / 2, zFront]);
  p.fills.push({d: [[x0, zBack], [x1, zBack], [x1, zFront], [x0, zFront]], soft: 0, crisp: .7});
  for (let x = x0 + 5; x < x1 - 2; x += 6) p.lines.push({d: [[x, zBack + 1], [x, zFront - 1]], w: .8, amp: 1});
  for (const z of [zBack + 1.5, zFront - 1.5]) p.lines.push({d: [[x0, z], [x1, z]], w: 1.4, amp: 1});
  return [p];
}

/** Inlaid stepping stones stay in the ground; each broad oval is separated by exposed lacquer. */
export function steppingStones(id, points) {
  const p = part(id, KIND.still, 0, MAT.kirigin, points[0].slice(0, 2));
  points.forEach(([x, z, r], i) => p.fills.push({d: blob(x, z, r, r * .65, i + 3, .09, 16), soft: .2, crisp: .55}));
  return [p];
}

/**
 * A stone lantern in elevation: squat, with a broad cap and a window of cut gold. What makes it a lantern is its light, which no solid can
 * show: chips of cut gold strewn on the ground before it, densest at its foot.
 */
export function lantern(id, x, z, s = 1) {
  const P = (a, h) => [x + a * s, z - h * s];
  const stone = part(`${id}-stone`, KIND.tier, 2, MAT.nashijiLight, [x, z], {group: id, thick: 16});
  const polygon = (p, d) => p.fills.push({d: d.map(([a, h]) => P(a, h)), soft: .25, crisp: .8});
  polygon(stone, [[-22, 0], [22, 0], [18, 9], [-18, 9]]);
  polygon(stone, [[-10, 7], [10, 7], [9, 26], [-9, 26]]);
  polygon(stone, [[-19, 24], [19, 24], [17, 47], [-17, 47]]);
  const cap = part(`${id}-cap`, KIND.tier, 2, MAT.gold, [x, z], {group: id, order: 1, thick: 14});
  polygon(cap, [[-33, 45], [33, 45], [26, 53], [10, 62], [0, 66], [-10, 62], [-26, 53]]);
  polygon(cap, [[-6, 63], [6, 63], [5, 76], [-5, 76]]);
  cap.lines.push({d: [P(-25, 49), P(25, 49)], w: .8, amp: 1});
  const opening = part(`${id}-light`, KIND.tier, 3, MAT.kirikane, [x, z], {group: id, order: 1, thick: 6, bias: 13});
  opening.fills.push({d: [P(-9, 29), P(9, 29), P(9, 43), P(-9, 43)], soft: 0, crisp: .5});
  const chip = (cx, cz, R, turn) => [0, 1, 2, 3].map(i => [cx + Math.cos(turn + i * 1.5708) * R, cz + Math.sin(turn + i * 1.5708) * R]);
  return [stone, cap, opening, ...scatter(`${id}-glow`, x, z + 20 * s, 46 * s, 16 * s, 16, 5, 2.8, chip, [['gold', MAT.kirikane]])];
}

/** White sand is a ground field; raking is engraved line work, never a row of raised bars. */
export function sandGarden(id, x0, x1, zBack, zFront, {raked = true, mat = MAT.silver} = {}) {
  const p = part(id, KIND.still, 0, mat, [(x0 + x1) / 2, (zBack + zFront) / 2]);
  p.fills.push({d: [[x0 + 12, zBack], [x1 - 12, zBack], [x1, zFront], [x0, zFront]], soft: .08, crisp: .12});
  if (raked) for (let z = zBack + 8; z < zFront - 5; z += 9) {
    p.lines.push({d: quad([x0 + 15, z], [(x0 + x1) / 2, z - 7], [x1 - 15, z], 24), w: .75, amp: .8});
  }
  return [p];
}

/** Kogetsudai in elevation: the level crown must rise with the flank to read as a truncated cone. */
export function sandCone(id, cx, zBase, halfW, height) {
  const p = part(id, KIND.tier, 2, MAT.silver, [cx, zBase], {thick: 18});
  const top = zBase - height, r = halfW * .43;
  p.fills.push({d: [[cx - r, top], [cx + r, top], ...quad([cx + halfW, zBase - 3], [cx, zBase + 10], [cx - halfW, zBase - 3], 24)], soft: .35, crisp: .65});
  p.fills.push({d: blob(cx, top, r, r * .24, 4, 0, 40), soft: .2, crisp: .9});
  p.lines.push({d: [...blob(cx, top, r * .87, r * .18, 4, 0, 40), [cx + r * .87, top]], w: .7, amp: .7});
  return [p];
}

/** A low tiled wall or open gallery. Bays are engraved, keeping a quiet continuous silhouette. */
export function corridor(id, x0, x1, zBase, {height = 26, open = true, group = id, order = 0} = {}) {
  const cx = (x0 + x1) / 2, w = (x1 - x0) / 2;
  const body = part(`${id}-body`, KIND.tier, 2, open ? MAT.lacquer : MAT.nashijiLight, [cx, zBase], {group, order, thick: 15});
  body.fills.push({d: [[x0 + 5, zBase - height], [x1 - 5, zBase - height], [x1 - 5, zBase], [x0 + 5, zBase]], soft: .15, crisp: .6});
  const bays = Math.max(2, Math.round((x1 - x0) / 22));
  for (let i = 0; i <= bays; i++) {
    const x = lerp(x0 + 6, x1 - 6, i / bays);
    body.lines.push({d: [[x, zBase - height], [x, zBase]], w: open ? 2 : .65, amp: .9});
  }
  return [body, ...roof(`${id}-roof`, cx, zBase - height, w, 11, {group, order: order + 1, ridgeHalf: w * .82, upturn: 3, tiles: bays * 2})];
}

/** The court's cherry (silver crown, blossoms engraved) or tachibana (compact gold crown, fruit engraved). */
export function courtTree(id, x, z, height, {citrus = false} = {}) {
  return broadleaf(id, x, z, height, citrus ? -3 : 4, citrus ? 5 : 3, citrus ? {
    lobes: [[0, -.16, .26, .24], [-.22, -.04, .2, .18], [.23, -.06, .2, .18]], mats: [MAT.gold, MAT.gold, MAT.nashijiLight],
    mark: (leaf, lx, lz, size) => leaf.lines.push({d: [...blob(lx, lz, size * .6, size * .6, 1, 0, 14), [lx + size * .6, lz]], w: 1, amp: 1}),
  } : {
    lobes: [[0, -.2, .3, .25], [-.3, -.07, .24, .2], [.31, -.1, .23, .19]], mats: [MAT.silver, MAT.nashijiLight, MAT.silver],
    mark: (leaf, lx, lz, size, turn) => rays(leaf, lx, lz, [0, 1, 2, 3, 4].map(j => turn + j * 1.2566), Array(5).fill(size * .8)),
  });
}

/** A great ginkgo: a tall straight trunk and a crown higher than it is wide, fan leaves engraved on it. Pair it with fallenFans. */
export function ginkgo(id, x, z, height) {
  return broadleaf(id, x, z, height, 3, 6, {
    stem: .46, girth: .07, lobes: [[0, -.36, .2, .22], [-.14, -.14, .25, .2], [.15, -.1, .24, .19]], mats: [MAT.gold, MAT.nashijiLight, MAT.gold],
    mark: (leaf, lx, lz, size) => { rays(leaf, lx, lz, [-2.3, -1.83, -1.31, -.84], Array(4).fill(size)); leaf.lines.push({d: [-2.3, -1.83, -1.31, -.84].map(a => [lx + Math.cos(a) * size, lz + Math.sin(a) * size]), w: .6, amp: .9}); },
  });
}

/** Karamon: a lifted cusped gable above an open passage. The opening is deliberately wider than the blur. */
export function karamon(id, cx, zBase, halfW = 66) {
  const s = halfW / 66, P = (x, h) => [cx + x * s, zBase - h * s];
  const frame = part(`${id}-frame`, KIND.tier, 2, MAT.gold, [cx, zBase], {group: id, thick: 18});
  for (const x of [-39, 39]) frame.fills.push({d: [P(x - 5, 0), P(x + 5, 0), P(x + 5, 61), P(x - 5, 61)], soft: .2, crisp: .8});
  frame.fills.push({d: [P(-45, 49), P(45, 49), P(45, 64), P(-45, 64)], soft: .2, crisp: .8});
  const cap = part(`${id}-gable`, KIND.tier, 2, MAT.gold, [cx, zBase], {group: id, order: 1});
  const curve = [], lower = [];
  for (let i = 0; i <= 48; i++) {
    const u = i / 24 - 1, h = 72 + 31 * Math.exp(-u * u * 6) + 8 * Math.pow(Math.abs(u), 8);
    curve.push(P(u * 66, h)); lower.push(P(u * 66, h - 13));
  }
  cap.fills.push({d: [...curve, P(66, 59), P(-66, 59)], soft: .2, crisp: .9});
  cap.lines.push({d: curve.map(([x, z]) => [x, z + 5 * s]), w: 1, amp: 1});
  cap.lines.push({d: lower, w: .8, amp: .8});
  // One large floral carving survives where a row of small ornaments would turn into beads.
  frame.lines.push({d: [P(-19, 56), P(-8, 61), P(0, 55), P(8, 61), P(19, 56)], w: 1.4, amp: 1});
  // Closed leaves of black lacquer with gold studs: without them the gable on two posts reads as a bench.
  const doors = part(`${id}-doors`, KIND.tier, 2, MAT.lacquer, [cx, zBase], {group: id, thick: 12});
  doors.fills.push({d: [P(-34, 0), P(34, 0), P(34, 50), P(-34, 50)], soft: 0, crisp: .5});
  doors.lines.push({d: [P(0, 0), P(0, 50)], w: 1.2, amp: 1});
  for (const x of [-22, -11, 11, 22]) for (const h of [12, 26, 40]) doors.lines.push({d: [P(x - 1.6, h), P(x + 1.6, h)], w: 2.6, amp: 1});
  return [doors, frame, cap];
}

/** Masonry and its moat form a low ground border, with staggered joints drawn into a continuous bank. */
export function moatWall(id, x0, x1, zTop, zBottom, waterFront) {
  const water = part(`${id}-moat`, KIND.water, 0, MAT.water, [(x0 + x1) / 2, waterFront]);
  water.fills.push({d: [[x0 - 6, zBottom + 4], [x1 + 6, zBottom + 4], [x1 + 6, waterFront], [x0 - 6, waterFront]], soft: 0, crisp: .1});
  water.lines.push({d: [[x0, waterFront - 3], [x1, waterFront - 3]], w: .6, amp: .7});
  const wall = part(id, KIND.rock, 1, MAT.mura, [(x0 + x1) / 2, zBottom], {thick: 15});
  wall.fills.push({d: [[x0 + 6, zTop], [x1 - 6, zTop], [x1, zBottom], [x0, zBottom]], soft: .3, crisp: .65});
  const mid = (zTop + zBottom) / 2;
  wall.lines.push({d: [[x0 + 4, mid], [x1 - 4, mid]], w: 1, amp: .8});
  for (let x = x0 + 23; x < x1 - 20; x += 42) {
    wall.lines.push({d: [[x, zTop + 1], [x + 3, mid], [x + 21, mid], [x + 23, zBottom - 1]], w: .8, amp: .9});
  }
  return [water, wall];
}

/** Receding stone treads are part of the hillside, not a screen that hinges upright. */
export function stoneSteps(id, cx, zBack, zFront, farW, nearW, count = 11) {
  const p = part(id, KIND.still, 0, MAT.nashijiLight, [cx, zFront]);
  p.fills.push({d: [[cx - farW, zBack], [cx + farW, zBack], [cx + nearW, zFront], [cx - nearW, zFront]], soft: .5, crisp: .25});
  for (let i = 0; i <= count; i++) {
    const t = i / count, z = lerp(zBack, zFront, t), w = lerp(farW, nearW, t);
    p.lines.push({d: [[cx - w, z], [cx + w, z]], w: 1.4, amp: 1});
    if (i < count) p.lines.push({d: [[cx + (i % 2 ? -.18 : .22) * w, z], [cx + (i % 2 ? -.18 : .22) * w, lerp(zBack, zFront, (i + 1) / count)]], w: .6, amp: .7});
  }
  return [p];
}

/** An open mountain gate: the lower passage is negative space, with all posts on the same foot line. */
export function sanmon(id, cx, zBase, halfW) {
  const p = part(`${id}-posts`, KIND.tier, 2, MAT.gold, [cx, zBase], {group: id, thick: 18});
  for (const side of [-1, 1]) {
    const x = cx + side * halfW * .65;
    p.fills.push({d: [[x - 6, zBase], [x + 6, zBase], [x + 6, zBase - halfW * .85], [x - 6, zBase - halfW * .85]], soft: .25, crisp: .8});
  }
  return [p,
    ...storey(`${id}-upper`, cx, zBase - halfW * .86, zBase - halfW * .57, halfW * .73, {group: id, order: 1, bays: 3, windowMat: MAT.lacquer}),
    ...roof(`${id}-roof`, cx, zBase - halfW * .88, halfW, halfW * .42, {group: id, order: 2, ridgeHalf: halfW * .5}),
  ];
}

/** A quiet field of powdered earth joins a precinct without filling its reserved negative space with objects. */
export function gardenGround(id, outline, {mat = MAT.mura, amp = .24} = {}) {
  const centre = outline.reduce(([x, z], p) => [x + p[0] / outline.length, z + p[1] / outline.length], [0, 0]);
  const p = part(id, KIND.still, 0, mat, centre);
  p.fills.push({d: outline, soft: amp, crisp: 0});
  return [p];
}
