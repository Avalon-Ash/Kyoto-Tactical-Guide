// The kumihimo that hangs from each ring fitting: a short chain of nodes on fixed-length links.
// Pure: no DOM, no WebGL. Positions are world units; y is up.
const H = 1 / 120, GRAVITY = -900, DAMP = .992;

/**
 * @param {{anchor:number[], out:number[], nodes?:number, seg?:number, floor?:number}} options
 * anchor: where the cord leaves its ring. out: unit [x, z] pointing away from the wall it hangs against.
 * floor: the height of what the box stands on; the cord's tail lies there.
 */
export function createCord({anchor, out, nodes = 9, seg = 11, floor = -92.5}) {
  const points = [], previous = [];
  for (let i = 0; i < nodes; i++) {
    // Start already draped: down the wall, then out along the floor.
    const drop = Math.min(i * seg, anchor[1] - floor), run = 3 + Math.max(0, i * seg - (anchor[1] - floor));
    points.push([anchor[0] + out[0] * run, anchor[1] - drop, anchor[2] + out[1] * run]);
    previous.push([...points[i]]);
  }
  const wall = anchor[0] * out[0] + anchor[2] * out[1];
  let carry = 0;
  function substep(pin, ax) {
    for (let i = 1; i < nodes; i++) {
      const p = points[i], q = previous[i], onFloor = p[1] <= floor + .01, keep = onFloor ? .7 : DAMP;
      const vx = (p[0] - q[0]) * keep, vy = (p[1] - q[1]) * DAMP, vz = (p[2] - q[2]) * keep;
      q[0] = p[0]; q[1] = p[1]; q[2] = p[2];
      p[0] += vx + ax * H * H; p[1] += vy + GRAVITY * H * H; p[2] += vz;
    }
    for (let pass = 0; pass < 8; pass++) {
      points[0][0] = pin[0]; points[0][1] = pin[1]; points[0][2] = pin[2];
      for (let i = 1; i < nodes; i++) {
        const a = points[i - 1], b = points[i], dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
        const d = Math.hypot(dx, dy, dz) || 1e-6, k = (d - seg) / d * (i === 1 ? 1 : .5);
        if (i > 1) { a[0] += dx * k; a[1] += dy * k; a[2] += dz * k; }
        b[0] -= dx * k; b[1] -= dy * k; b[2] -= dz * k;
      }
      for (let i = 1; i < nodes; i++) {
        const p = points[i];
        if (p[1] < floor) p[1] = floor;
        // Never through the side of the box.
        const depth = p[0] * out[0] + p[2] * out[1] - wall - 2;
        if (depth < 0) { p[0] -= out[0] * depth; p[2] -= out[1] * depth; }
      }
    }
  }
  return {
    points, seg,
    /**
     * @param {number} dt seconds
     * @param {{anchor?:number[], ax?:number, kick?:number}} input
     * ax: sideways acceleration felt by the cord (the box being pulled along its track); kick: a one-off shove.
     */
    step(dt, {anchor: pin = anchor, ax = 0, kick = 0} = {}) {
      if (kick) for (let i = 1; i < nodes; i++) previous[i][0] -= kick * H * (i / nodes);
      carry = Math.min(carry + dt, .1);
      while (carry >= H) { substep(pin, ax); carry -= H; }
    },
    /** Let it come to rest, for a first frame or for reduced motion. */
    settle(pin = anchor) { for (let i = 0; i < 360; i++) substep(pin, 0); for (let i = 1; i < nodes; i++) previous[i] = [...points[i]]; },
  };
}

/**
 * A tube around the cord, as triangles: position 3, normal 3, uv 2 (angle, length along), then two caller floats.
 * The last links are the tassel: wider, tapering to its end.
 */
export function cordTube(points, out, extra = [27, 1], sides = 6) {
  const data = [], rings = [], n = points.length;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], unit = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  let length = 0;
  for (let i = 0; i < n; i++) {
    const t = unit(sub(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]));
    let b = cross(t, [out[0], 0, out[1]]);
    if (Math.hypot(...b) < .05) b = cross(t, [0, 1, 0]);
    b = unit(b); const m = cross(b, t);
    const r = i === n - 1 ? 3.2 : i >= n - 3 ? 4.8 : 2.5;
    if (i) length += Math.hypot(...sub(points[i], points[i - 1]));
    rings.push(Array.from({length: sides + 1}, (_, k) => {
      const a = k / sides * 6.2832, d = [0, 1, 2].map(j => Math.cos(a) * m[j] + Math.sin(a) * b[j]);
      return [points[i][0] + d[0] * r, points[i][1] + d[1] * r, points[i][2] + d[2] * r, d[0], d[1], d[2], a, length];
    }));
  }
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < sides; k++) {
    const q = [rings[i][k], rings[i][k + 1], rings[i + 1][k + 1], rings[i + 1][k]];
    for (const j of [0, 1, 2, 0, 2, 3]) data.push(...q[j], ...extra);
  }
  return data;
}
