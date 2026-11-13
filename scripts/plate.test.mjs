import test from 'node:test';
import assert from 'node:assert/strict';
import {stepSpring, stepDamped, settled} from '../src/studies/toji/plate/spring.js';
import {PLATES, hasPlate, preparePlate, createLife, partAt, MAX_PARTS, LAYERS, DWELL_MS, STAND_REST} from '../src/studies/toji/plate/parts.js';
import {KIND, MAT, PLATE, roof, storey, kakezukuri, stoneSteps, stream, shell, steppingStones} from '../src/studies/toji/plate/vocab.js';
import {buildBox, shadeMatrix, SHADE_H} from '../src/studies/toji/plate/renderer.js';

const p3bWards = ['W_KITA', 'W_UKYO', 'W_NISHIKYO', 'W_SAKYO', 'W_KAMIGYO', 'W_SHIMOGYO', 'W_NAKAGYO', 'W_YAMASHINA'];
const inside = ([x, z], polygon) => {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [a, b] = polygon[i], [c, d] = polygon[j];
    if ((b > z) !== (d > z) && x < (c - a) * (z - b) / (d - b) + a) hit = !hit;
  }
  return hit;
};

test('P3b compositions keep their margins and both bird feet on a solid carrier', () => {
  for (const ward of p3bWards.filter(hasPlate)) {
    const {parts} = preparePlate(PLATES[ward]());
    for (const p of parts) {
      const limit = p.layer === 0 ? [372, 232] : [360, 230];
      for (const shape of [...p.fills, ...p.lines]) for (const [x, z] of shape.d) {
        assert.ok(Math.abs(x) <= limit[0] && Math.abs(z) <= limit[1], `${ward}: ${p.id} stays within the picture`);
      }
    }
    for (const bird of parts.filter(p => p.kind === KIND.bird)) {
      const carriers = parts.filter(p => p.group === bird.attach && (p.layer === 3 || p.id.includes('roof')));
      for (const line of bird.lines.slice(-2)) {
        assert.ok(carriers.some(p => p.fills.some(f => inside(line.d.at(-1), f.d))), `${ward}: ${bird.id} has a supported foot`);
      }
    }
    const groups = new Map();
    for (const p of parts.filter(p => p.layer > 0 && p.kind !== KIND.mist)) {
      const key = p.attach ?? p.group, a = groups.get(key), b = p.bounds;
      groups.set(key, a ? [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])] : b);
    }
    const entries = [...groups];
    for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
      const [a, A] = entries[i], [b, B] = entries[j];
      assert.ok(Math.max(B[0] - A[2], A[0] - B[2], B[1] - A[3], A[1] - B[3]) >= 12,
        `${ward}: ${a} and ${b} need breathing room`);
    }
  }
});

test('P3b ground fields reserve about a third of the lid and all eight wards are registered', () => {
  for (const ward of p3bWards) {
    assert.ok(hasPlate(ward), `${ward} has its own plate`);
    const parts = PLATES[ward](), fills = parts.flatMap(p => p.fills.map(f => f.d));
    const mist = parts.filter(p => p.kind === KIND.mist).length;
    const rocks = parts.filter(p => p.kind === KIND.rock).length;
    assert.ok(mist >= 2 && mist <= 4, `${ward} has two to four mist bands`);
    assert.ok(rocks >= 1 && rocks <= 3, `${ward} has one to three rocks`);
    // Sample the source silhouettes, not shadows or material brightness. Thin line work is not a ground field.
    let bare = 0, total = 0;
    for (let x = -356; x < 360; x += 8) for (let z = -226; z < 230; z += 8) {
      total++;
      if (!fills.some(p => inside([x, z], p))) bare++;
    }
    assert.ok(bare / total >= .26 && bare / total <= .46, `${ward} reserves ${(100 * bare / total).toFixed(1)}% of its source picture`);
  }
});

test('a critically damped spring settles without overshoot at any frame rate', () => {
  for (const dt of [1 / 120, 1 / 60, 1 / 10]) {
    const s = {x: 0, v: 0}; let peak = 0;
    for (let t = 0; t < 3; t += dt) { stepSpring(s, 1, 6, dt); peak = Math.max(peak, s.x); }
    assert.ok(peak <= 1 + 1e-9, `no overshoot at dt ${dt}`);
    assert.ok(settled(s, 1, 1e-3), `settled at dt ${dt}`);
  }
  const a = {x: 0, v: 0}, b = {x: 0, v: 0};
  stepSpring(a, 1, 6, .2); stepSpring(b, 1, 6, .1); stepSpring(b, 1, 6, .1);
  assert.ok(Math.abs(a.x - b.x) < 1e-9, 'one long step equals two short ones');
  assert.deepEqual(stepSpring({x: .3, v: 2}, 1, 6, 0), {x: .3, v: 2}, 'a zero step changes nothing');
});

test('an underdamped spring rings down and stays finite on a slow frame', () => {
  const s = {x: 0, v: 3};
  let crossed = false;
  for (let i = 0; i < 400; i++) { stepDamped(s, 0, 5.5, .3, .05); if (s.x < 0) crossed = true; assert.ok(Number.isFinite(s.x)); }
  assert.ok(crossed, 'it swings past rest');
  assert.ok(settled(s, 0, 1e-3));
});

test('every redrawn ward is a valid plate', () => {
  assert.equal(hasPlate('W_MINAMI'), true);
  assert.equal(hasPlate('toString'), false);
  for (const [ward, build] of Object.entries(PLATES)) {
    const {parts, errors} = preparePlate(build());
    assert.deepEqual(errors, [], ward);
    assert.ok(parts.length < MAX_PARTS, `${ward} fits the shader's part table`);
    const mats = new Set(Object.values(MAT));
    for (const p of parts) {
      assert.ok(mats.has(p.mat), `${p.id} uses a registered material`);
      assert.ok(p.layer >= 0 && p.layer < LAYERS);
      assert.ok(p.bounds[0] >= -PLATE.halfW - 20 && p.bounds[2] <= PLATE.halfW + 20, `${p.id} lies on the lid`);
      // A part hinges on its foot line: nothing of it may hang below, or it would sink into the lid as it stands.
      if (p.hinge) assert.ok(p.bounds[3] <= p.foot + 1e-6, `${p.id} stands on or above its foot`);
      if (p.layer === 0) assert.equal(p.hinge, 0, `${p.id}: the ground does not stand`);
    }
    assert.equal(parts.filter(p => p.kind === KIND.bird).length, 2, `${ward} has one uguisu with two perches`);
    // Solids that are not one thing keep apart in the picture. A part lying asleep covers the lid behind its foot;
    // if another solid's foot stood inside that patch, one would pass through the other whenever only one is awake.
    const solids = new Map();
    for (const p of parts) {
      if (p.layer === 0 || p.kind === KIND.mist) continue;
      const key = p.attach ?? p.group, b = solids.get(key);
      solids.set(key, b ? [Math.min(b[0], p.bounds[0]), Math.min(b[1], p.bounds[1]), Math.max(b[2], p.bounds[2]), Math.max(b[3], p.bounds[3])] : [...p.bounds]);
    }
    const list = [...solids];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const [a, A] = list[i], [b, B] = list[j];
      assert.ok(A[2] < B[0] || B[2] < A[0] || A[3] < B[1] || B[3] < A[1], `${ward}: ${a} and ${b} overlap in the picture`);
    }
    assert.deepEqual(build(), build(), `${ward} bakes the same every time`);
  }
});

test('preparePlate reports broken plates instead of baking them', () => {
  const part = {id: 'a', kind: KIND.tier, group: 'a', order: 0, layer: 2, mat: MAT.gold, reach: 1, thick: 5, bias: 0, anchor: [0, 0], fills: [{d: [[0, 0], [1, 0], [1, 1]], soft: 0, crisp: 1}], lines: []};
  assert.deepEqual(preparePlate([part]).errors, []);
  assert.match(preparePlate([part, part]).errors.join(), /duplicate id/);
  assert.match(preparePlate([{...part, layer: 0}]).errors.join(), /ground layer/);
  assert.match(preparePlate([{...part, fills: []}]).errors.join(), /empty/);
  assert.match(preparePlate([{...part, attach: 'nobody'}]).errors.join(), /unknown group/);
  assert.match(preparePlate([{...part, fills: [{d: [[0, 0], [NaN, 0], [1, 1]], soft: 0, crisp: 1}]}]).errors.join(), /bad point/);
});

test('picking takes the topmost layer and ignores points off the plate', () => {
  const w = 4, h = 2, maps = [new Uint8Array(8).fill(1), new Uint8Array(8), new Uint8Array(8), new Uint8Array(8)];
  maps[2][0] = 7;
  assert.equal(partAt(maps, w, h, -PLATE.halfW + 1, -PLATE.halfH + 1), 7);
  assert.equal(partAt(maps, w, h, PLATE.halfW - 1, PLATE.halfH - 1), 1);
  assert.equal(partAt(maps, w, h, PLATE.halfW + 5, 0), 0);
});

const plate = () => preparePlate(PLATES.W_MINAMI()).parts;
const run = (life, seconds, input, from = 0) => { let out; for (let t = 0; t < seconds; t += 1 / 60) out = life.update(1 / 60, {time: from + t * 1000, presence: 1, still: false, lift: 1, ...input}); return out; };

test('parts lie low when no one is there and stand when the light comes', () => {
  const parts = plate(), life = createLife(parts);
  const roof = parts.find(p => p.id === 'pagoda-roof-0'), far = parts.find(p => p.id === 'pine-a-trunk');
  const asleep = run(life, 3, {light: null, presence: 0});
  assert.ok(Math.abs(asleep.a[roof.index * 4 + 1] - STAND_REST) < .02, 'at rest the pagoda keeps only its resting lean');
  const dim = asleep.a[roof.index * 4 + 2];   // update() reuses its arrays
  const awake = run(life, 3, {light: roof.centre}, 3000);
  assert.ok(awake.a[roof.index * 4 + 1] > .85, 'the pagoda stands under the light');
  assert.ok(awake.a[far.index * 4 + 1] < .4, 'a pine far from the light stays low');
  assert.ok(awake.a[roof.index * 4 + 2] > dim + .3, 'and its gold wakes');
  const after = run(life, 4, {light: null, presence: 0}, 6000);
  assert.ok(Math.abs(after.a[roof.index * 4 + 1] - STAND_REST) < .03, 'it sinks back when the light leaves');
});

test('a tower wakes from the ground up', () => {
  const parts = plate(), life = createLife(parts);
  const low = parts.find(p => p.id === 'pagoda-roof-0'), high = parts.find(p => p.id === 'pagoda-roof-4');
  const out = run(life, .35, {light: [176, 40]});
  assert.ok(out.a[low.index * 4 + 1] > out.a[high.index * 4 + 1] + .02, 'the lowest roof leads the highest');
});

test('a flat lid and reduced motion', () => {
  const parts = plate(), life = createLife(parts), roof = parts.find(p => p.id === 'pagoda-roof-0'), leaf = parts.find(p => p.id === 'pine-a-leaf-1');
  const flat = run(life, 3, {light: roof.centre, lift: .025});
  assert.ok(flat.a[roof.index * 4 + 1] < .01, 'with the relief turned off nothing stands');
  const still = createLife(parts);
  const a = still.update(1 / 60, {time: 0, light: leaf.centre, presence: 1, still: true, lift: 1});
  const first = Array.from(a.a), firstB = Array.from(a.b);
  const b = still.update(1 / 60, {time: 5000, light: leaf.centre, presence: 1, still: true, lift: 1});
  assert.equal(b.a[leaf.index * 4], 0, 'no sway');
  for (const p of parts) {
    assert.equal(b.a[p.index * 4 + 1], 0, `${p.id} does not stand`);
    assert.equal(b.b[p.index * 4 + 2], 0, `${p.id} does not float`);
  }
  assert.ok(b.a[leaf.index * 4 + 2] > first[roof.index * 4 + 2], 'the part under the light still wakes more than one far from it');
  assert.deepEqual(Array.from(b.b), firstB, 'nothing travels');
});

test('dwelling on a part makes it answer once; the bird changes perch', () => {
  const parts = plate(), life = createLife(parts);
  const lamp = parts.find(p => p.id === 'kondo-wall-lamp'), wall = parts.find(p => p.id === 'kondo-wall');
  const maps = Array.from({length: LAYERS}, () => new Uint8Array(1)); maps[2][0] = wall.index;
  const input = {light: wall.centre, maps, mapW: 1, mapH: 1};
  let out = run(life, (DWELL_MS - 100) / 1000, input);
  assert.equal(out.a[lamp.index * 4 + 3], 0, 'not yet');
  out = run(life, .3, input, DWELL_MS - 100);
  assert.ok(out.a[lamp.index * 4 + 3] > .5, 'the hall lights its windows');
  out = run(life, 6, input, DWELL_MS + 200);
  assert.ok(out.a[lamp.index * 4 + 3] < .05, 'and the light fades; resting there does not ask again');

  const birds = parts.filter(p => p.kind === KIND.bird);
  out = run(life, 2, {light: null, presence: 0}, 10000);
  assert.ok(out.a[birds[0].index * 4 + 2] > .5 && out.a[birds[1].index * 4 + 2] < .05, 'the bird is at its first perch');
  assert.equal(life.act(birds[0].index, 12000), true);
  out = run(life, 3, {light: null, presence: 0}, 12000);
  assert.ok(out.a[birds[0].index * 4 + 2] < .05 && out.a[birds[1].index * 4 + 2] > .5, 'and now at its second');
  assert.equal(life.act(0, 0), false, 'bare ground has no answer');
});

test('the shade sees the whole lid from above the lamp', () => {
  const at = (m, x, y, z) => { const w = m[3] * x + m[7] * y + m[11] * z + m[15]; return [0, 1, 2].map(k => (m[k] * x + m[4 + k] * y + m[8 + k] * z + m[12 + k]) / w); };
  for (const [lx, lz] of [[0, 0], [-430, 300], [280, -120]]) {
    const m = shadeMatrix(lx, lz);
    for (const x of [-372, 372]) for (const z of [-242, 242]) assert.ok(at(m, x, 0, z).every(v => Math.abs(v) < 1), `lid corner ${x},${z} at lamp ${lx},${lz}`);
    // Straight under the lamp a tall thing shades only its own foot; away from it the shadow falls outward.
    const foot = at(m, lx, 0, lz), top = at(m, lx, 250, lz);
    assert.ok(Math.hypot(top[0] - foot[0], top[1] - foot[1]) < 1e-6 && top[2] < foot[2], 'nearer the lamp is nearer in depth');
    const out = at(m, lx + 100, 200, lz), shadow = at(m, lx + 100 * SHADE_H / (SHADE_H - 200), 0, lz);
    assert.ok(Math.hypot(out[0] - shadow[0], out[1] - shadow[1]) < 1e-6, 'a point and its shadow lie on one ray from the lamp');
  }
});

test('the box mesh is closed into the ranges the renderer draws', () => {
  const box = buildBox();
  assert.equal(box.data.length, box.total * 10);
  assert.ok(0 < box.lidTop && box.lidTop < box.opaque && box.opaque < box.total);
  for (let i = 0; i < box.lidTop; i++) assert.equal(box.data[i * 10 + 8], 0, 'the lid top comes first');
  for (let i = box.opaque; i < box.total; i++) assert.equal(box.data[i * 10 + 8], 25, 'the floor shadow comes last');
  assert.ok(box.data.every(Number.isFinite));
});

test('a cord keeps its length, stays on the floor and out of the box, and comes to rest', async () => {
  const {createCord, cordTube} = await import('../src/studies/toji/plate/cord.js');
  const anchor = [40, -72, 239], out = [0, 1], cord = createCord({anchor, out});
  cord.settle();
  const rest = cord.points.map(p => [...p]);
  cord.step(1 / 60, {kick: 420});
  for (let i = 0; i < 30; i++) cord.step(1 / 60, {ax: 3000});
  const tip = cord.points.at(-1);
  assert.ok(Math.hypot(tip[0] - rest.at(-1)[0], tip[2] - rest.at(-1)[2]) > 1, 'a pull moves the tail');
  for (let i = 0; i < 600; i++) cord.step(1 / 60);
  assert.deepEqual(cord.points[0], anchor);
  for (let i = 1; i < cord.points.length; i++) {
    const a = cord.points[i - 1], b = cord.points[i], length = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    assert.ok(Math.abs(length - cord.seg) < cord.seg * .06, `link ${i} is ${length}`);
    assert.ok(b[1] >= -92.5 - 1e-6, 'never below the floor');
    assert.ok(b[2] >= anchor[2] + 2 - 1e-6, 'never inside the box');
  }
  const before = cord.points.map(p => [...p]);
  for (let i = 0; i < 60; i++) cord.step(1 / 60);
  cord.points.forEach((p, i) => assert.ok(Math.hypot(p[0] - before[i][0], p[1] - before[i][1], p[2] - before[i][2]) < .05, `node ${i} is at rest`));
  const tube = cordTube(cord.points, out);
  assert.equal(tube.length, (cord.points.length - 1) * 6 * 6 * 10);
  assert.ok(tube.every(Number.isFinite));
});

test('preparePlate reports zero-area fills while ignoring pure line work', () => {
  const base = {id: 'z', kind: KIND.still, group: 'z', order: 0, layer: 0, mat: MAT.gold, reach: 1, thick: 0, bias: 0, anchor: [0, 0], fills: [], lines: []};
  assert.match(preparePlate([{...base, fills: [{d: [[0, 0], [10, 0], [20, 0]], soft: 0, crisp: 1}]}]).errors.join(), /z: zero-area fill/);
  assert.match(preparePlate([{...base, fills: [{d: [[5, 5], [5, 5], [5, 5]], soft: 0, crisp: 1}]}]).errors.join(), /z: zero-area fill/);
  assert.deepEqual(preparePlate([{...base, lines: [{d: [[0, 0], [10, 0]], w: 1, amp: 1}]}]).errors, []);
});

test('vocab builders reject invalid counts, mismatched widths, and empty arrays', () => {
  assert.throws(() => roof('r', 0, 0, 40, 20, {tiles: 0}), /roof.*tiles/);
  assert.throws(() => storey('s', 0, -20, 0, 40, {bays: 0}), /storey.*bays/);
  assert.throws(() => kakezukuri('k', -40, 40, -30, 0, {posts: 1}), /kakezukuri.*posts/);
  assert.throws(() => stoneSteps('st', 0, -20, 20, 10, 20, 0), /stoneSteps.*count/);
  assert.throws(() => stream('w', [[0, 0], [20, 10]], [5]), /stream.*widths/);
  assert.throws(() => shell('sh', []), /shell.*spots/);
  assert.throws(() => steppingStones('ss', []), /steppingStones.*points/);
});
