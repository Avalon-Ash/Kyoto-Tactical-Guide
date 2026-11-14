// Explicit 3D builder for high-makie rocks (takamaki-e mound + kirikane/kirigin square tile mosaic).
// Pure geometry returning a plate part with `mesh` + original `fills`/`lines` for picking and bounds, zero `thick`.
import {MAT, KIND, rand} from './vocab.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v, fallback = [0, 1, 0]) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return l > 1e-12 ? [v[0] / l, v[1] / l, v[2] / l] : fallback;
};

function pushTri(out, a, b, c, hint, na, nb, nc) {
  const n = cross(sub(b, a), sub(c, a)), area = .5 * Math.hypot(n[0], n[1], n[2]);
  if (!(area > 1e-7)) return;
  let f = unit(n);
  if (dot(f, hint) < 0) {
    f = scale(f, -1);
    [b, c, nb, nc] = [c, b, nc, nb];
  }
  for (const [p, q] of [[a, na], [b, nb], [c, nc]]) {
    out.push(p[0], p[1], p[2], ...(q || f), p[0], p[2]);
  }
}

function pushQuad(out, a, b, c, d, hint, na, nb, nc, nd) {
  pushTri(out, a, b, c, hint, na, nb, nc);
  pushTri(out, a, c, d, hint, na, nc, nd);
}

function distSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
  const t = l2 > 1e-12 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 0;
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function distPoly(px, pz, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    best = Math.min(best, distSeg(px, pz, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  }
  return best;
}

function barycentricXZ(px, pz, a, b, c) {
  const det = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
  if (Math.abs(det) < 1e-10) return null;
  const l0 = ((b[2] - c[2]) * (px - c[0]) + (c[0] - b[0]) * (pz - c[2])) / det;
  const l1 = ((c[2] - a[2]) * (px - c[0]) + (a[0] - c[0]) * (pz - c[2])) / det;
  const l2 = 1 - l0 - l1;
  if (l0 < -1e-5 || l1 < -1e-5 || l2 < -1e-5) return null;
  return [l0, l1, l2];
}

/**
 * Explicit-mesh high-makie rock: sculpted 8-facet rounded mound with an upper-left secondary peak,
 * two carved ridge lines, and a dense mosaic of square kirikane/kirigin foil tiles lifted ~0.1 off
 * the surface along its normal.
 */
export function meshRock(id, cx, cz, w, h, seed, {mat = MAT.kirikane, layer = 1} = {}) {
  if (typeof id !== 'string' || !id) throw new Error(`meshRock: invalid id ${id}`);
  if (![cx, cz, w, h, seed].every(Number.isFinite) || !(w > 0) || !(h > 0)) {
    throw new Error(`meshRock(${id}): invalid geometry parameters`);
  }

  const r = rand(seed), n = 8, d = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * 6.283 - Math.PI * .9, k = .72 + r() * .38, lower = Math.sin(t) > 0 ? .55 : 1;
    d.push([cx + Math.cos(t) * w * k, cz + Math.sin(t) * h * k * lower]);
  }

  const p = {
    id, kind: KIND.rock, group: id, order: 0, layer, mat, reach: 4, thick: 0, bias: 0,
    anchor: [cx, cz + h * .4], fills: [], lines: [],
  };
  p.fills.push({d, soft: .35, crisp: .7});
  p.fills.push({d: d.map(([x, z]) => [cx + (x - cx) * .55 - w * .1, cz + (z - cz) * .5 - h * .12]), soft: .5, crisp: 1});
  const line1 = [d[1], [cx - w * .1, cz - h * .1], d[5]];
  const line2 = [d[3], [cx + w * .2, cz], d[6]];
  p.lines.push({d: line1, w: .7, amp: .8});
  p.lines.push({d: line2, w: .6, amp: .6});

  const rel = d.map(([x, z]) => [x - cx, z - cz]);
  const sectorCoord = (x, z) => {
    const dx = x - cx, dz = z - cz;
    if (Math.hypot(dx, dz) < 1e-9) return {u: 0, s: 0, f: 0};
    let bestS = 0, bestMin = -Infinity, bestU = 1, bestF = 0;
    for (let s = 0; s < n; s++) {
      const A = rel[s], B = rel[(s + 1) % n];
      const det = A[0] * B[1] - A[1] * B[0];
      const c1 = (dx * B[1] - dz * B[0]) / det;
      const c2 = (A[0] * dz - A[1] * dx) / det;
      const m = Math.min(c1, c2);
      if (m > bestMin) {
        bestMin = m;
        bestS = s;
        bestU = c1 + c2;
        bestF = bestU > 1e-9 ? clamp(c2 / bestU, 0, 1) : 0;
      }
    }
    return {u: bestU, s: bestS, f: bestF};
  };

  const H = clamp(Math.min(w, h) * .78 + 4.5, 16, 21);
  // Broad upper-left shoulder matching p.fills[1] and clean rock-ridge terraces along line1/line2.
  const mx = cx + w * .04, mz = cz + h * .02;
  const sx = cx - w * .17, sz = cz - h * .14;
  const rockY = (x, z) => {
    const {u, s, f} = sectorCoord(x, z);
    if (u >= 1) return 0;
    const baseDome = Math.pow(Math.max(0, 1 - Math.pow(u, 2.4)), .62);
    // Broad tilted shoulder steps per face instead of tight radial pinches.
    const facetTilt = .95 + .07 * Math.sin(s * 2.1 + seed) + .04 * Math.sin((f - .5) * Math.PI);
    const facetBlend = lerp(1, facetTilt, smoothstep(.22, .58, u) * smoothstep(1, .84, u));
    const duMain = Math.hypot((x - mx) / (w * .82), (z - mz) / (h * .72));
    const mainPeak = H * baseDome * facetBlend * (1 - .06 * clamp(duMain, 0, 1));
    const duSub = Math.hypot((x - sx) / (w * .54), (z - sz) / (h * .46));
    const peak2 = duSub < 1 ? H * .42 * Math.pow(Math.max(0, 1 - Math.pow(duSub, 2.2)), .65) * smoothstep(.96, .56, u) : 0;
    const d1 = distPoly(x, z, line1), d2 = distPoly(x, z, line2);
    const g1 = d1 < 1.45 ? Math.pow(1 - d1 / 1.45, 1.5) : 0;
    const g2 = d2 < 1.35 ? Math.pow(1 - d2 / 1.35, 1.5) : 0;
    const groove = (g1 * .80 + g2 * .70) * smoothstep(.96, .74, u);
    return Math.max(0, mainPeak + peak2 - groove);
  };

  const N_RAD = 18, SECT_SUB = 7, N_ANG = n * SECT_SUB;
  const uRing = Array.from({length: N_RAD + 1}, (_, j) => 1 - Math.pow(1 - j / N_RAD, 1.35));
  const pos = [], norm = [];
  for (let j = 0; j <= N_RAD; j++) {
    const u = uRing[j];
    const rowP = [], rowN = [];
    for (let i = 0; i < N_ANG; i++) {
      const s = Math.floor(i / SECT_SUB) % n, f = (i % SECT_SUB) / SECT_SUB;
      const A = rel[s], B = rel[(s + 1) % n];
      const ex = lerp(A[0], B[0], f), ez = lerp(A[1], B[1], f);
      const px = cx + u * ex, pz = cz + u * ez;
      rowP.push([px, j === N_RAD ? 0 : rockY(px, pz), pz]);
      rowN.push([0, 0, 0]);
    }
    pos.push(rowP);
    norm.push(rowN);
  }

  // Build top triangles and accumulate area-weighted smooth vertex normals.
  const topTris = [];
  const cellTris = Array.from({length: N_RAD}, () => Array.from({length: N_ANG}, () => []));
  const addTopTri = (j0, i0, j1, i1, j2, i2, cellJ, cellI) => {
    const a = pos[j0][i0], b = pos[j1][i1], c = pos[j2][i2];
    let fn = cross(sub(b, a), sub(c, a));
    const area2 = Math.hypot(fn[0], fn[1], fn[2]);
    if (!(area2 > 1e-7)) return;
    if (fn[1] < 0) {
      fn = scale(fn, -1);
      [j1, i1, j2, i2] = [j2, i2, j1, i1];
    }
    for (const [jj, ii] of [[j0, i0], [j1, i1], [j2, i2]]) {
      norm[jj][ii][0] += fn[0];
      norm[jj][ii][1] += fn[1];
      norm[jj][ii][2] += fn[2];
    }
    const tri = [[j0, i0], [j1, i1], [j2, i2]];
    topTris.push(tri);
    cellTris[cellJ][cellI].push(tri);
  };

  for (let i = 0; i < N_ANG; i++) {
    const iNext = (i + 1) % N_ANG;
    addTopTri(0, 0, 1, i, 1, iNext, 0, i);
  }
  for (let j = 1; j < N_RAD; j++) {
    for (let i = 0; i < N_ANG; i++) {
      const iNext = (i + 1) % N_ANG;
      addTopTri(j, i, j + 1, i, j + 1, iNext, j, i);
      addTopTri(j, i, j + 1, iNext, j, iNext, j, i);
    }
  }

  const apexN = [0, 0, 0];
  for (let i = 0; i < N_ANG; i++) {
    apexN[0] += norm[0][i][0];
    apexN[1] += norm[0][i][1];
    apexN[2] += norm[0][i][2];
  }
  const unitApexN = unit(apexN);
  for (let i = 0; i < N_ANG; i++) norm[0][i] = unitApexN;
  for (let j = 1; j <= N_RAD; j++) {
    for (let i = 0; i < N_ANG; i++) norm[j][i] = unit(norm[j][i]);
  }

  // Warm bronze-amber mura-nashiji mound body so kirikane (gold) and kirigin (silver) tiles read with crisp contrast.
  const bodyMat = MAT.mura;
  const bodyVerts = [];
  for (const [[j0, i0], [j1, i1], [j2, i2]] of topTris) {
    pushTri(bodyVerts, pos[j0][i0], pos[j1][i1], pos[j2][i2], [0, 1, 0], norm[j0][i0], norm[j1][i1], norm[j2][i2]);
  }
  const botC = [cx, 0, cz];
  for (let i = 0; i < N_ANG; i++) {
    const iNext = (i + 1) % N_ANG;
    pushTri(bodyVerts, botC, pos[N_RAD][iNext], pos[N_RAD][i], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]);
  }

  // Exact barycentric sampler over the triangulated rock surface.
  const sampleMesh = (x, z) => {
    const {u, s, f} = sectorCoord(x, z);
    if (u >= 1) return null;
    let jHit = 0;
    for (let j = 0; j < N_RAD; j++) {
      if (u <= uRing[j + 1] + 1e-6) { jHit = j; break; }
    }
    const iHit = s * SECT_SUB + Math.min(SECT_SUB - 1, Math.floor(f * SECT_SUB));
    const checkList = [];
    for (let dj = -1; dj <= 1; dj++) {
      const jj = jHit + dj;
      if (jj < 0 || jj >= N_RAD) continue;
      for (let di = -1; di <= 1; di++) {
        const ii = (iHit + di + N_ANG) % N_ANG;
        for (const tri of cellTris[jj][ii]) checkList.push(tri);
      }
    }
    for (const [[j0, i0], [j1, i1], [j2, i2]] of checkList) {
      const a = pos[j0][i0], b = pos[j1][i1], c = pos[j2][i2];
      const l = barycentricXZ(x, z, a, b, c);
      if (!l) continue;
      const y = l[0] * a[1] + l[1] * b[1] + l[2] * c[1];
      const na = norm[j0][i0], nb = norm[j1][i1], nc = norm[j2][i2];
      const nrm = unit([
        l[0] * na[0] + l[1] * nb[0] + l[2] * nc[0],
        l[0] * na[1] + l[1] * nb[1] + l[2] * nc[1],
        l[0] * na[2] + l[1] * nb[2] + l[2] * nc[2],
      ]);
      return {y, nrm, u};
    }
    return null;
  };

  // Kirikane / kirigin mosaic tiles laid in a tilted grid over the upper/lit rock faces.
  const rt = rand(seed + 101);
  const gridAngle = .28 + (rt() - .5) * .36;
  const cg = Math.cos(gridAngle), sg = Math.sin(gridAngle);
  // Hatsune kirikane squares read as a mosaic at plate scale: about 1.8–2.1 units with a clear gap.
  const pitch = 2.4;
  const maxSpan = Math.ceil(Math.hypot(w, h) * 1.15 / pitch);
  const tileVerts = [];
  const tileThick = .022;

  for (let iz = -maxSpan; iz <= maxSpan; iz++) {
    for (let ix = -maxSpan; ix <= maxSpan; ix++) {
      const jx = (rt() - .5) * .06, jz = (rt() - .5) * .06;
      const sz = 1.8 + rt() * .3;
      const sxTile = sz * (.94 + rt() * .10), szTile = sz * (.94 + rt() * .10);
      const rotJit = (rt() - .5) * .07;
      const gx = ix * pitch + jx, gz = iz * pitch + jz;
      const tx = cx + cg * gx - sg * gz, tz = cz + sg * gx + cg * gz;

      const hit = sampleMesh(tx, tz);
      if (!hit || hit.u > .91 || hit.nrm[1] < .35) continue;
      if (Math.min(distPoly(tx, tz, line1), distPoly(tx, tz, line2)) < .45) continue;

      const N0 = hit.nrm;
      const ca = Math.cos(gridAngle + rotJit), sa = Math.sin(gridAngle + rotJit);
      const dirX = [ca, 0, sa];
      const T1_0 = unit(sub(dirX, scale(N0, dot(dirX, N0))));
      const T2_0 = unit(cross(N0, T1_0));
      const hx = sxTile * .5, hz = szTile * .5;
      const center = [tx, hit.y, tz];
      const probe = [
        add(center, add(scale(T1_0, -hx), scale(T2_0, -hz))),
        add(center, add(scale(T1_0, hx), scale(T2_0, -hz))),
        add(center, add(scale(T1_0, hx), scale(T2_0, hz))),
        add(center, add(scale(T1_0, -hx), scale(T2_0, hz))),
      ];

      // Fit tile plane to the 4 corner surface hits (cuts curvature sag in half compared to center tangent).
      const hitsC = [];
      let ok = true;
      for (const c of probe) {
        const ch = sampleMesh(c[0], c[2]);
        if (!ch || Math.min(distPoly(c[0], c[2], line1), distPoly(c[0], c[2], line2)) < .15) { ok = false; break; }
        hitsC.push([c[0], ch.y, c[2]]);
      }
      if (!ok) continue;

      let N = unit(cross(sub(hitsC[2], hitsC[0]), sub(hitsC[3], hitsC[1])), N0);
      if (dot(N, N0) < 0) N = scale(N, -1);
      if (N[1] < .34) continue;

      const T1 = unit(sub(dirX, scale(N, dot(dirX, N))));
      const T2 = unit(cross(N, T1));
      const avgY = (hitsC[0][1] + hitsC[1][1] + hitsC[2][1] + hitsC[3][1]) * .25;
      const midCenter = [tx, (hit.y + avgY) * .5, tz];
      const baseCorners = [
        add(midCenter, add(scale(T1, -hx), scale(T2, -hz))),
        add(midCenter, add(scale(T1, hx), scale(T2, -hz))),
        add(midCenter, add(scale(T1, hx), scale(T2, hz))),
        add(midCenter, add(scale(T1, -hx), scale(T2, hz))),
      ];

      let minS = Infinity, maxS = -Infinity;
      for (let k = 0; k < 5; k++) {
        const ch = k === 0 ? hit : sampleMesh(baseCorners[k - 1][0], baseCorners[k - 1][2]);
        if (!ch || (k > 0 && Math.min(distPoly(baseCorners[k - 1][0], baseCorners[k - 1][2], line1), distPoly(baseCorners[k - 1][0], baseCorners[k - 1][2], line2)) < .15)) {
          ok = false; break;
        }
        const refY = k === 0 ? midCenter[1] : baseCorners[k - 1][1];
        const dY = refY - ch.y;
        const dMin = Math.min(dY * N[1], dY * ch.nrm[1]);
        const dMax = Math.max(dY * N[1], dY * ch.nrm[1]);
        minS = Math.min(minS, dMin);
        maxS = Math.max(maxS, dMax);
      }
      if (!ok || maxS - minS > .095) continue;

      const baseOff = clamp(.095 - minS, .078, .135);
      if (baseOff + minS < .074 || baseOff + maxS + tileThick > .188) continue;
      const topOff = baseOff + tileThick;
      const bPts = baseCorners.map(c => add(c, scale(N, baseOff)));
      const tPts = baseCorners.map(c => add(c, scale(N, topOff)));

      pushQuad(tileVerts, tPts[0], tPts[1], tPts[2], tPts[3], N, N, N, N, N);
      const negN = scale(N, -1);
      pushQuad(tileVerts, bPts[0], bPts[3], bPts[2], bPts[1], negN, negN, negN, negN, negN);
      for (let k = 0; k < 4; k++) {
        const kn = (k + 1) % 4;
        const sideN = unit(cross(sub(bPts[kn], bPts[k]), N));
        pushQuad(tileVerts, bPts[k], bPts[kn], tPts[kn], tPts[k], sideN, sideN, sideN, sideN, sideN);
      }
    }
  }

  const tileMat = mat === MAT.kirigin ? MAT.kirigin : MAT.kirikane;
  p.mesh = tileVerts.length ? [{mat: bodyMat, vertices: bodyVerts}, {mat: tileMat, vertices: tileVerts}] : [{mat: bodyMat, vertices: bodyVerts}];
  return [p];
}
