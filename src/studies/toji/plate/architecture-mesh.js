// Explicit 3D builders for roofed buildings: roofs, storeys, halls, the pagoda, gates and galleries.
// A roof is a thin parametric shell (front, underside, sealed edges) whose XZ footprint is the original elevation
// outline; tile lines are thin bands laid on that same surface. Walls are flat boxes, posts stand a little proud,
// windows sit back between them. Openings in gates and galleries are real holes: neither mesh nor fills cover them.
import {MAT, KIND} from './vocab.js';
import {extrudeConvex, sweepHalfTube, ribbonMesh} from './mesh-geometry.js';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const quad = (a, c, b, n = 10) => Array.from({length: n + 1}, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
});
const part = (id, kind, layer, mat, anchor, extra = {}) => ({
  id, kind, group: id, order: 0, layer, mat, reach: .6, thick: 0, bias: 0, anchor, fills: [], lines: [], ...extra,
});
const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v, fallback = [0, 1, 0]) => { const l = Math.hypot(v[0], v[1], v[2]); return l > 1e-12 ? scale(v, 1 / l) : fallback; };

/**
 * Pushes one triangle. Skips slivers. The face normal is oriented along `hint`; per-vertex normals, when given,
 * are used for shading instead of the face normal.
 */
function tri(out, a, b, c, hint, na, nb, nc) {
  const n = cross(sub(b, a), sub(c, a)), area = .5 * Math.hypot(n[0], n[1], n[2]);
  if (!(area > 1e-7)) return;
  let f = unit(n);
  if (dot(f, hint) < 0) { f = scale(f, -1); [b, c, nb, nc] = [c, b, nc, nb]; }
  for (const [p, q] of [[a, na], [b, nb], [c, nc]]) out.push(p[0], p[1], p[2], ...(q || f), p[0], p[2]);
}
const quadFace = (out, a, b, c, d, hint, na, nb, nc, nd) => { tri(out, a, b, c, hint, na, nb, nc); tri(out, a, c, d, hint, na, nc, nd); };

/** Chamfers every corner of a convex 2D polygon by at most `chamfer` units. */
function chamferConvex(pts, chamfer) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    const ux = a[0] - b[0], uz = a[1] - b[1], l1 = Math.hypot(ux, uz);
    const vx = c[0] - b[0], vz = c[1] - b[1], l2 = Math.hypot(vx, vz);
    const d1 = Math.min(chamfer, l1 * .25), d2 = Math.min(chamfer, l2 * .25);
    out.push([b[0] + ux / l1 * d1, b[1] + uz / l1 * d1], [b[0] + vx / l2 * d2, b[1] + vz / l2 * d2]);
  }
  return out;
}
const box = (x0, x1, z0, z1, y0, y1, mat, chamfer = .3) =>
  extrudeConvex(chamferConvex(rect(Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)), chamfer), y0, y1, mat);

/**
 * A closed slab over a parametric grid: the front is F(a, b) for a, b in [0, 1], the back is the front moved
 * `depth` down in y, and the four borders are sealed. Front normals are smooth; the top row of each border wall
 * leans halfway toward the front normal so the rim reads as a small chamfer instead of a razor edge.
 */
function gridSlab(F, nu, nv, depth, mat) {
  const top = Array.from({length: nu + 1}, (_, i) => Array.from({length: nv + 1}, (_, j) => F(i / nu, j / nv)));
  const at = (i, j) => top[clamp(i, 0, nu)][clamp(j, 0, nv)];
  const normal = (i, j) => {
    const n = unit(cross(sub(at(i + 1, j), at(i - 1, j)), sub(at(i, j + 1), at(i, j - 1))));
    return n[1] < 0 ? scale(n, -1) : n;
  };
  const N = top.map((row, i) => row.map((_, j) => normal(i, j)));
  const down = p => [p[0], p[1] - depth, p[2]];
  const v = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = top[i][j], b = top[i + 1][j], c = top[i + 1][j + 1], d = top[i][j + 1];
    const na = N[i][j], nb = N[i + 1][j], nc = N[i + 1][j + 1], nd = N[i][j + 1];
    const h = unit(add(add(na, nb), add(nc, nd)));
    quadFace(v, a, b, c, d, h, na, nb, nc, nd);
    const m = scale(h, -1);
    quadFace(v, down(a), down(b), down(c), down(d), m, scale(na, -1), scale(nb, -1), scale(nc, -1), scale(nd, -1));
  }
  let cx = 0, cz = 0, count = 0;
  for (const row of top) for (const p of row) { cx += p[0]; cz += p[2]; count++; }
  cx /= count; cz /= count;
  const border = [];
  for (let i = 0; i <= nu; i++) border.push([i, 0]);
  for (let j = 1; j <= nv; j++) border.push([nu, j]);
  for (let i = nu - 1; i >= 0; i--) border.push([i, nv]);
  for (let j = nv - 1; j >= 1; j--) border.push([0, j]);
  for (let k = 0; k < border.length; k++) {
    const [i0, j0] = border[k], [i1, j1] = border[(k + 1) % border.length];
    const p = top[i0][j0], q = top[i1][j1];
    const along = sub(q, p);
    let out = unit([along[2], 0, -along[0]], [0, 0, 1]);
    const mid = scale(add(p, q), .5);
    if (dot(out, [mid[0] - cx, 0, mid[2] - cz]) < 0) out = scale(out, -1);
    quadFace(v, p, q, down(q), down(p), out, unit(add(out, N[i0][j0])), unit(add(out, N[i1][j1])), out, out);
  }
  return {mat, vertices: v};
}

/**
 * A closed band laid on a parametric surface S(u, t) -> [x, y, z]. `path` lists [u, t] centre samples;
 * `lateral` says which parameter the band's width runs along ('u' for tile lines, 't' for the ridge).
 * The underside sits `off` above the surface along its normal; the band is `thick` deep and `width` wide in XZ.
 */
function surfaceBand(S, path, lateral, width, off, thick, mat, uRange = [-1, 1]) {
  const h = 1e-3, hw = width / 2;
  const nrm = (u, t) => {
    const du = sub(S(u + h, t), S(u - h, t)), dt = sub(S(u, t + h), S(u, t - h));
    const n = unit(cross(du, dt));
    return n[1] < 0 ? scale(n, -1) : n;
  };
  const rows = path.map(([u, t]) => {
    const along = lateral === 'u' ? sub(S(u + h, t), S(u - h, t)) : sub(S(u, t + h), S(u, t - h));
    const step = hw / (Math.hypot(along[0], along[2]) / (2 * h));
    let uc = u, tc = t;
    if (lateral === 'u') uc = clamp(u, uRange[0] + step, uRange[1] - step); else tc = clamp(t, step, 1 - step);
    const ends = lateral === 'u' ? [[uc - step, tc], [uc + step, tc]] : [[uc, tc - step], [uc, tc + step]];
    return ends.map(([a, b]) => {
      const p = S(a, b), n = nrm(a, b);
      return {lo: add(p, scale(n, off)), hi: add(p, scale(n, off + thick)), n};
    });
  });
  const v = [];
  for (let k = 0; k < rows.length - 1; k++) {
    const [l0, r0] = rows[k], [l1, r1] = rows[k + 1];
    const n = unit(add(l0.n, r1.n)), side = unit(sub(l0.lo, r0.lo));
    quadFace(v, l0.hi, r0.hi, r1.hi, l1.hi, n);
    quadFace(v, l0.lo, r0.lo, r1.lo, l1.lo, scale(n, -1));
    quadFace(v, l0.lo, l1.lo, l1.hi, l0.hi, side);
    quadFace(v, r0.lo, r1.lo, r1.hi, r0.hi, scale(side, -1));
  }
  for (const [k, sign] of [[0, -1], [rows.length - 1, 1]]) {
    const [l, r] = rows[k], [pl] = rows[k - sign] || rows[k];
    const dir = scale(unit(sub(l.lo, pl.lo), [0, 0, 1]), 1);
    quadFace(v, l.lo, r.lo, r.hi, l.hi, sign < 0 ? dir : dir);
  }
  return {mat, vertices: v};
}

/** The original elevation outline of a roof: two upturned eave wings and two concave hip slopes. */
export function roofShape(cx, zEave, halfW, rise, ridgeHalf, upturn) {
  const left = quad([cx - halfW, zEave - upturn], [cx - halfW * .72, zEave + upturn * .25], [cx - halfW * .3, zEave], 8);
  const right = quad([cx + halfW * .3, zEave], [cx + halfW * .72, zEave + upturn * .25], [cx + halfW, zEave - upturn], 8);
  const slopeR = quad([cx + halfW, zEave - upturn], [cx + halfW * .5, zEave - rise * .38], [cx + ridgeHalf, zEave - rise], 8);
  const slopeL = quad([cx - ridgeHalf, zEave - rise], [cx - halfW * .5, zEave - rise * .38], [cx - halfW, zEave - upturn], 8);
  return {outline: [...left, ...right, ...slopeR, ...slopeL], eave: [...left, ...right], slopeL, slopeR};
}

const polyAt = (pts, s) => {
  const f = clamp(s, 0, 1) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), w = f - i;
  return [lerp(pts[i][0], pts[i + 1][0], w), lerp(pts[i][1], pts[i + 1][1], w)];
};
const eaveZAt = (eave, x) => {
  if (x <= eave[0][0]) return eave[0][1];
  for (let i = 0; i < eave.length - 1; i++) {
    const [ax, az] = eave[i], [bx, bz] = eave[i + 1];
    if (x <= bx) return bx - ax > 1e-9 ? lerp(az, bz, (x - ax) / (bx - ax)) : bz;
  }
  return eave.at(-1)[1];
};

/** Relief scale of a roof: small roofs stand a fifth lower; wide roofs do not get any thicker. */
export const roofScale = halfW => (halfW < 75 ? .8 : 1);

/**
 * The roof as a surface S(u, t): u in [-1, 1] across, t = 0 at the ridge and 1 at the eave.
 * XZ is a Coons patch whose four borders are exactly the original ridge, eave and hip curves;
 * y is the relief height above the lid: 14 at the ridge, about 16.5 mid-slope, 11 at the eave (times roofScale).
 */
export function roofSurface(cx, zEave, halfW, rise, ridgeHalf, upturn) {
  const s = roofShape(cx, zEave, halfW, rise, ridgeHalf, upturn), k = roofScale(halfW);
  const L = s.slopeL, Q = [...s.slopeR].reverse(), L0 = L[0], L1 = L.at(-1), Q0 = Q[0], Q1 = Q.at(-1);
  const at = (u, t) => {
    const a = (u + 1) / 2, x = cx + halfW * u;
    const r = [cx + ridgeHalf * u, zEave - rise], e = [x, eaveZAt(s.eave, x)], l = polyAt(L, t), q = polyAt(Q, t);
    const xz = [0, 1].map(c => (1 - t) * r[c] + t * e[c] + (1 - a) * l[c] + a * q[c]
      - ((1 - a) * ((1 - t) * L0[c] + t * L1[c]) + a * ((1 - t) * Q0[c] + t * Q1[c])));
    return [xz[0], k * (14 + 4 * Math.sin(Math.PI * t) - 3 * t), xz[1]];
  };
  return {at, shape: s, k, mountY: 14 * k, eaveY: 11 * k};
}

/** Roof: a 2.8-deep shell on the original outline, tile bands from ridge to eave, a ridge band and a silver eave lip. */
export function meshRoof(id, cx, zEave, halfW, rise, {ridgeHalf = halfW * .2, upturn = halfW * .09, layer = 2, group = id, order = 0, tiles = 15, mat = MAT.gold, motionWith} = {}) {
  const surf = roofSurface(cx, zEave, halfW, rise, ridgeHalf, upturn), S = surf.at, k = surf.k;
  const p = part(id, KIND.tier, layer, mat, [cx, zEave], {group, order, mountY: surf.mountY, ...(motionWith ? {motionWith} : {})});
  p.fills.push({d: surf.shape.outline, soft: .25, crisp: .8});
  const lineMat = mat === MAT.gold ? MAT.hyomonGold : MAT.gold;
  const mesh = [gridSlab((a, t) => S(a * 2 - 1, t), 24, 16, 2.8 * k, mat)];
  const steps = 16;
  for (let i = 0; i <= tiles; i++) {
    const u = -1 + 2 * i / tiles;
    mesh.push(surfaceBand(S, Array.from({length: steps + 1}, (_, j) => [u, j / steps]), 'u', .65, .12, .12, lineMat));
  }
  const ridgeT = .9 / Math.max(1, Math.hypot(...sub(S(0, .01), S(0, 0)).filter((_, c) => c !== 1)) / .01);
  mesh.push(surfaceBand(S, Array.from({length: 25}, (_, j) => [-1 + j / 12, ridgeT]), 't', 1.6, .12, .5, lineMat));
  p.mesh = mesh;

  const lip = part(`${id}-lip`, KIND.tier, layer, MAT.silver, [cx, zEave], {group, order, motionWith: motionWith || id});
  const eave = surf.shape.eave, yTop = surf.eaveY + .15;
  lip.fills.push({d: [...eave, ...eave.map(([x, z]) => [x, z + 2.6]).reverse()], soft: 0, crisp: 1});
  lip.mesh = [gridSlab((s, w) => { const [x, z] = polyAt(eave, s); return [x, yTop, z + 2.6 * w]; }, 34, 1, .6, MAT.silver)];
  return [p, lip];
}

/** Relief depth of a wall: narrow storeys stand a fifth lower. */
const wallDepth = halfW => (halfW < 60 ? 6.4 : 8);

/** Storey: a flat wall box, posts and beams a little proud of it, windows set back between the posts. */
export function meshStorey(id, cx, zTop, zBottom, halfW, {bays = 3, layer = 2, group = id, order = 0, mat = MAT.lacquer, windowMat = MAT.lamp, motionWith} = {}) {
  const wy = wallDepth(halfW), timber = mat === MAT.lacquer ? MAT.gold : mat;
  const wall = part(id, KIND.tier, layer, mat, [cx, zBottom], {group, order, ...(motionWith ? {motionWith} : {})});
  wall.fills.push({d: rect(cx - halfW, cx + halfW, zTop, zBottom), soft: 0, crisp: .45});
  const mesh = [box(cx - halfW, cx + halfW, zTop, zBottom, 0, wy, mat, .35)];
  for (let i = 0; i <= bays; i++) {
    const x = lerp(cx - halfW, cx + halfW, i / bays);
    mesh.push(box(x - .875, x + .875, zTop, zBottom, 0, wy + 1.5, timber, .2));
  }
  mesh.push(box(cx - halfW - 3, cx + halfW + 3, zBottom - 1.3, zBottom, 0, wy + .9, timber, .2));
  const zw = lerp(zTop, zBottom, .72);
  mesh.push(box(cx - halfW - 2, cx + halfW + 2, zw - .35, zw + .35, 0, wy + .6, timber, .15));
  wall.mesh = mesh;

  const lamp = part(`${id}-lamp`, KIND.tier, layer, windowMat, [cx, zBottom], {group, order, motionWith: id});
  const bay = halfW * 2 / bays, lampMesh = [];
  for (let i = 0; i < bays; i++) {
    const x0 = cx - halfW + bay * i + bay * .2, x1 = x0 + bay * .6, z0 = lerp(zTop, zBottom, .16), z1 = lerp(zTop, zBottom, .66);
    lamp.fills.push({d: rect(x0, x1, z0, z1), soft: 0, crisp: .3});
    lampMesh.push(box(x0, x1, z0, z1, wy - 1, wy + .12, windowMat, .2));
  }
  lamp.mesh = lampMesh;
  return [wall, lamp];
}

/** Hall: one storey under one broad roof; roof and lip move with the wall. */
export function meshHall(id, cx, zEave, halfW, rise, {layer = 2, bays = 7, wallH = 24, group = id, order = 0} = {}) {
  return [
    ...meshStorey(`${id}-wall`, cx, zEave + 1, zEave + wallH, halfW * .74, {bays, layer, group, order}),
    ...meshRoof(`${id}-roof`, cx, zEave, halfW, rise, {layer, group, order: order + 1, ridgeHalf: halfW * .52, tiles: 23, upturn: halfW * .06, motionWith: `${id}-wall`}),
  ];
}

/** An elliptical ring band round a mast: the front half of a ring, flat in the picture, with a real gap above and below. */
function sorinRing(cx, zc, hw, ry, height, thick, mat, segs = 14) {
  const v = [], z0 = zc - height / 2, z1 = zc + height / 2;
  const P = (r, yr, th, z) => [cx + r * Math.cos(th), yr * Math.sin(th), z];
  for (let j = 0; j < segs; j++) {
    const a = Math.PI * j / segs, b = Math.PI * (j + 1) / segs, m = (a + b) / 2;
    const outN = unit([Math.cos(m) / hw, Math.sin(m) / ry, 0]);
    quadFace(v, P(hw, ry, a, z0), P(hw, ry, b, z0), P(hw, ry, b, z1), P(hw, ry, a, z1), outN);
    const ih = hw - thick, iy = ry - thick;
    quadFace(v, P(ih, iy, a, z0), P(ih, iy, b, z0), P(ih, iy, b, z1), P(ih, iy, a, z1), scale(outN, -1));
    quadFace(v, P(hw, ry, a, z0), P(hw, ry, b, z0), P(ih, iy, b, z0), P(ih, iy, a, z0), [0, 0, -1]);
    quadFace(v, P(hw, ry, a, z1), P(hw, ry, b, z1), P(ih, iy, b, z1), P(ih, iy, a, z1), [0, 0, 1]);
  }
  for (const th of [0, Math.PI]) {
    quadFace(v, P(hw, ry, th, z0), P(hw - thick, ry - thick, th, z0), P(hw - thick, ry - thick, th, z1), P(hw, ry, th, z1), [0, -1, 0]);
  }
  return {mat, vertices: v};
}

/**
 * Five-storey pagoda: a chamfered base, five storeys each moving as one (wall, windows, roof, lip), and a long sōrin
 * of a half-round mast, a tray, nine separate rings and a jewel. Storeys still wake one after another.
 */
export function meshPagoda(id, cx, zBase, {storeys = 5, halfW = 66, taper = 6.5, pitch = 40, layer = 2} = {}) {
  const parts = [];
  const base = part(`${id}-base`, KIND.tier, layer, MAT.kirigin, [cx, zBase + 10], {group: id, order: 0});
  const basePoly = [[cx - halfW * .95, zBase], [cx + halfW * .95, zBase], [cx + halfW * 1.04, zBase + 9], [cx - halfW * 1.04, zBase + 9]];
  base.fills.push({d: basePoly, soft: .2, crisp: .9});
  base.mesh = [extrudeConvex(chamferConvex(basePoly, .6), 0, 8, MAT.kirigin)];
  parts.push(base);
  for (let i = 0; i < storeys; i++) {
    const w = halfW - i * taper, zEave = zBase - 17 - i * pitch, order = i + 1, wallId = `${id}-wall-${i}`;
    parts.push(...meshStorey(wallId, cx, zEave + 1, zEave + 18, w * .5, {layer, group: id, order}));
    parts.push(...meshRoof(`${id}-roof-${i}`, cx, zEave, w, i === storeys - 1 ? 25 : 19,
      {layer, group: id, order, ridgeHalf: w * (i === storeys - 1 ? .05 : .46), tiles: 13 - i, motionWith: wallId}));
  }
  const top = zBase - 17 - (storeys - 1) * pitch - 25;
  const finial = part(`${id}-finial`, KIND.tier, layer, MAT.hyomonGold, [cx, top], {group: id, order: storeys + 1, motionWith: `${id}-wall-${storeys - 1}`});
  const g = MAT.hyomonGold, mesh = [];
  mesh.push(sweepHalfTube([[cx, top + 1, 1.1], [cx, top - 45, .82], [cx, top - 90, .55]], {heightRatio: .9, mat: g, sides: 12}));
  finial.fills.push({d: [[cx - 1.1, top + 1], [cx + 1.1, top + 1], [cx + .55, top - 90], [cx - .55, top - 90]], soft: 0, crisp: 1});
  mesh.push(box(cx - 6, cx + 6, top - 4, top, 0, 3.5, g, .3));
  finial.fills.push({d: rect(cx - 6, cx + 6, top - 4, top), soft: 0, crisp: 1});
  for (let k = 0; k < 9; k++) {
    const zc = top - 12 - k * 6.2, hw = 6.2 - k * .42;
    mesh.push(sorinRing(cx, zc, hw, 2.5, 1.1, .65, g));
    finial.fills.push({d: rect(cx - hw, cx + hw, zc - .55, zc + .55), soft: 0, crisp: 1});
  }
  const jc = top - 79;
  mesh.push(sweepHalfTube(Array.from({length: 9}, (_, j) => {
    const z = jc + 2 - j * .5 * 2, f = (z - jc) / 4.2;
    return [cx, z, Math.max(.35, 2.6 * Math.sqrt(Math.max(0, 1 - f * f)))];
  }), {heightRatio: 1, mat: g, sides: 12}));
  finial.fills.push({d: Array.from({length: 12}, (_, j) => [cx + 2.6 * Math.cos(j * Math.PI / 6), jc + 2 * Math.sin(j * Math.PI / 6)]), soft: 0, crisp: 1});
  finial.mesh = mesh;
  parts.push(finial);
  return parts;
}

/**
 * Rōmon: the lower storey is a frame of four posts with head and foot beams and three open bays; a short transom
 * board at the head of each bay keeps the light. A railed balcony, the upper storey and the roof stand on it.
 */
export function meshRomon(id, cx, zBase, halfW, {layer = 2} = {}) {
  const group = id, waist = zBase - halfW * .5, zEave = waist - 6 - halfW * .3, lw = halfW * .78;
  const lower = part(`${id}-lower`, KIND.tier, layer, MAT.lacquer, [cx, zBase], {group, order: 0, rigidGroup: true});
  const lm = [];
  for (let i = 0; i <= 3; i++) {
    const x = lerp(cx - lw, cx + lw, i / 3);
    lm.push(box(x - 2.25, x + 2.25, waist, zBase, 0, 8, MAT.gold, .4));
    lower.fills.push({d: rect(x - 2.25, x + 2.25, waist, zBase), soft: 0, crisp: 1});
  }
  for (const [z0, z1, y1] of [[waist, waist + 4, 7], [zBase - 2, zBase, 6]]) {
    lm.push(box(cx - lw - 2.25, cx + lw + 2.25, z0, z1, 0, y1, MAT.lacquer, .3));
    lower.fills.push({d: rect(cx - lw - 2.25, cx + lw + 2.25, z0, z1), soft: 0, crisp: 1});
  }
  lower.mesh = lm;
  const lamp = part(`${id}-lower-lamp`, KIND.tier, layer, MAT.lamp, [cx, zBase], {group, order: 0, motionWith: lower.id});
  const bay = lw * 2 / 3, h = Math.min(4, (zBase - waist) * .5), lmp = [];
  for (let i = 0; i < 3; i++) {
    const x0 = cx - lw + bay * i + bay * .2, x1 = x0 + bay * .6;
    lmp.push(box(x0, x1, waist + 4, waist + 4 + h, 0, 6.5, MAT.lamp, .2));
    lamp.fills.push({d: rect(x0, x1, waist + 4, waist + 4 + h), soft: 0, crisp: .3});
  }
  lamp.mesh = lmp;

  const balcony = part(`${id}-balcony`, KIND.tier, layer, MAT.kirigin, [cx, waist], {group, order: 1});
  const deck = [[cx - halfW * .92, waist - 6], [cx + halfW * .92, waist - 6], [cx + halfW * .86, waist + 1.5], [cx - halfW * .86, waist + 1.5]];
  balcony.fills.push({d: deck, soft: .2, crisp: .9});
  const bm = [extrudeConvex(chamferConvex(deck, .4), 0, 6, MAT.kirigin)];
  const rx0 = cx - halfW * .92, rx1 = cx + halfW * .92, zf = waist - 6;
  bm.push(box(rx0, rx1, zf - 8, zf - 6.4, 6.5, 9, MAT.kirigin, .2));
  bm.push(box(rx0, rx1, zf - 4.9, zf - 3.1, 6.5, 8.8, MAT.kirigin, .2));
  balcony.fills.push({d: rect(rx0, rx1, zf - 8, zf - 6.4), soft: 0, crisp: 1}, {d: rect(rx0, rx1, zf - 4.9, zf - 3.1), soft: 0, crisp: 1});
  const n = Math.max(2, Math.round((rx1 - rx0) / (halfW * .2)));
  for (let i = 0; i <= n; i++) {
    const x = lerp(rx0 + .8, rx1 - .8, i / n);
    bm.push(box(x - .8, x + .8, zf - 8, zf, 6.3, 8.6, MAT.kirigin, .15));
    balcony.fills.push({d: rect(x - .8, x + .8, zf - 8, zf), soft: 0, crisp: 1});
  }
  balcony.mesh = bm;
  return [
    lower, lamp,
    ...meshStorey(`${id}-upper`, cx, zEave + 1, waist - 6, halfW * .66, {bays: 3, layer, group, order: 2}),
    balcony,
    ...meshRoof(`${id}-roof`, cx, zEave, halfW, halfW * .46, {layer, group, order: 3, ridgeHalf: halfW * .5, tiles: 19, upturn: halfW * .07}),
  ];
}

/** Sanmon: two square posts carry the upper storey and roof; the passage between them stays open. */
export function meshSanmon(id, cx, zBase, halfW) {
  const p = part(`${id}-posts`, KIND.tier, 2, MAT.gold, [cx, zBase], {group: id, rigidGroup: true});
  const mesh = [];
  for (const side of [-1, 1]) {
    const x = cx + side * halfW * .65, z0 = zBase - halfW * .85;
    mesh.push(box(x - 5, x + 5, z0, zBase, 0, 8, MAT.gold, .6));
    p.fills.push({d: rect(x - 5, x + 5, z0, zBase), soft: .25, crisp: .8});
  }
  p.mesh = mesh;
  return [p,
    ...meshStorey(`${id}-upper`, cx, zBase - halfW * .86, zBase - halfW * .57, halfW * .73, {group: id, order: 1, bays: 3, windowMat: MAT.lacquer}),
    ...meshRoof(`${id}-roof`, cx, zBase - halfW * .88, halfW, halfW * .42, {group: id, order: 2, ridgeHalf: halfW * .5}),
  ];
}

/**
 * Karamon: square posts and a lintel, two closed lacquer leaves with a dark seam and twelve flat studs, and a
 * cusped gable band standing proud of a thinner gable board, so the bargeboard reads as a line, not a slab.
 */
export function meshKaramon(id, cx, zBase, halfW = 66) {
  const s = halfW / 66, P = (x, h) => [cx + x * s, zBase - h * s];
  const frame = part(`${id}-frame`, KIND.tier, 2, MAT.gold, [cx, zBase], {group: id, rigidGroup: true});
  const fm = [];
  for (const x of [-39, 39]) {
    const [x0, z1] = P(x - 5, 0), [x1, z0] = P(x + 5, 61);
    fm.push(box(x0, x1, z0, z1, 0, 9, MAT.gold, .6));
    frame.fills.push({d: [P(x - 5, 0), P(x + 5, 0), P(x + 5, 61), P(x - 5, 61)], soft: .2, crisp: .8});
  }
  { const [x0, z1] = P(-45, 49), [x1, z0] = P(45, 64); fm.push(box(x0, x1, z0, z1, 0, 9, MAT.gold, .6)); }
  frame.fills.push({d: [P(-45, 49), P(45, 49), P(45, 64), P(-45, 64)], soft: .2, crisp: .8});
  fm.push(ribbonMesh([P(-19, 56), P(-8, 61), P(0, 55), P(8, 61), P(19, 56)].map(([x, z]) => [x, 9, z]), 1.4, .3, MAT.hyomonGold));
  frame.mesh = fm;

  const cap = part(`${id}-gable`, KIND.tier, 2, MAT.gold, [cx, zBase], {group: id, order: 1});
  const curve = [], lower = [];
  for (let i = 0; i <= 48; i++) {
    const u = i / 24 - 1, h = 72 + 31 * Math.exp(-u * u * 6) + 8 * Math.pow(Math.abs(u), 8);
    curve.push(P(u * 66, h)); lower.push(P(u * 66, h - 13));
  }
  cap.fills.push({d: [...curve, P(66, 59), P(-66, 59)], soft: .2, crisp: .9});
  const idx = a => Math.round(a * 48);
  cap.mesh = [
    gridSlab((a, w) => { const c = curve[idx(a)], l = lower[idx(a)]; return [c[0], 12, lerp(c[1], l[1], w)]; }, 48, 2, 3, MAT.gold),
    gridSlab((a, w) => { const l = lower[idx(a)], b = P((idx(a) / 24 - 1) * 66, 59); return [l[0], 8, lerp(l[1], b[1], w)]; }, 48, 2, 2, MAT.gold),
    ribbonMesh(curve.map(([x, z]) => [x, 12, z + 5 * s]), 1, .25, MAT.hyomonGold),
  ];

  const doors = part(`${id}-doors`, KIND.tier, 2, MAT.lacquer, [cx, zBase], {group: id});
  doors.fills.push({d: [P(-34, 0), P(34, 0), P(34, 50), P(-34, 50)], soft: 0, crisp: .5});
  const [, zb] = P(0, 0), [, zt] = P(0, 50), dm = [];
  dm.push(box(P(-34, 0)[0], P(-.6, 0)[0], zt, zb, 0, 6, MAT.lacquer, .4));
  dm.push(box(P(.6, 0)[0], P(34, 0)[0], zt, zb, 0, 6, MAT.lacquer, .4));
  dm.push(box(P(-.6, 0)[0], P(.6, 0)[0], zt, zb, 0, 2.5, MAT.lacquer, .1));
  for (const x of [-22, -11, 11, 22]) for (const h of [12, 26, 40]) {
    const [x0, z0] = P(x - 1.6, h + .7), [x1, z1] = P(x + 1.6, h - .7);
    dm.push(box(x0, x1, z0, z1, 5.9, 6.25, MAT.hyomonGold, .15));
  }
  doors.mesh = dm;
  return [doors, frame, cap];
}

/**
 * Gallery: an open gallery is a frame of posts on a plinth under a head beam, every bay open to the ground; a closed
 * one is a flat wall with fine engraved joints. The body carries the roof and lip. `rigidGroup` makes the body
 * the root of its whole group (a run of galleries and a gate standing on one foot line).
 */
export function meshCorridor(id, x0, x1, zBase, {height = 26, open = true, group = id, order = 0, rigidGroup = false} = {}) {
  const cx = (x0 + x1) / 2, w = (x1 - x0) / 2, mat = open ? MAT.lacquer : MAT.nashijiLight;
  const body = part(`${id}-body`, KIND.tier, 2, mat, [cx, zBase], {group, order, ...(rigidGroup ? {rigidGroup: true} : {})});
  const bays = Math.max(2, Math.round((x1 - x0) / 22)), zTop = zBase - height, mesh = [];
  if (open) {
    const pw = height < 22 ? 2.8 : 3.2;
    for (let i = 0; i <= bays; i++) {
      const x = lerp(x0 + pw / 2, x1 - pw / 2, i / bays);
      mesh.push(box(x - pw / 2, x + pw / 2, zTop, zBase, 0, 6, mat, .3));
      body.fills.push({d: rect(x - pw / 2, x + pw / 2, zTop, zBase), soft: 0, crisp: 1});
    }
    for (const [z0, z1, y1] of [[zTop, zTop + 2.5, 6.4], [zBase - 2.5, zBase, 5.2]]) {
      mesh.push(box(x0, x1, z0, z1, 0, y1, mat, .3));
      body.fills.push({d: rect(x0, x1, z0, z1), soft: 0, crisp: 1});
    }
  } else {
    mesh.push(box(x0 + 5, x1 - 5, zTop, zBase, 0, 6, mat, .4));
    body.fills.push({d: rect(x0 + 5, x1 - 5, zTop, zBase), soft: .15, crisp: .6});
    for (let i = 0; i <= bays; i++) {
      const x = lerp(x0 + 6, x1 - 6, i / bays);
      mesh.push(ribbonMesh([[x, 6, zTop + .6], [x, 6, zBase - .6]], .65, .15, mat));
    }
  }
  body.mesh = mesh;
  return [body, ...meshRoof(`${id}-roof`, cx, zTop, w, 11, {group, order: order + 1, ridgeHalf: w * .82, upturn: 3, tiles: bays * 2, motionWith: body.id})];
}
