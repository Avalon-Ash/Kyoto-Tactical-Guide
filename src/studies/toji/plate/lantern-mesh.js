// Explicit 3D builder for stone lanterns: chamfered stepped base, slender semi-elliptical shaft,
// mid-platform, recessed four-frame fire-box with lacquer backing and cut-gold window, hexagonal cap, and hoju finial.
import {MAT, KIND} from './vocab.js';
import {extrudeConvex, sweepHalfTube, ribbonMesh} from './mesh-geometry.js';

const CAP_RING = [
  [-35, 0, 53],
  [-17.5, -6, 48],
  [17.5, -6, 48],
  [35, 0, 53],
  [17.5, 6, 48],
  [-17.5, 6, 48],
];
const CAP_APEX = [0, 0, 63];
const CAP_THICK = 2.2;

function faceNormal(a, b, c) {
  const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
  const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];
  const nx = aby * acz - abz * acy;
  const ny = abz * acx - abx * acz;
  const nz = abx * acy - aby * acx;
  const len = Math.hypot(nx, ny, nz);
  return [nx / len, ny / len, nz / len];
}

function pushTri(out, a, b, c, n, uva, uvb, uvc) {
  out.push(
    a[0], a[1], a[2], n[0], n[1], n[2], uva[0], uva[1],
    b[0], b[1], b[2], n[0], n[1], n[2], uvb[0], uvb[1],
    c[0], c[1], c[2], n[0], n[1], n[2], uvc[0], uvc[1],
  );
}

function pushQuad(out, a, b, c, d, n, uva, uvb, uvc, uvd) {
  pushTri(out, a, b, c, n, uva, uvb, uvc);
  pushTri(out, a, c, d, n, uva, uvc, uvd);
}

/** Chamfers every corner of a convex 2D polygon by at most `chamfer` units. */
function chamferConvex(pts, chamfer) {
  if (!(chamfer > 0)) return pts;
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

const chamferBox = (x0, x1, z0, z1, chamfer) => chamferConvex([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], chamfer);

const CAP_EMBED = .4;
const capBottomH = (a, yLocal) => {
  const d = yLocal - 7;
  return (CAP_APEX[2] - CAP_THICK) - Math.max(2.5 * Math.abs(d), (2 / 7) * Math.abs(a) + (5 / 3) * Math.abs(d));
};

/**
 * Extrudes a CCW polygon in `(yLocal, h)` along `[x + a0*s, x + a1*s]`.
 */
function extrudeAlongX(a0, a1, polyYH, x, z, s, mat) {
  const x0 = x + a0 * s, x1 = x + a1 * s;
  const L = polyYH.map(([y, h]) => [x0, y * s, z - h * s]);
  const R = polyYH.map(([y, h]) => [x1, y * s, z - h * s]);
  const vertices = [];
  for (let k = 1; k < polyYH.length - 1; k++) {
    pushTri(vertices, L[0], L[k], L[k + 1], [-1, 0, 0], polyYH[0], polyYH[k], polyYH[k + 1]);
    pushTri(vertices, R[0], R[k + 1], R[k], [1, 0, 0], polyYH[0], polyYH[k + 1], polyYH[k]);
  }
  for (let i = 0; i < polyYH.length; i++) {
    const j = (i + 1) % polyYH.length;
    const n = faceNormal(L[i], R[i], R[j]);
    const len = Math.hypot(polyYH[j][0] - polyYH[i][0], polyYH[j][1] - polyYH[i][1]) * s;
    pushQuad(vertices, L[i], R[i], R[j], L[j], n, [0, 0], [x1 - x0, 0], [x1 - x0, len], [0, len]);
  }
  return {mat, vertices};
}

/**
 * Builds the upper fire-box beam (`h=47..49`, `.3*s` top chamfer) trimmed along the back slope
 * so its top never exceeds `min(49, capBottomH + 0.4)` and leaves no material where `capBottomH + 0.4 <= 47`.
 */
function upperFrameMesh(x, z, s, mat) {
  const prof = [[-14, 47], [14, 47], [14, 48.7], [13.7, 49], [-13.7, 49], [-14, 48.7]];
  const toXYZ = (a, yLocal, h) => [x + a * s, yLocal * s, z - h * s];
  const B = prof.map(([a, h]) => toXYZ(a, 1.32 + .4 * (h - 47), h));
  const F = prof.map(([a, h]) => toXYZ(a, 8, h));
  const vertices = [];

  for (let k = 1; k < prof.length - 1; k++) {
    pushTri(vertices, F[0], F[k], F[k + 1], [0, 1, 0], prof[0], prof[k], prof[k + 1]);
    pushTri(vertices, B[0], B[k + 1], B[k], faceNormal(B[0], B[k + 1], B[k]), prof[0], prof[k + 1], prof[k]);
  }
  for (let i = 0; i < prof.length; i++) {
    const j = (i + 1) % prof.length;
    const n = faceNormal(B[i], B[j], F[j]);
    pushQuad(vertices, B[i], B[j], F[j], F[i], n, [0, 0], [1, 0], [1, 1], [0, 1]);
  }
  return {mat, vertices};
}

/**
 * Builds the hidden support under the cap (`a = ±11.5*s`, `y = 2.12..8*s`, `hBot = 48.6*s`).
 * Top facets align with `hexCapMesh` creases so every triangle meets `capBottomH + 0.4*s` exactly.
 */
function capSupportMesh(x, z, s, mat) {
  const w = 11.5, y0 = 2.12, yK = 7 - w * 6 / 17.5, yC = 7, y1 = 8, aF = 17.5 / 6, hBot = 48.6;
  const topPt = ([a, y]) => [x + a * s, y * s, z - (capBottomH(a, y) + CAP_EMBED) * s];
  const botPt = ([a, y]) => [x + a * s, y * s, z - hBot * s];

  const pBL0 = [-w, y0], pBR0 = [w, y0];
  const pBLk = [-w, yK], pBRk = [w, yK];
  const pML = [-w, yC], pAp = [0, yC], pMR = [w, yC];
  const pFL = [-w, y1], pFLc = [-aF, y1], pFRc = [aF, y1], pFR = [w, y1];

  const tris = [
    [pBL0, pBLk, pBRk], [pBL0, pBRk, pBR0],
    [pBLk, pML, pAp], [pBLk, pAp, pBRk], [pBRk, pAp, pMR],
    [pML, pFL, pAp], [pAp, pFL, pFLc], [pAp, pFLc, pFRc], [pAp, pFRc, pFR], [pAp, pFR, pMR],
  ];
  const vertices = [];
  for (const [a, b, c] of tris) {
    const ta = topPt(a), tb = topPt(b), tc = topPt(c);
    pushTri(vertices, ta, tb, tc, faceNormal(ta, tb, tc), a, b, c);
    pushTri(vertices, botPt(a), botPt(c), botPt(b), [0, 0, 1], a, c, b);
  }
  const perim = [pBL0, pBLk, pML, pFL, pFLc, pFRc, pFR, pMR, pBRk, pBR0];
  for (let i = 0; i < perim.length; i++) {
    const p0 = perim[i], p1 = perim[(i + 1) % perim.length];
    const b0 = botPt(p0), b1 = botPt(p1), t1 = topPt(p1), t0 = topPt(p0);
    pushQuad(vertices, b0, b1, t1, t0, faceNormal(b0, b1, t1), [0, 0], [1, 0], [1, 1], [0, 1]);
  }
  return {mat, vertices};
}

/**
 * Builds the closed 6-faceted hexagonal roof shell from fixed `[a, d, h]` coordinates.
 * Top uses 6 fan triangles; bottom shifts every `h` by `-2.2` with reversed winding; 6 side quads seal the rim.
 */
export function hexCapMesh(x, z, s, mat = MAT.gold) {
  const toXYZ = ([a, d, h]) => [x + a * s, (7 + d) * s, z - h * s];
  const topRim = CAP_RING.map(toXYZ);
  const topApex = toXYZ(CAP_APEX);
  const botRim = CAP_RING.map(([a, d, h]) => toXYZ([a, d, h - CAP_THICK]));
  const botApex = toXYZ([CAP_APEX[0], CAP_APEX[1], CAP_APEX[2] - CAP_THICK]);
  const vertices = [];

  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    const t0 = topRim[i], t1 = topRim[j];
    const b0 = botRim[i], b1 = botRim[j];

    // Top fan (outward normal points toward -z and outward along the slope)
    const topN = faceNormal(topApex, t1, t0);
    pushTri(vertices, topApex, t1, t0, topN, [0, 0], [t1[0] - x, t1[2] - z], [t0[0] - x, t0[2] - z]);

    // Bottom fan (reversed winding so normal points into underside +z)
    const botN = faceNormal(botApex, b0, b1);
    pushTri(vertices, botApex, b0, b1, botN, [0, 0], [b0[0] - x, b0[2] - z], [b1[0] - x, b1[2] - z]);

    // Side quad sealing rim edge i -> j
    const sideN = faceNormal(t0, t1, b1);
    const edgeLen = Math.hypot(t1[0] - t0[0], t1[1] - t0[1], t1[2] - t0[2]);
    pushQuad(vertices, t0, t1, b1, b0, sideN, [0, 0], [edgeLen, 0], [edgeLen, CAP_THICK * s], [0, CAP_THICK * s]);
  }
  return {mat, vertices};
}

/**
 * Builds the finial hōju: a 4*s-wide cylindrical neck from h=62.5..70.3 and a 12×6 semi-ellipsoid
 * dome (half-width 4.5*s, height 6*s) peaking at h=76*s.
 */
export function hojuMesh(x, z, s, mat = MAT.gold) {
  const cy = 7 * s;
  const vertices = [];
  const segs = 12, stacks = 6;

  // Neck: 12-sided prism centered at [x, 7*s], width 4*s (radius 2*s), h = 62.5..70.3
  const nr = 2 * s, nz0 = z - 62.5 * s, nz1 = z - 70.3 * s;
  const nRing0 = [], nRing1 = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    nRing0.push([x + nr * ca, cy + nr * sa, nz0]);
    nRing1.push([x + nr * ca, cy + nr * sa, nz1]);
  }
  const nBotC = [x, cy, nz0], nTopC = [x, cy, nz1];
  for (let i = 0; i < segs; i++) {
    const j = (i + 1) % segs;
    const sideN = faceNormal(nRing0[i], nRing0[j], nRing1[j]);
    pushQuad(vertices, nRing0[i], nRing0[j], nRing1[j], nRing1[i], sideN, [i, 0], [i + 1, 0], [i + 1, 1], [i, 1]);
    pushTri(vertices, nBotC, nRing0[j], nRing0[i], [0, 0, 1], [0, 0], [1, 0], [0, 1]);
    pushTri(vertices, nTopC, nRing1[i], nRing1[j], [0, 0, -1], [0, 0], [1, 0], [0, 1]);
  }

  // Semi-ellipsoid dome: base at h=70, half-width 4.5*s, height 6*s, tip at h=76
  const rx = 4.5 * s, ry = 4.5 * s, rh = 6 * s, baseZ = z - 70 * s;
  const ptAt = (theta, phi) => {
    const cp = Math.cos(phi), sp = Math.sin(phi), ct = Math.cos(theta), st = Math.sin(theta);
    return [x + rx * cp * ct, cy + ry * cp * st, baseZ - rh * sp];
  };
  const normAt = (theta, phi) => {
    const cp = Math.cos(phi), sp = Math.sin(phi), ct = Math.cos(theta), st = Math.sin(theta);
    const nx = cp * ct / rx, ny = cp * st / ry, nz = -sp / rh;
    const len = Math.hypot(nx, ny, nz);
    return [nx / len, ny / len, nz / len];
  };
  const rings = [];
  for (let k = 0; k < stacks; k++) {
    const phi = (k / stacks) * (Math.PI / 2);
    const ring = [];
    for (let i = 0; i < segs; i++) {
      const theta = (i / segs) * Math.PI * 2;
      ring.push({pos: ptAt(theta, phi), norm: normAt(theta, phi), uv: [i / segs, k / stacks]});
    }
    rings.push(ring);
  }
  const tip = [x, cy, baseZ - rh];
  const baseCenter = [x, cy, baseZ];

  const pushVert = (v, n) => vertices.push(v[0], v[1], v[2], n[0], n[1], n[2], 0, 0);
  for (let k = 0; k < stacks - 1; k++) {
    for (let i = 0; i < segs; i++) {
      const j = (i + 1) % segs;
      const a = rings[k][i], b = rings[k][j], c = rings[k + 1][j], d = rings[k + 1][i];
      pushVert(a.pos, a.norm); pushVert(b.pos, b.norm); pushVert(c.pos, c.norm);
      pushVert(a.pos, a.norm); pushVert(c.pos, c.norm); pushVert(d.pos, d.norm);
    }
  }
  const topRing = rings[stacks - 1];
  for (let i = 0; i < segs; i++) {
    const j = (i + 1) % segs;
    const a = topRing[i], b = topRing[j];
    pushVert(a.pos, a.norm); pushVert(b.pos, b.norm); pushVert(tip, [0, 0, -1]);
  }
  const botRing = rings[0];
  for (let i = 0; i < segs; i++) {
    const j = (i + 1) % segs;
    pushTri(vertices, baseCenter, botRing[j].pos, botRing[i].pos, [0, 0, 1], [0, 0], [1, 0], [0, 1]);
  }
  return {mat, vertices};
}

/**
 * Explicit-mesh stone lantern: stepped chamfered base, slender tapered semi-elliptical shaft,
 * mid-platform, recessed four-frame fire-box with lacquer backing and recessed cut-gold window,
 * 6-faceted hexagonal cap, and finial hōju.
 */
export function meshLantern(id, x, z, s = 1) {
  if (typeof id !== 'string' || !id) throw new Error(`meshLantern: invalid id ${id}`);
  if (!Number.isFinite(x) || !Number.isFinite(z)) throw new Error(`meshLantern(${id}): non-finite position`);
  if (!Number.isFinite(s) || !(s > 0)) throw new Error(`meshLantern(${id}): scale s must be > 0 (got ${s})`);

  const P = (a, h) => [x + a * s, z - h * s];
  const part = (pid, layer, mat, extra = {}) => ({
    id: pid, kind: KIND.tier, group: id, order: 0, layer, mat, reach: .6, thick: 0, bias: 0, anchor: [x, z], fills: [], lines: [], ...extra,
  });

  const stoneId = `${id}-stone`;
  const stone = part(stoneId, 2, MAT.nashijiLight, {rigidGroup: true});
  const basePoly = [P(-22, 0), P(22, 0), P(18, 9), P(-18, 9)];
  const baseTopPoly = [P(-20, 1.5), P(20, 1.5), P(16, 7.5), P(-16, 7.5)];
  const midPoly = [P(-15, 29), P(15, 29), P(15, 33), P(-15, 33)];
  // Outer bottom/top corners chamfered .3*s while inner butt corners stay square at h=35 and h=47.
  const boxBotPoly = [P(-14, 33.3), P(-13.7, 33), P(13.7, 33), P(14, 33.3), P(14, 35), P(-14, 35)];
  const leftPillar = [P(-14, 35), P(-11.5, 35), P(-11.5, 47), P(-14, 47)];
  const rightPillar = [P(11.5, 35), P(14, 35), P(14, 47), P(11.5, 47)];
  // Back top edge is trimmed to capBottomH + 0.4 so pillars and lacquer backing never over-penetrate the cap.
  const pillarYH = [[1, 35], [8, 35], [8, 47], [1.32, 47], [1, 46.2]];
  const backingYH = [[1.05, 34.8], [2.7, 34.8], [2.7, 47.2], [1.4, 47.2], [1.05, 46.325]];

  stone.mesh = [
    extrudeConvex(chamferConvex(basePoly, .6 * s), 0, 8 * s, MAT.nashijiLight),
    extrudeConvex(chamferConvex(baseTopPoly, .6 * s), 8 * s, 9.2 * s, MAT.nashijiLight),
    ribbonMesh([[x - 15 * s, 9.2 * s, z - 4.5 * s], [x + 15 * s, 9.2 * s, z - 4.5 * s]], .6 * s, .15 * s, MAT.hyomonGold),
    sweepHalfTube([[x, z - 8 * s, 3.4 * s], [x, z - 31 * s, 2.8 * s]], {heightRatio: 1, baseY: 1.5 * s, mat: MAT.nashijiLight, sides: 12}),
    extrudeConvex(chamferBox(x - 15 * s, x + 15 * s, z - 33 * s, z - 29 * s, .5 * s), 1.5 * s, 7.5 * s, MAT.nashijiLight),
    ribbonMesh([[x - 14 * s, 7.5 * s, z - 31 * s], [x + 14 * s, 7.5 * s, z - 31 * s]], .6 * s, .15 * s, MAT.hyomonGold),
    extrudeConvex(boxBotPoly, 1 * s, 8 * s, MAT.nashijiLight),
    upperFrameMesh(x, z, s, MAT.nashijiLight),
    extrudeAlongX(-14, -11.5, pillarYH, x, z, s, MAT.nashijiLight),
    extrudeAlongX(11.5, 14, pillarYH, x, z, s, MAT.nashijiLight),
    extrudeAlongX(-11.8, 11.8, backingYH, x, z, s, MAT.lacquer),
    capSupportMesh(x, z, s, MAT.nashijiLight),
  ];
  for (const d of [
    basePoly,
    [P(-3.4, 8), P(3.4, 8), P(2.8, 31), P(-2.8, 31)],
    midPoly,
    [P(-14, 33), P(14, 33), P(14, 35), P(-14, 35)],
    [P(-14, 47), P(14, 47), P(14, 49), P(-14, 49)],
    leftPillar,
    rightPillar,
    [P(-11.5, 35), P(11.5, 35), P(11.5, 47), P(-11.5, 47)],
  ]) {
    stone.fills.push({d, soft: 0, crisp: 1});
  }

  const cap = part(`${id}-cap`, 2, MAT.gold, {order: 1, motionWith: stoneId});
  cap.mesh = [hexCapMesh(x, z, s, MAT.gold), hojuMesh(x, z, s, MAT.gold)];
  cap.fills.push(
    {d: [P(-35, 50.8), P(-17.5, 45.8), P(17.5, 45.8), P(35, 50.8), P(35, 53), P(0, 63), P(-35, 53)], soft: 0, crisp: 1},
    {d: [P(-4.5, 70), P(-2, 62.5), P(2, 62.5), P(4.5, 70), P(2.5, 74.5), P(0, 76), P(-2.5, 74.5)], soft: 0, crisp: 1},
  );

  const opening = part(`${id}-light`, 3, MAT.kirikane, {order: 1, motionWith: stoneId});
  const winPoly = [P(-9, 36), P(9, 36), P(9, 46), P(-9, 46)];
  opening.mesh = [extrudeConvex(winPoly, 2.71 * s, 3 * s, MAT.kirikane)];
  opening.fills.push({d: winPoly, soft: 0, crisp: 1});

  return [stone, cap, opening];
}
