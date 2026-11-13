// Explicit 3D builders for torii and kakezukuri (Kiyomizu stage).
// Pure geometry returning plate parts with `mesh` + projected picking `fills`, zero `thick`.
import {MAT, KIND} from './vocab.js';
import {extrudeConvex, sweepHalfTube, ribbonMesh} from './mesh-geometry.js';

const lerp = (a, b, t) => a + (b - a) * t;
const quad = (a, c, b, n = 10) => Array.from({length: n + 1}, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
});
const part = (id, kind, layer, mat, anchor, extra = {}) => ({
  id, kind, group: id, order: 0, layer, mat, reach: .7, thick: 0, bias: 0, anchor, fills: [], lines: [], ...extra,
});

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

/**
 * Builds a closed prism between two corresponding curves `upper[i]` (smaller z) and `lower[i]` (larger z)
 * extruded vertically from `y0` to `y1`.
 */
function stripPrism(upper, lower, y0, y1, mat) {
  const vertices = [];
  const pushTri = (a, b, c, n, uva, uvb, uvc) => vertices.push(
    a[0], a[1], a[2], n[0], n[1], n[2], uva[0], uva[1],
    b[0], b[1], b[2], n[0], n[1], n[2], uvb[0], uvb[1],
    c[0], c[1], c[2], n[0], n[1], n[2], uvc[0], uvc[1],
  );
  const pushQuad = (a, b, c, d, n, uva, uvb, uvc, uvd) => {
    pushTri(a, b, c, n, uva, uvb, uvc);
    pushTri(a, c, d, n, uva, uvc, uvd);
  };
  let runL = 0, runU = 0;
  for (let i = 0; i < upper.length - 1; i++) {
    const u0 = upper[i], u1 = upper[i + 1], l0 = lower[i], l1 = lower[i + 1];
    // Top (+y) & bottom (-y)
    pushQuad([u0[0], y1, u0[1]], [l0[0], y1, l0[1]], [l1[0], y1, l1[1]], [u1[0], y1, u1[1]], [0, 1, 0], u0, l0, l1, u1);
    pushQuad([u0[0], y0, u0[1]], [u1[0], y0, u1[1]], [l1[0], y0, l1[1]], [l0[0], y0, l0[1]], [0, -1, 0], u0, u1, l1, l0);
    // Lower/front wall
    const ldx = l1[0] - l0[0], ldz = l1[1] - l0[1], lLen = Math.hypot(ldx, ldz);
    pushQuad([l0[0], y0, l0[1]], [l1[0], y0, l1[1]], [l1[0], y1, l1[1]], [l0[0], y1, l0[1]],
      [-ldz / lLen, 0, ldx / lLen], [runL, y0], [runL + lLen, y0], [runL + lLen, y1], [runL, y1]);
    runL += lLen;
    // Upper/back wall
    const udx = u1[0] - u0[0], udz = u1[1] - u0[1], uLen = Math.hypot(udx, udz);
    pushQuad([u1[0], y0, u1[1]], [u0[0], y0, u0[1]], [u0[0], y1, u0[1]], [u1[0], y1, u1[1]],
      [udz / uLen, 0, -udx / uLen], [runU + uLen, y0], [runU, y0], [runU, y1], [runU + uLen, y1]);
    runU += uLen;
  }
  // Left & right end caps
  const l0 = lower[0], u0 = upper[0], lx = u0[0] - l0[0], lz = u0[1] - l0[1], lL = Math.hypot(lx, lz);
  pushQuad([l0[0], y0, l0[1]], [l0[0], y1, l0[1]], [u0[0], y1, u0[1]], [u0[0], y0, u0[1]],
    [lz / lL, 0, -lx / lL], [0, y0], [0, y1], [lL, y1], [lL, y0]);
  const uE = upper.at(-1), lE = lower.at(-1), rx = lE[0] - uE[0], rz = lE[1] - uE[1], rL = Math.hypot(rx, rz);
  pushQuad([uE[0], y0, uE[1]], [uE[0], y1, uE[1]], [lE[0], y1, lE[1]], [lE[0], y0, lE[1]],
    [rz / rL, 0, -rx / rL], [0, y0], [0, y1], [rL, y1], [rL, y0]);
  return {mat, vertices};
}

/**
 * Evaluates the surface height y of a tapered semi-elliptical post (`sweepHalfTube` with `baseY = 0`)
 * at world XZ point `[px, pz]`, matching its `sides`-segment polygonal cross-section.
 */
function postSurfaceY(x0, z0, r0, x1, z1, r1, heightRatio, sides, px, pz) {
  const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
  const tx = dx / len, tz = dz / len, nx = -tz, nz = tx;
  const vx = px - x0, vz = pz - z0;
  const u = Math.max(0, Math.min(1, (vx * tx + vz * tz) / len));
  const d = vx * nx + vz * nz;
  const r = lerp(r0, r1, u);
  const c = Math.max(-1, Math.min(1, d / r));
  const j = Math.min(sides - 1, Math.floor(Math.acos(c) / Math.PI * sides));
  const t0 = j / sides * Math.PI, t1 = (j + 1) / sides * Math.PI;
  const c0 = Math.cos(t0), c1 = Math.cos(t1);
  const w = Math.abs(c0 - c1) > 1e-9 ? (c0 - c) / (c0 - c1) : 0;
  return r * heightRatio * lerp(Math.sin(t0), Math.sin(t1), w);
}

/**
 * Explicit-mesh Myōjin torii: tapered semi-elliptical posts with surface gold bands, chamfered stone feet and nuki tie beam,
 * 24-segment curved kasagi with surface gold ribbon, optional gakuzuka (s >= 1) and silver cap lip.
 */
export function meshTorii(id, cx, zFoot, s = 1, {layer = 2, group = id, order = 0, mat = MAT.gold, cap = false} = {}) {
  const P = (dx, h) => [cx + dx * s, zFoot - h * s];
  const p = part(id, KIND.tier, layer, mat, [cx, zFoot], {group, order, reach: .7});
  const mesh = [];
  const r0 = 4.4 * s, r1 = 3.8 * s, heightRatio = .85, postSides = 12;

  for (const side of [-1, 1]) {
    const [x0, z0] = P(side * 36, 0), [x1, z1] = P(side * 32, 90);
    mesh.push(sweepHalfTube([[x0, z0, r0], [x1, z1, r1]], {heightRatio, baseY: 0, mat, sides: postSides}));
    p.fills.push({d: [P(side * 36 - 4.4, 0), P(side * 36 + 4.4, 0), P(side * 32 + 3.8, 90), P(side * 32 - 3.8, 90)], soft: 0, crisp: 1});

    const [lx0, lz0] = P(side * 36, 9), [lx1, lz1] = P(side * 32.6, 52);
    const postBand = Array.from({length: 13}, (_, k) => {
      const t = k / 12, px = lerp(lx0, lx1, t), pz = lerp(lz0, lz1, t);
      return [px, postSurfaceY(x0, z0, r0, x1, z1, r1, heightRatio, postSides, px, pz), pz];
    });
    mesh.push(ribbonMesh(postBand, .7 * s, .15 * s, MAT.hyomonGold));

    const footPoly = [P(side * 36 - 7.5, 0), P(side * 36 + 7.5, 0), P(side * 36 + 5.8, 7), P(side * 36 - 5.8, 7)];
    mesh.push(extrudeConvex(chamferConvex(footPoly, .5 * s), 0, 4 * s, mat));
    p.fills.push({d: footPoly, soft: 0, crisp: 1});
  }

  // Nuki tie beam (continuous through both posts, no joint spheres)
  const [nx0, nz0] = P(-47, 60), [nx1, nz1] = P(47, 53);
  mesh.push(extrudeConvex(chamferBox(nx0, nx1, nz0, nz1, .4 * s), .6 * s, 5.8 * s, mat));
  p.fills.push({d: [P(-47, 53), P(47, 53), P(47, 60), P(-47, 60)], soft: 0, crisp: 1});

  // Gakuzuka center strut only on large gates (s >= 1)
  if (s >= 1) {
    const [sx0, sz0] = P(-3.6, 90), [sx1, sz1] = P(3.6, 60);
    mesh.push(extrudeConvex(chamferBox(sx0, sx1, sz0, sz1, .3 * s), 0, 4.5 * s, mat));
    p.fills.push({d: [P(-3.6, 60), P(3.6, 60), P(3.6, 90), P(-3.6, 90)], soft: 0, crisp: 1});
  }

  // Kasagi curved lintel (24 segments between lower and upper quadratic curves)
  const kLow = quad(P(-53, 94), P(0, 83), P(53, 94), 24);
  const kUp = quad(P(-58, 104), P(0, 91), P(58, 104), 24);
  mesh.push(stripPrism(kUp, kLow, 1 * s, 7 * s, mat));
  p.fills.push({d: [...kLow, ...[...kUp].reverse()], soft: 0, crisp: 1});

  // Surface gold band along kasagi
  const bandPts = quad(P(-54, 98.5), P(0, 86.5), P(54, 98.5), 24).map(([x, z]) => [x, 7 * s, z]);
  mesh.push(ribbonMesh(bandPts, .7 * s, .15 * s, MAT.hyomonGold));
  p.mesh = mesh;

  if (!cap) return [p];
  const lip = part(`${id}-lip`, KIND.tier, layer, MAT.silver, [cx, zFoot], {group, order, reach: .5, motionWith: id});
  const lUp = quad(P(-58, 104), P(0, 91), P(58, 104), 24);
  const lLow = quad(P(-58.6, 100.6), P(0, 87.6), P(58.6, 100.6), 24);
  lip.mesh = [stripPrism(lUp, lLow, 7.15 * s, 7.65 * s, MAT.silver)];
  lip.fills.push({d: [...lUp, ...[...lLow].reverse()], soft: 0, crisp: 1});
  return [p, lip];
}

/**
 * Explicit-mesh kakezukuri stage: chamfered posts & ties with crisp open apertures,
 * chamfered deck slab, and a dedicated solid silver railing with embedded balusters.
 */
export function meshKakezukuri(id, x0, x1, zDeck, zGround, {layer = 2, group = id, order = 0, posts = 9, ties = 3} = {}) {
  const cx = (x0 + x1) / 2;
  const frame = part(`${id}-frame`, KIND.tier, layer, MAT.gold, [cx, zGround], {group, order, reach: .7, rigidGroup: true});
  const frameMesh = [];

  for (let i = 0; i < posts; i++) {
    const x = lerp(x0 + 4, x1 - 4, i / (posts - 1));
    const poly = [[x - 2.6, zDeck + 4], [x + 2.6, zDeck + 4], [x + 3, zGround], [x - 3, zGround]];
    frameMesh.push(extrudeConvex(chamferConvex(poly, .45), 0, 7, MAT.gold));
    frame.fills.push({d: poly, soft: 0, crisp: 1});
  }
  for (let k = 1; k <= ties; k++) {
    const z = lerp(zDeck + 5, zGround, k / (ties + 1));
    frameMesh.push(extrudeConvex(chamferBox(x0 - 4, x1 + 4, z - 1.8, z + 1.8, .3), 1, 6.5, MAT.gold));
    frame.fills.push({d: [[x0 - 4, z - 1.8], [x1 + 4, z - 1.8], [x1 + 4, z + 1.8], [x0 - 4, z + 1.8]], soft: 0, crisp: 1});
  }
  frame.mesh = frameMesh;

  const deck = part(`${id}-deck`, KIND.tier, layer, MAT.kirigin, [cx, zGround], {group, order: order + 1, reach: .6});
  const slabPoly = [[x0 - 9, zDeck - 3], [x1 + 9, zDeck - 3], [x1 + 7, zDeck + 5], [x0 - 7, zDeck + 5]];
  const deckMesh = [
    extrudeConvex(chamferConvex(slabPoly, .6), 0, 10, MAT.kirigin),
    ribbonMesh([[x0 - 8, 10, zDeck + 1], [x1 + 8, 10, zDeck + 1]], .7, .15, MAT.hyomonSilver),
  ];
  deck.fills.push({d: slabPoly, soft: 0, crisp: 1});

  // Dedicated kakezukuri railing along zFloor = zDeck - 3
  const rx0 = x0 - 9, rx1 = x1 + 9, zFloor = zDeck - 3, railH = 10, gap = 13;
  deckMesh.push(extrudeConvex(chamferBox(rx0, rx1, zFloor - railH, zFloor - railH + 2.2, .25), 6.8, 9.8, MAT.kirigin));
  deck.fills.push({d: [[rx0, zFloor - railH], [rx1, zFloor - railH], [rx1, zFloor - railH + 2.2], [rx0, zFloor - railH + 2.2]], soft: 0, crisp: 1});

  const n = Math.max(2, Math.round((rx1 - rx0) / gap));
  for (let i = 0; i <= n; i++) {
    const x = lerp(rx0 + .9, rx1 - .9, i / n);
    deckMesh.push(extrudeConvex(chamferBox(x - .9, x + .9, zFloor - railH + 1.9, zFloor + .3, .2), 6.6, 9.6, MAT.kirigin));
    deck.fills.push({d: [[x - .9, zFloor - railH], [x + .9, zFloor - railH], [x + .9, zFloor], [x - .9, zFloor]], soft: 0, crisp: 1});
  }
  deck.mesh = deckMesh;
  return [frame, deck];
}
