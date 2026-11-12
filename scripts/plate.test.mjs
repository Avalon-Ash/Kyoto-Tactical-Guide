import test from 'node:test';
import assert from 'node:assert/strict';
import {stepSpring, stepDamped, settled} from '../src/studies/toji/plate/spring.js';
import {PLATES, hasPlate, preparePlate, createLife, partAt, MAX_PARTS, LAYERS, DWELL_MS, STAND_REST} from '../src/studies/toji/plate/parts.js';
import {KIND, MAT, PLATE} from '../src/studies/toji/plate/vocab.js';
import {buildBox} from '../src/studies/toji/plate/renderer.js';

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
  assert.equal(hasPlate('W_KITA'), false);
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
  assert.equal(b.a[leaf.index * 4 + 1], first[leaf.index * 4 + 1], 'the pose holds');
  assert.ok(b.a[leaf.index * 4 + 1] > .4, 'but the volume is kept');
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

test('the box mesh is closed into the ranges the renderer draws', () => {
  const box = buildBox();
  assert.equal(box.data.length, box.total * 10);
  assert.ok(0 < box.lidTop && box.lidTop < box.opaque && box.opaque < box.total);
  for (let i = 0; i < box.lidTop; i++) assert.equal(box.data[i * 10 + 8], 0, 'the lid top comes first');
  for (let i = box.opaque; i < box.total; i++) assert.equal(box.data[i * 10 + 8], 25, 'the floor shadow comes last');
  assert.ok(box.data.every(Number.isFinite));
});
