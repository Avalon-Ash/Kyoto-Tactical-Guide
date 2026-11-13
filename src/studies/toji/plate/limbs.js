// A limb is a sampled centreline [x,z,r]. Sweep an elliptical half-tube above the picture.
export const LIMB_HEIGHT = .62;
export function limbOutline(points) {
  const sides = [[], []];
  points.forEach(([x, z, r], i) => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    for (let j = 0; j < 2; j++) { const s = j ? -1 : 1; sides[j].push([x - s * (b[1] - a[1]) / len * r, z + s * (b[0] - a[0]) / len * r]); }
  });
  return [...sides[0], ...sides[1].reverse()];
}
export function limbMesh(parts, sides = 12) {
  const out = [];
  for (const p of parts) for (const limb of p.limbs) {
    const pts = limb.points, rings = []; let length = 0;
    pts.forEach(([x, z, r], i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = -(b[1] - a[1]) / len, nz = (b[0] - a[0]) / len;
      if (i) length += Math.hypot(x - a[0], z - a[1]);
      rings.push(Array.from({length: sides + 1}, (_, j) => {
        const t = j / sides * Math.PI, c = Math.cos(t), s = Math.sin(t), n = Math.hypot(c, s / LIMB_HEIGHT);
        return [x + nx * r * c, r * s * LIMB_HEIGHT, z + nz * r * c, nx * c / n, s / LIMB_HEIGHT / n, nz * c / n,
          t * r, length, p.index, p.foot, ...p.anchor, p.hinge, limb.mat ?? p.mat, limb.bark ?? 0, 0];
      }));
    });
    for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < sides; j++) {
      for (const [r, s] of [[i,j],[i+1,j],[i+1,j+1],[i,j],[i+1,j+1],[i,j+1]]) out.push(...rings[r][s]);
    }
    // End caps bury the joining end inside its parent and close the exposed root / tapered tip.
    for (const k of [0, rings.length - 1]) for (let j = 0; j < sides; j++) {
      const centre = [...rings[k][0]]; centre[0] = pts[k][0]; centre[1] = 0; centre[2] = pts[k][1];
      out.push(...centre, ...rings[k][j], ...rings[k][j + 1]);
    }
  }
  return new Float32Array(out);
}
export function stampInstances(parts) {
  const out = [];
  for (const p of parts) for (const s of p.stamps) out.push(s.x, s.z, s.turn, s.offset, s.w, s.h, s.cell, s.relief,
    p.index, p.foot, ...p.anchor, p.hinge, s.mat, 0, 0);
  return new Float32Array(out);
}
