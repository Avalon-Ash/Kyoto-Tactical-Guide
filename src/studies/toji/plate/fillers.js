// How much of the lid is bare nashiji (docs/MAKIE_COMPOSITION_PLAN.md C1). A reference number only: the 2026-11-14
// scatter that filled bare ground at random was removed at the user's word ("無差別亂塞", it broke 形意). Small
// scenes come back only attached to an object they belong to (C3 revised), never to lower this number.
import {PLATE} from './vocab.js';

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
