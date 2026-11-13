// Pure CPU geometry builders and packer for explicit 3D meshes on a makie plate.
// Vertex format before packing: 8 floats [x, y, z, nx, ny, nz, u, v] (non-indexed triangles).
// Packed vertex format: 16 floats [pos3, normal3, uv2, owner4(index, foot, anchorX, anchorZ), style4(hinge, mat, isBird, bias)].

const isFiniteVec = (v, n) => Array.isArray(v) && v.length === n && v.every(Number.isFinite);
const assertMat = (mat, fn) => {
  if (!Number.isInteger(mat) || mat <= 0) throw new Error(`${fn}: invalid material ${mat}`);
};

const pushTri = (out, a, b, c, n, uva, uvb, uvc) => {
  out.push(
    a[0], a[1], a[2], n[0], n[1], n[2], uva[0], uva[1],
    b[0], b[1], b[2], n[0], n[1], n[2], uvb[0], uvb[1],
    c[0], c[1], c[2], n[0], n[1], n[2], uvc[0], uvc[1],
  );
};

const pushQuad = (out, a, b, c, d, n, uva, uvb, uvc, uvd) => {
  pushTri(out, a, b, c, n, uva, uvb, uvc);
  pushTri(out, a, c, d, n, uva, uvc, uvd);
};

/**
 * Extrudes a strictly convex 2D XZ polygon vertically from y0 to y1.
 * Rejects non-finite input, y1 <= y0, degenerate edges, zero area, concave or self-intersecting polygons.
 * @param {[number, number][]} outlineXZ
 * @param {number} y0
 * @param {number} y1
 * @param {number} mat
 * @returns {{mat: number, vertices: number[]}}
 */
export function extrudeConvex(outlineXZ, y0, y1, mat) {
  assertMat(mat, 'extrudeConvex');
  if (!Number.isFinite(y0) || !Number.isFinite(y1) || !(y1 > y0)) {
    throw new Error(`extrudeConvex: require finite y1 > y0 (got ${y0}, ${y1})`);
  }
  if (!Array.isArray(outlineXZ) || outlineXZ.length < 3 || outlineXZ.some(p => !isFiniteVec(p, 2))) {
    throw new Error('extrudeConvex: outlineXZ must have >= 3 finite [x, z] points');
  }
  const nRaw = outlineXZ.length;
  let area = 0;
  for (let i = 0; i < nRaw; i++) {
    const [ax, az] = outlineXZ[i], [bx, bz] = outlineXZ[(i + 1) % nRaw];
    if (Math.hypot(bx - ax, bz - az) <= 1e-6) throw new Error('extrudeConvex: zero-length edge');
    area += ax * bz - bx * az;
  }
  area *= .5;
  if (Math.abs(area) <= 1e-8) throw new Error('extrudeConvex: zero-area outline');

  // Normalize to CCW on XZ screen (x right, z down => shoelace area < 0) so (pk - p0) x (pk+1 - p0) points +Y.
  const ordered = area > 0 ? [...outlineXZ].reverse() : outlineXZ.map(p => [p[0], p[1]]);
  let angleSum = 0;
  for (let i = 0; i < nRaw; i++) {
    const a = ordered[(i - 1 + nRaw) % nRaw], b = ordered[i], c = ordered[(i + 1) % nRaw];
    const e1x = b[0] - a[0], e1z = b[1] - a[1], e2x = c[0] - b[0], e2z = c[1] - b[1];
    const l1 = Math.hypot(e1x, e1z), l2 = Math.hypot(e2x, e2z);
    const cross = e1x * e2z - e1z * e2x;
    if (cross > 1e-6 * l1 * l2) throw new Error('extrudeConvex: outline is not convex');
    angleSum += Math.atan2(cross, e1x * e2x + e1z * e2z);
  }
  if (Math.abs(angleSum + Math.PI * 2) > 1e-3) throw new Error('extrudeConvex: outline must be simple convex');

  // Strip redundant collinear vertices so fan triangles on top/bottom caps are always non-degenerate.
  const pts = ordered.filter((b, i) => {
    const a = ordered[(i - 1 + nRaw) % nRaw], c = ordered[(i + 1) % nRaw];
    const e1x = b[0] - a[0], e1z = b[1] - a[1], e2x = c[0] - b[0], e2z = c[1] - b[1];
    const cross = Math.abs(e1x * e2z - e1z * e2x);
    return cross > 1e-7 * Math.hypot(e1x, e1z) * Math.hypot(e2x, e2z);
  });
  if (pts.length < 3) throw new Error('extrudeConvex: fewer than 3 non-collinear vertices');

  const vertices = [];
  const n = pts.length;
  const p0 = pts[0];
  for (let k = 1; k < n - 1; k++) {
    const p1 = pts[k], p2 = pts[k + 1];
    // Top (+y)
    pushTri(vertices, [p0[0], y1, p0[1]], [p1[0], y1, p1[1]], [p2[0], y1, p2[1]], [0, 1, 0], p0, p1, p2);
    // Bottom (-y)
    pushTri(vertices, [p0[0], y0, p0[1]], [p2[0], y0, p2[1]], [p1[0], y0, p1[1]], [0, -1, 0], p0, p2, p1);
  }
  let run = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    const norm = [-dz / len, 0, dx / len];
    pushQuad(
      vertices,
      [a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]],
      norm,
      [run, y0], [run + len, y0], [run + len, y1], [run, y1],
    );
    run += len;
  }
  return {mat, vertices};
}

/**
 * Sweeps a closed semi-elliptical cross-section (flat bottom at baseY, arch above) along [x, z, r] points.
 * Rejects < 2 points, r <= 0, duplicate consecutive center points, or non-positive heightRatio.
 * @param {[number, number, number][]} points
 * @param {{heightRatio?: number, baseY?: number, mat: number, sides?: number}} opts
 * @returns {{mat: number, vertices: number[]}}
 */
export function sweepHalfTube(points, {heightRatio = .85, baseY = 0, mat, sides = 12} = {}) {
  assertMat(mat, 'sweepHalfTube');
  if (!Number.isFinite(heightRatio) || !(heightRatio > 0)) {
    throw new Error(`sweepHalfTube: heightRatio must be > 0 (got ${heightRatio})`);
  }
  if (!Number.isFinite(baseY)) throw new Error(`sweepHalfTube: baseY must be finite (got ${baseY})`);
  if (!Number.isInteger(sides) || sides < 3) throw new Error(`sweepHalfTube: sides must be integer >= 3 (got ${sides})`);
  if (!Array.isArray(points) || points.length < 2 || points.some(p => !isFiniteVec(p, 3) || !(p[2] > 0))) {
    throw new Error('sweepHalfTube: points must have >= 2 finite [x, z, r] with r > 0');
  }
  for (let i = 0; i < points.length - 1; i++) {
    if (Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]) <= 1e-6) {
      throw new Error('sweepHalfTube: duplicate consecutive center point');
    }
  }

  const tangentAt = i => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    if (len <= 1e-6) {
      const alt = i > 0 ? points[i - 1] : points[i + 1];
      dx = i > 0 ? points[i][0] - alt[0] : alt[0] - points[i][0];
      dz = i > 0 ? points[i][1] - alt[1] : alt[1] - points[i][1];
      len = Math.hypot(dx, dz);
    }
    return [dx / len, dz / len];
  };

  const rings = [];
  let length = 0;
  for (let i = 0; i < points.length; i++) {
    const [x, z, r] = points[i];
    if (i > 0) length += Math.hypot(x - points[i - 1][0], z - points[i - 1][1]);
    const [tx, tz] = tangentAt(i);
    const nx = -tz, nz = tx;
    const ring = [];
    for (let j = 0; j <= sides; j++) {
      const t = j / sides * Math.PI, c = Math.cos(t), s = Math.sin(t);
      const n = Math.hypot(c, s / heightRatio);
      ring.push({
        pos: [x + nx * r * c, baseY + r * s * heightRatio, z + nz * r * c],
        norm: [nx * c / n, s / heightRatio / n, nz * c / n],
        uv: [t * r, length],
      });
    }
    rings.push(ring);
  }

  const vertices = [];
  const pushV = v => vertices.push(...v.pos, ...v.norm, ...v.uv);
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < sides; j++) {
      for (const [r, s] of [[i, j], [i + 1, j], [i + 1, j + 1], [i, j], [i + 1, j + 1], [i, j + 1]]) {
        pushV(rings[r][s]);
      }
    }
    // Flat bottom closing y = baseY
    const a = rings[i][0].pos, b = rings[i][sides].pos, c = rings[i + 1][sides].pos, d = rings[i + 1][0].pos;
    pushQuad(vertices, a, b, c, d, [0, -1, 0], [a[0], a[2]], [b[0], b[2]], [c[0], c[2]], [d[0], d[2]]);
  }

  // Closed end caps
  const [tx0, tz0] = tangentAt(0);
  const c0 = [points[0][0], baseY, points[0][1]];
  const n0 = [-tx0, 0, -tz0];
  for (let j = 0; j < sides; j++) {
    const p1 = rings[0][j].pos, p2 = rings[0][j + 1].pos;
    pushTri(vertices, c0, p1, p2, n0, [0, 0], [p1[0] - c0[0], p1[1] - baseY], [p2[0] - c0[0], p2[1] - baseY]);
  }
  const last = rings.length - 1;
  const [txE, tzE] = tangentAt(last);
  const cE = [points[last][0], baseY, points[last][1]];
  const nE = [txE, 0, tzE];
  for (let j = 0; j < sides; j++) {
    const p1 = rings[last][j].pos, p2 = rings[last][j + 1].pos;
    pushTri(vertices, cE, p2, p1, nE, [0, 0], [p2[0] - cE[0], p2[1] - baseY], [p1[0] - cE[0], p1[1] - baseY]);
  }

  return {mat, vertices};
}

/**
 * Builds a closed surface-following ribbon along [x, y, z] points with bevel joins at corners.
 * @param {[number, number, number][]} pointsXYZ
 * @param {number} width
 * @param {number} thickness
 * @param {number} mat
 * @returns {{mat: number, vertices: number[]}}
 */
export function ribbonMesh(pointsXYZ, width, thickness, mat) {
  assertMat(mat, 'ribbonMesh');
  if (!Number.isFinite(width) || !(width > 0)) throw new Error(`ribbonMesh: width must be > 0 (got ${width})`);
  if (!Number.isFinite(thickness) || !(thickness > 0)) throw new Error(`ribbonMesh: thickness must be > 0 (got ${thickness})`);
  if (!Array.isArray(pointsXYZ) || pointsXYZ.length < 2 || pointsXYZ.some(p => !isFiniteVec(p, 3))) {
    throw new Error('ribbonMesh: pointsXYZ must have >= 2 finite [x, y, z] points');
  }
  for (let i = 0; i < pointsXYZ.length - 1; i++) {
    if (Math.hypot(pointsXYZ[i + 1][0] - pointsXYZ[i][0], pointsXYZ[i + 1][2] - pointsXYZ[i][2]) <= 1e-6) {
      throw new Error('ribbonMesh: duplicate consecutive XZ point');
    }
  }

  const hw = width * .5;
  const vertices = [];
  const segs = [];
  let run = 0;

  for (let i = 0; i < pointsXYZ.length - 1; i++) {
    const a = pointsXYZ[i], b = pointsXYZ[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const lenXZ = Math.hypot(dx, dz);
    const tx = dx / lenXZ, tz = dz / lenXZ, nx = -tz, nz = tx;
    const nLen = Math.hypot(-dy * nz, lenXZ, dy * nx);
    const topN = [-dy * nz / nLen, lenXZ / nLen, dy * nx / nLen];
    const botN = [-topN[0], -topN[1], -topN[2]];
    const leftN = [nx, 0, nz], rightN = [-nx, 0, -nz];
    const nextRun = run + Math.hypot(dx, dy, dz);

    const alB = [a[0] + nx * hw, a[1], a[2] + nz * hw], arB = [a[0] - nx * hw, a[1], a[2] - nz * hw];
    const blB = [b[0] + nx * hw, b[1], b[2] + nz * hw], brB = [b[0] - nx * hw, b[1], b[2] - nz * hw];
    const alT = [alB[0], alB[1] + thickness, alB[2]], arT = [arB[0], arB[1] + thickness, arB[2]];
    const blT = [blB[0], blB[1] + thickness, blB[2]], brT = [brB[0], brB[1] + thickness, brB[2]];

    // Top & bottom
    pushQuad(vertices, arT, alT, blT, brT, topN, [run, -hw], [run, hw], [nextRun, hw], [nextRun, -hw]);
    pushQuad(vertices, arB, brB, blB, alB, botN, [run, -hw], [nextRun, -hw], [nextRun, hw], [run, hw]);
    // Left & right walls
    pushQuad(vertices, alB, blB, blT, alT, leftN, [run, 0], [nextRun, 0], [nextRun, thickness], [run, thickness]);
    pushQuad(vertices, arB, arT, brT, brB, rightN, [run, 0], [run, thickness], [nextRun, thickness], [nextRun, 0]);

    segs.push({tx, tz, topN, botN, run, a, b, alB, arB, blB, brB, alT, arT, blT, brT});
    run = nextRun;
  }

  // Start cap & end cap, plus bevel joins at bends
  const first = segs[0], last = segs.at(-1);
  pushQuad(vertices, first.arB, first.alB, first.alT, first.arT, [-first.tx, 0, -first.tz], [-hw, 0], [hw, 0], [hw, thickness], [-hw, thickness]);
  pushQuad(vertices, last.blB, last.brB, last.brT, last.blT, [last.tx, 0, last.tz], [hw, 0], [-hw, 0], [-hw, thickness], [hw, thickness]);

  for (let i = 1; i < segs.length; i++) {
    const prev = segs[i - 1], curr = segs[i];
    const cross = prev.tx * curr.tz - prev.tz * curr.tx;
    if (Math.abs(cross) < 1e-4) continue;
    // Close inner seam safely and fill outer gap with a bevel wedge
    pushQuad(vertices, prev.blB, prev.brB, prev.brT, prev.blT, [prev.tx, 0, prev.tz], [hw, 0], [-hw, 0], [-hw, thickness], [hw, thickness]);
    pushQuad(vertices, curr.arB, curr.alB, curr.alT, curr.arT, [-curr.tx, 0, -curr.tz], [-hw, 0], [hw, 0], [hw, thickness], [-hw, thickness]);

    const cB = curr.a, cT = [cB[0], cB[1] + thickness, cB[2]];
    // cross > 0 => turning toward +n_prev is right-turn in screen XZ (right edge opens on outside if cross < 0, left opens if cross > 0)
    const pB = cross > 0 ? prev.blB : prev.brB, qB = cross > 0 ? curr.alB : curr.arB;
    const pT = cross > 0 ? prev.blT : prev.brT, qT = cross > 0 ? curr.alT : curr.arT;
    const ex = qB[0] - pB[0], ez = qB[2] - pB[2], eLen = Math.hypot(ex, ez);
    if (eLen <= 1e-5) continue;
    const bevelN = cross > 0 ? [-ez / eLen, 0, ex / eLen] : [ez / eLen, 0, -ex / eLen];
    if (cross > 0) {
      pushTri(vertices, cT, pT, qT, curr.topN, [curr.run, 0], [curr.run, hw], [curr.run, hw]);
      pushTri(vertices, cB, qB, pB, curr.botN, [curr.run, 0], [curr.run, hw], [curr.run, hw]);
      pushQuad(vertices, pB, qB, qT, pT, bevelN, [curr.run, 0], [curr.run + eLen, 0], [curr.run + eLen, thickness], [curr.run, thickness]);
    } else {
      pushTri(vertices, cT, qT, pT, curr.topN, [curr.run, 0], [curr.run, -hw], [curr.run, -hw]);
      pushTri(vertices, cB, pB, qB, curr.botN, [curr.run, 0], [curr.run, -hw], [curr.run, -hw]);
      pushQuad(vertices, qB, pB, pT, qT, bevelN, [curr.run, 0], [curr.run + eLen, 0], [curr.run + eLen, thickness], [curr.run, thickness]);
    }
  }
  return {mat, vertices};
}

/**
 * Validates mesh chunks for preparePlate: checks chunk shape, valid MAT, finite floats,
 * non-degenerate triangle areas (> 1e-8), and near-unit normals.
 * @param {unknown} mesh
 * @param {string} partId
 * @param {Set<number>} validMats
 * @returns {string[]}
 */
export function validateMesh(mesh, partId, validMats) {
  const errors = [];
  if (!Array.isArray(mesh) || !mesh.length) {
    errors.push(`${partId}: bad mesh`);
    return errors;
  }
  for (const chunk of mesh) {
    if (!chunk || typeof chunk !== 'object' || !validMats.has(chunk.mat) || !Array.isArray(chunk.vertices) ||
        chunk.vertices.length === 0 || chunk.vertices.length % 24 !== 0) {
      errors.push(`${partId}: bad mesh chunk`);
      continue;
    }
    const v = chunk.vertices;
    for (let i = 0; i < v.length; i += 24) {
      for (let k = 0; k < 24; k++) {
        if (!Number.isFinite(v[i + k])) { errors.push(`${partId}: non-finite mesh`); return errors; }
      }
      const abx = v[i + 8] - v[i], aby = v[i + 9] - v[i + 1], abz = v[i + 10] - v[i + 2];
      const acx = v[i + 16] - v[i], acy = v[i + 17] - v[i + 1], acz = v[i + 18] - v[i + 2];
      const cx = aby * acz - abz * acy, cy = abz * acx - abx * acz, cz = abx * acy - aby * acx;
      if (!(.5 * Math.hypot(cx, cy, cz) > 1e-8)) { errors.push(`${partId}: degenerate mesh triangle`); return errors; }
      for (const off of [3, 11, 19]) {
        const nl = Math.hypot(v[i + off], v[i + off + 1], v[i + off + 2]);
        if (!(Math.abs(nl - 1) < 1e-3)) { errors.push(`${partId}: bad mesh normal`); return errors; }
      }
    }
  }
  return errors;
}

/**
 * Packs validated parts with `mesh` into a single 16-float-per-vertex buffer for GPU upload.
 * @param {Array<{id:string, index:number, foot:number, anchor:[number,number], hinge:number, bias:number, mesh?:{mat:number, vertices:number[]}[]}>} parts
 * @returns {Float32Array}
 */
export function packMeshes(parts) {
  const out = [];
  for (const p of parts) {
    if (!p.mesh) continue;
    if (![p.index, p.foot, p.anchor?.[0], p.anchor?.[1], p.hinge, p.bias].every(Number.isFinite)) {
      throw new Error(`packMeshes(${p.id}): non-finite owner/style`);
    }
    for (const chunk of p.mesh) {
      assertMat(chunk.mat, `packMeshes(${p.id})`);
      const v = chunk.vertices;
      if (!Array.isArray(v) || v.length === 0 || v.length % 24 !== 0) {
        throw new Error(`packMeshes(${p.id}): invalid chunk vertices`);
      }
      for (let i = 0; i < v.length; i += 8) {
        out.push(
          v[i], v[i + 1], v[i + 2],
          v[i + 3], v[i + 4], v[i + 5],
          v[i + 6], v[i + 7],
          p.index, p.foot, p.anchor[0], p.anchor[1],
          p.hinge, chunk.mat, 0, p.bias,
        );
      }
    }
  }
  return new Float32Array(out);
}
