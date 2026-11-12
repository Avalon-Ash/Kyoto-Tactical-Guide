// A plate's parts: validation, picking, and the life of each part.
// Every part moves through the same five states — asleep, breathing, awake, answering, afterglow —
// expressed as a few springs. Pure: no DOM, no WebGL.
import {KIND, PLATE} from './vocab.js';
import {stepSpring, stepDamped} from './spring.js';
import {minami} from './minami.js';

export const MAX_PARTS = 64, LAYERS = 4;
export const DWELL_MS = 400;
/** How far each kind stands up from the lid when fully awake, in radians. Rocks and mist do not hinge. */
export const HINGE = {[KIND.tier]: .92, [KIND.pine]: .84, [KIND.bird]: .84};
/** Even at rest a standing part is never quite flat: the picture always has some body. */
export const STAND_REST = .14;
/** Wards that have been redrawn as plates. The rest still use the relief mesh. */
export const PLATES = {W_MINAMI: minami};
export const hasPlate = ward => Object.hasOwn(PLATES, ward);

/** Bounds, centre and radius for each part; ids become 1-based indices (0 is the bare ground). */
export function preparePlate(parts) {
  const errors = [], seen = new Set();
  if (parts.length > MAX_PARTS - 1) errors.push(`too many parts: ${parts.length}`);
  const prepared = parts.map((p, i) => {
    if (seen.has(p.id)) errors.push(`duplicate id ${p.id}`);
    seen.add(p.id);
    if (!(p.layer >= 0 && p.layer < LAYERS)) errors.push(`${p.id}: layer ${p.layer}`);
    if (!p.fills.length && !p.lines.length) errors.push(`${p.id}: empty`);
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const shape of [...p.fills, ...p.lines]) for (const [x, z] of shape.d) {
      if (!Number.isFinite(x) || !Number.isFinite(z)) errors.push(`${p.id}: bad point`);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
    }
    for (const f of p.fills) if (f.d.length < 3 || f.soft < 0 || f.soft > 1 || f.crisp < 0 || f.crisp > 1) errors.push(`${p.id}: bad fill`);
    return {...p, index: i + 1, bounds: [x0, z0, x1, z1], centre: [(x0 + x1) / 2, (z0 + z1) / 2], radius: Math.hypot(x1 - x0, z1 - z0) / 2};
  });
  // A group stands on one line: the lowest edge of its picture. A rider stands on its carrier's line.
  const foot = new Map(), groupIndex = new Map();
  for (const p of prepared) {
    foot.set(p.group, Math.max(foot.get(p.group) ?? -Infinity, p.bounds[3]));
    // Groups are numbered from 1; a solid is one mesh per group, and the shader tells groups apart by this number.
    if (!groupIndex.has(p.group)) groupIndex.set(p.group, groupIndex.size + 1);
    p.groupIndex = groupIndex.get(p.group);
  }
  for (const p of prepared) {
    if (p.attach && !foot.has(p.attach)) errors.push(`${p.id}: attached to unknown group ${p.attach}`);
    p.foot = foot.get(p.attach ?? p.group);
    p.hinge = HINGE[p.kind] ?? 0;
    if (p.layer === 0 && p.hinge) errors.push(`${p.id}: a standing part cannot live in the ground layer`);
  }
  return {parts: prepared, errors};
}

/** Topmost part under a plate point. `maps` is one Uint8Array of part indices per layer. */
export function partAt(maps, width, height, x, z) {
  const px = Math.floor((x + PLATE.halfW) / (PLATE.halfW * 2) * width), pz = Math.floor((z + PLATE.halfH) / (PLATE.halfH * 2) * height);
  if (px < 0 || pz < 0 || px >= width || pz >= height) return 0;
  for (let layer = maps.length - 1; layer >= 0; layer--) { const id = maps[layer][pz * width + px]; if (id) return id; }
  return 0;
}

const spring = (x = 0) => ({x, v: 0});
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/**
 * The simulation. `update` advances every part and fills two Float32Arrays for the shader, indexed by part index
 * (slot 0 is the bare ground):
 *   a[i] = (sway, stand, rise, glow)   b[i] = (dx, dz, lift, group number)
 * sway: rotation in the part's own plane about its anchor; stand: 0 lying in the lacquer, 1 fully raised;
 * rise: how awake its gold and relief are; lift: extra height off the lid.
 */
export function createLife(parts) {
  const a = new Float32Array(MAX_PARTS * 4), b = new Float32Array(MAX_PARTS * 4);
  const groups = new Map();
  for (const p of parts) {
    if (!groups.has(p.group)) groups.set(p.group, {members: [], centre: [0, 0], perch: 0, near: 0, stand: 0});
    groups.get(p.group).members.push(p);
  }
  for (const g of groups.values()) {
    g.centre = [0, 1].map(k => g.members.reduce((s, p) => s + p.centre[k], 0) / g.members.length);
    g.radius = Math.max(...g.members.map(p => Math.hypot(p.centre[0] - g.centre[0], p.centre[1] - g.centre[1]) + p.radius * .5));
    g.orders = Math.max(...g.members.map(p => p.order)) + 1;
  }
  const state = parts.map((p, i) => ({wake: spring(.12), stand: spring(STAND_REST), glow: spring(), dx: spring(), dz: spring(), sway: spring(), lift: spring(), phase: (i * 2.399) % 6.283}));
  let dwellId = 0, dwellSince = 0, dwellFired = false, lastLight = null;

  /** A direct answer from a part: a dwell, or a tap in close-up. */
  function act(index, time) {
    const p = parts[index - 1];
    if (!p) return false;
    const g = groups.get(p.group);
    for (const m of g.members) {
      const s = state[m.index - 1];
      s.glow.x = 1;
      if (m.kind === KIND.pine) s.sway.v += (m.order % 2 ? -1 : 1) * .45 / (1 + m.order * .3);
      if (m.kind === KIND.rock) s.lift.v += 55;
      if (m.kind === KIND.tier) s.lift.v += 30 + m.order * 7;
      if (m.kind === KIND.mist) s.dz.v += 30;
    }
    if (p.kind === KIND.bird) { g.perch = (g.perch + 1) % g.members.length; g.hopAt = time; }
    return true;
  }

  /**
   * @param {number} dt seconds
   * @param {{time:number, light:[number,number]|null, presence:number, still:boolean, lift:number, maps?:Uint8Array[], mapW?:number, mapH?:number}} input
   * presence 0..1: how much the hand (or the idle light) is with the plate. lift: the lid's own relief setting (flat ≈ 0).
   */
  function update(dt, input) {
    const {time, light, presence, still, lift} = input, t = time / 1000, body = smooth(.05, .85, lift);
    // Dwell: the light resting on one part long enough is a question; the part answers once.
    const under = light && input.maps && presence > .5 ? partAt(input.maps, input.mapW, input.mapH, light[0], light[1]) : 0;
    const group = under ? parts[under - 1].group : 0;
    if (group !== dwellId) { dwellId = group; dwellSince = time; dwellFired = false; }
    else if (group && !dwellFired && time - dwellSince >= DWELL_MS) { dwellFired = true; act(under, time); }
    const speed = light && lastLight && dt > 0 ? (light[0] - lastLight[0]) / dt : 0;
    lastLight = light ? [...light] : null;

    for (const g of groups.values()) {
      const d = light ? Math.hypot(light[0] - g.centre[0], light[1] - g.centre[1]) : Infinity, r = 95 + g.radius;
      g.near = presence * Math.exp(-(d * d) / (2 * r * r));
    }
    for (const p of parts) {
      const s = state[p.index - 1], g = groups.get(p.group), i = p.index * 4;
      const d = light ? Math.hypot(light[0] - p.centre[0], light[1] - p.centre[1]) : Infinity, r = 80 + p.radius;
      const near = presence * Math.exp(-(d * d) / (2 * r * r));
      const breath = .16 + .05 * Math.sin(t * .8 + s.phase);
      let wake = Math.max(breath, near), up = g.near, tx = 0, tz = 0, sway = 0, float = 0;
      switch (p.kind) {
        case KIND.tier:
          // A tower wakes from the ground up: each storey is slower to rise than the one below (see the spring).
          wake = Math.max(breath, up);
          break;
        case KIND.pine:
          sway = (Math.sin(t * .55 + g.centre[0] * .01) * .010 + Math.sin(t * 1.3 + p.order) * .004) * (1 + p.order * .35)
            - Math.max(-1, Math.min(1, speed / 900)) * near * .05 * (1 + p.order * .3);
          break;
        case KIND.mist:
          tx = Math.sin(t * .11 + s.phase) * 7;
          // The band parts where the hand passes, and floats a little higher.
          if (light) tz = Math.sign(p.centre[1] - light[1] || 1) * near * 7;
          wake = Math.max(.3, near); float = 5 + 12 * near;
          break;
        case KIND.bird: {
          const here = g.perch === p.order, carrier = p.attach && groups.get(p.attach);
          // The bird sinks into the lacquer at one perch and rises at the other; it stands with its pine.
          wake = here ? Math.max(.8, near) : 0;
          if (carrier) up = carrier.near;
          if (here && g.hopAt !== undefined && time - g.hopAt < 900) {
            const k = (time - g.hopAt) / 900;
            sway = Math.sin(k * Math.PI * 4) * .12 * (1 - k); float = Math.sin(k * Math.PI) * 9;
          }
          break;
        }
        case KIND.rock: up = near; break;
        case KIND.water: wake = Math.max(.3, near); break;
        default: break;
      }
      const stand = (STAND_REST + (1 - STAND_REST) * up) * body;
      if (still) {
        // Reduced motion keeps the light, the materials and the volume; nothing travels, swings or unfolds.
        s.wake.x = wake; s.stand.x = .6 * body; s.wake.v = s.stand.v = 0;
        s.dx.x = s.dz.x = s.sway.x = 0; s.dx.v = s.dz.v = s.sway.v = s.lift.v = 0; s.lift.x = p.kind === KIND.mist ? 8 : 0;
        stepSpring(s.glow, 0, 2.2, dt);
      } else {
        stepSpring(s.wake, wake, wake > s.wake.x ? 7 : 2.6, dt);   // quick to wake, about half a second to sink back
        stepSpring(s.stand, stand, (stand > s.stand.x ? 5.5 : 2.4) / (p.kind === KIND.tier ? 1 + p.order * .28 : 1), dt);
        stepSpring(s.glow, 0, 1.6, dt);
        stepSpring(s.dx, tx, 1.2, dt); stepSpring(s.dz, tz, 3, dt);
        stepDamped(s.sway, sway, 5.5, .3, dt);
        stepDamped(s.lift, float, 8, .55, dt);
      }
      a[i] = s.sway.x; a[i + 1] = Math.max(0, Math.min(1.08, s.stand.x));
      a[i + 2] = Math.max(0, Math.min(1.2, s.wake.x * (.35 + .65 * body)));
      a[i + 3] = Math.max(0, Math.min(1, s.glow.x));
      b[i] = s.dx.x; b[i + 1] = s.dz.x; b[i + 2] = Math.max(0, s.lift.x); b[i + 3] = p.groupIndex ?? 0;
    }
    // Slot 0 is the bare ground: it only breathes with the lid.
    a[1] = 0; a[2] = .35 + .65 * body;
    return {a, b, under};
  }
  return {update, act, a, b, state, groups};
}
