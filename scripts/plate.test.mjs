import test from 'node:test';
import assert from 'node:assert/strict';
import {stepSpring, stepDamped, settled} from '../src/studies/toji/plate/spring.js';
import {PLATES, hasPlate, preparePlate, createLife, partAt, MAX_PARTS, LAYERS, DWELL_MS, STAND_REST} from '../src/studies/toji/plate/parts.js';
import {KIND, MAT, PLATE, roof, storey, kakezukuri, stoneSteps, stream, shell, steppingStones, corridor, romon, sanmon, karamon} from '../src/studies/toji/plate/vocab.js';
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

test('all trees use finite limbs and bounded stamps, without inflated crown geometry', async () => {
  const {stampOutline} = await import('../src/studies/toji/plate/stamps.js');
  const {limbMesh,stampInstances} = await import('../src/studies/toji/plate/limbs.js');
  for (const [ward,build] of Object.entries(PLATES)) {
    const {parts,errors}=preparePlate(build()); assert.deepEqual(errors,[]);
    const trees=parts.filter(p=>p.kind===KIND.pine);
    assert.ok(trees.length>0,ward);
    for (const p of trees) {
      assert.ok(Array.isArray(p.limbs)&&Array.isArray(p.stamps),p.id);
      assert.equal(p.thick,0,'tree geometry cannot feed the pillow height');
      for(const l of p.limbs) for(const point of l.points) {
        assert.ok(point.every(Number.isFinite)); assert.ok(point[2]>0&&point[2]<=30);
      }
      for(const s of p.stamps) {
        assert.ok(s.w>=1&&s.w<=160&&s.h>=1&&s.h<=160);
        assert.ok(Object.values(MAT).includes(s.mat));
        for(const [x,z] of stampOutline(s)) assert.ok(Math.abs(x)<=360&&Math.abs(z)<=230,ward+': '+p.id+' stamp stays on lid');
      }
    }
    assert.ok(limbMesh(trees).every(Number.isFinite));assert.ok(stampInstances(trees).every(Number.isFinite));
    assert.ok(parts.length<MAX_PARTS);
  }
});

test('a four-unit twig keeps its actual width and elliptical height without a blur map', async () => {
  const {limbMesh,LIMB_HEIGHT}=await import('../src/studies/toji/plate/limbs.js');
  const mesh=limbMesh([{index:1,foot:0,anchor:[0,0],hinge:1.1,mat:MAT.gold,limbs:[{points:[[0,0,2],[0,-20,2]]}]}]);
  const xs=[],ys=[];for(let i=0;i<mesh.length;i+=16){xs.push(mesh[i]);ys.push(mesh[i+1]);}
  assert.equal(Math.max(...xs)-Math.min(...xs),4);
  assert.ok(Math.abs(Math.max(...ys)-2*LIMB_HEIGHT)<1e-6);assert.equal(Math.min(...ys),0);
});

test('both bird feet rest inside actual branches in all migrated wards', () => {
  for(const [ward,build] of Object.entries(PLATES)) {
    const {parts}=preparePlate(build());
    for(const bird of parts.filter(p=>p.kind===KIND.bird&&p.treeRider)) {
      const wood=parts.filter(p=>p.group===bird.attach&&p.limbs?.length);
      assert.ok(wood.length>0);
      for(const line of bird.lines.slice(-2)) assert.ok(wood.some(p=>p.fills.some(f=>inside(line.d.at(-1),f.d))),ward+': '+bird.id+' foot is on wood, not a bounding box');
    }
    const life=createLife(parts),state=run(life,3,{light:[-200,130]});
    for(const p of parts.filter(p=>p.treeRider||p.limbs&&p.order>0)) {
      const carrier=parts.find(t=>t.group===(p.attach??p.group)&&t.limbs?.length);
      assert.equal(state.a[p.index*4],state.a[carrier.index*4],'shared sway');
      assert.equal(state.a[p.index*4+1],state.a[carrier.index*4+1],'shared hinge');
    }
  }
});

test('preparePlate rejects malformed tree geometry before GPU upload', () => {
  const tree=PLATES.W_MINAMI().find(p=>p.limbs?.length);
  assert.match(preparePlate([{...tree,limbs:[{points:[[0,0,NaN],[0,2,1]]}]}]).errors.join(),/bad limb/);
  assert.match(preparePlate([{...tree,stamps:[{x:0,z:0,w:0,h:10,turn:0,offset:3,relief:.3,cell:2,mat:MAT.gold}]}]).errors.join(),/bad stamp/);
});

const triInXZ = ([px, pz], a, b, c) => {
  const s1 = (b[0] - a[0]) * (pz - a[2]) - (b[2] - a[2]) * (px - a[0]);
  const s2 = (c[0] - b[0]) * (pz - b[2]) - (c[2] - b[2]) * (px - b[0]);
  const s3 = (a[0] - c[0]) * (pz - c[2]) - (a[2] - c[2]) * (px - c[0]);
  return (s1 >= -1e-6 && s2 >= -1e-6 && s3 >= -1e-6) || (s1 <= 1e-6 && s2 <= 1e-6 && s3 <= 1e-6);
};

const topTrianglesXZ = (meshChunks, pt) => {
  for (const chunk of meshChunks) {
    const v = chunk.vertices;
    for (let i = 0; i < v.length; i += 24) {
      if (v[i + 4] > .5 && v[i + 12] > .5 && v[i + 20] > .5) {
        if (triInXZ(pt, [v[i], v[i + 1], v[i + 2]], [v[i + 8], v[i + 9], v[i + 10]], [v[i + 16], v[i + 17], v[i + 18]])) return true;
      }
    }
  }
  return false;
};

const assertValidMeshChunks = chunks => {
  assert.ok(Array.isArray(chunks) && chunks.length > 0);
  for (const c of chunks) {
    assert.ok(Object.values(MAT).includes(c.mat));
    assert.ok(Array.isArray(c.vertices) && c.vertices.length > 0 && c.vertices.length % 24 === 0);
    const v = c.vertices;
    for (let i = 0; i < v.length; i += 24) {
      for (let k = 0; k < 24; k++) assert.ok(Number.isFinite(v[i + k]));
      const abx = v[i + 8] - v[i], aby = v[i + 9] - v[i + 1], abz = v[i + 10] - v[i + 2];
      const acx = v[i + 16] - v[i], acy = v[i + 17] - v[i + 1], acz = v[i + 18] - v[i + 2];
      const area = .5 * Math.hypot(aby * acz - abz * acy, abz * acx - abx * acz, abx * acy - aby * acx);
      assert.ok(area > 1e-8, `non-degenerate triangle area (${area})`);
      for (const off of [3, 11, 19]) {
        const len = Math.hypot(v[i + off], v[i + off + 1], v[i + off + 2]);
        assert.ok(Math.abs(len - 1) < 1e-4, `unit normal length (${len})`);
      }
    }
  }
};

test('explicit mesh geometry builders produce closed non-degenerate meshes and reject bad input', async () => {
  const {extrudeConvex, sweepHalfTube, ribbonMesh} = await import('../src/studies/toji/plate/mesh-geometry.js');

  const bar = extrudeConvex([[0, 0], [2, 0], [2, 10], [0, 10]], 0, 6, MAT.gold);
  assertValidMeshChunks([bar]);
  const xs = [], ys = [], zs = [];
  for (let i = 0; i < bar.vertices.length; i += 8) {
    xs.push(bar.vertices[i]); ys.push(bar.vertices[i + 1]); zs.push(bar.vertices[i + 2]);
  }
  assert.ok(Math.abs(Math.min(...xs) - 0) < 1e-5 && Math.abs(Math.max(...xs) - 2) < 1e-5);
  assert.ok(Math.abs(Math.min(...ys) - 0) < 1e-5 && Math.abs(Math.max(...ys) - 6) < 1e-5);
  assert.ok(Math.abs(Math.min(...zs) - 0) < 1e-5 && Math.abs(Math.max(...zs) - 10) < 1e-5);
  let hasTop = false, hasBottom = false, hasSide = false;
  for (let i = 0; i < bar.vertices.length; i += 8) {
    const ny = bar.vertices[i + 4];
    if (ny > .99) hasTop = true;
    else if (ny < -.99) hasBottom = true;
    else if (Math.abs(ny) < 1e-5) hasSide = true;
  }
  assert.ok(hasTop && hasBottom && hasSide, 'extrudeConvex has top, bottom, and side faces');

  const tube = sweepHalfTube([[0, 0, 1], [0, -20, 1]], {heightRatio: .6, baseY: 0, mat: MAT.gold, sides: 12});
  assertValidMeshChunks([tube]);
  const txs = [], tys = [];
  let hasTubeBottom = false, hasTubeCaps = 0;
  for (let i = 0; i < tube.vertices.length; i += 8) {
    txs.push(tube.vertices[i]); tys.push(tube.vertices[i + 1]);
    if (tube.vertices[i + 4] < -.99) hasTubeBottom = true;
    if (Math.abs(tube.vertices[i + 5]) > .99) hasTubeCaps++;
  }
  assert.ok(Math.abs(Math.max(...txs) - Math.min(...txs) - 2) < 1e-5);
  assert.ok(Math.abs(Math.min(...tys) - 0) < 1e-5 && Math.abs(Math.max(...tys) - .6) < 1e-5);
  assert.ok(hasTubeBottom && hasTubeCaps >= 72, 'sweepHalfTube has flat bottom and both end caps');

  const rib = ribbonMesh([[0, 2, 0], [10, 2, 0], [10, 2, 10]], 2, .5, MAT.hyomonGold);
  assertValidMeshChunks([rib]);
  const rxs = [], rys = [], rzs = [];
  for (let i = 0; i < rib.vertices.length; i += 8) {
    rxs.push(rib.vertices[i]); rys.push(rib.vertices[i + 1]); rzs.push(rib.vertices[i + 2]);
  }
  assert.ok(Math.max(...rxs) <= 11 + 1e-5 && Math.min(...rzs) >= -1 - 1e-5, 'bevel join avoids miter spike');
  assert.ok(Math.abs(Math.min(...rys) - 2) < 1e-5 && Math.abs(Math.max(...rys) - 2.5) < 1e-5);

  assert.throws(() => extrudeConvex([], 0, 2, MAT.gold));
  assert.throws(() => extrudeConvex([[0, 0], [NaN, 0], [1, 1]], 0, 2, MAT.gold));
  assert.throws(() => extrudeConvex([[0, 0], [2, 0], [2, 2], [0, 2]], 4, 2, MAT.gold));
  assert.throws(() => extrudeConvex([[0, 0], [2, 0], [2, 2], [0, 2]], 2, 2, MAT.gold));
  assert.throws(() => extrudeConvex([[0, 0], [4, 0], [1, 1], [0, 4]], 0, 2, MAT.gold));
  assert.throws(() => sweepHalfTube([[0, 0, 1]], {mat: MAT.gold}));
  assert.throws(() => sweepHalfTube([[0, 0, 0], [0, -10, 1]], {mat: MAT.gold}));
  assert.throws(() => sweepHalfTube([[0, 0, 1], [0, 0, 1]], {mat: MAT.gold}));
  assert.throws(() => sweepHalfTube([[0, 0, 1], [0, -10, NaN]], {mat: MAT.gold}));
  assert.throws(() => ribbonMesh([[0, 0, 0]], 1, .2, MAT.gold));
  assert.throws(() => ribbonMesh([[0, 0, 0], [5, 0, 0]], 0, .2, MAT.gold));
  assert.throws(() => ribbonMesh([[0, 0, 0], [0, 1, 0]], 1, .2, MAT.gold));
});

test('torii and kakezukuri keep true open apertures, real beam/post coverage, and valid meshes', async () => {
  const {torii} = await import('../src/studies/toji/plate/vocab.js');
  for (const s of [1.22, .74, .44]) {
    const parts = torii('t', 0, 0, s, {cap: s === 1.22});
    assert.equal(parts.length, s === 1.22 ? 2 : 1);
    const gate = parts[0];
    assert.equal(gate.thick, 0);
    assertValidMeshChunks(gate.mesh);
    if (parts[1]) {
      assert.equal(parts[1].thick, 0);
      assert.equal(parts[1].motionWith, 't');
      assertValidMeshChunks(parts[1].mesh);
    }
    const lowerHole = [0, -26 * s];
    assert.equal(gate.fills.some(f => inside(lowerHole, f.d)), false, `torii s=${s} lower hole not in fills`);
    assert.equal(topTrianglesXZ(gate.mesh, lowerHole), false, `torii s=${s} lower hole has no top triangles`);
    const upperHoles = s >= 1 ? [[-16 * s, -74 * s], [16 * s, -74 * s]] : [[0, -74 * s]];
    for (const uh of upperHoles) {
      assert.equal(gate.fills.some(f => inside(uh, f.d)), false, `torii s=${s} upper hole not in fills`);
      assert.equal(topTrianglesXZ(gate.mesh, uh), false, `torii s=${s} upper hole has no top triangles`);
    }
    const nukiMid = [0, -56.5 * s];
    assert.equal(gate.fills.some(f => inside(nukiMid, f.d)), true, `torii s=${s} nuki midpoint in fills`);
    assert.equal(topTrianglesXZ(gate.mesh, nukiMid), true, `torii s=${s} nuki midpoint in mesh`);
    for (const side of [-1, 1]) {
      const postMid = [side * 34 * s, -45 * s];
      assert.equal(gate.fills.some(f => inside(postMid, f.d)), true, `torii s=${s} post ${side} in fills`);
    }
  }

  const [frame, deck] = kakezukuri('butai', -40, 252, -8, 104, {posts: 8, ties: 3});
  assert.equal(frame.thick, 0);
  assert.equal(deck.thick, 0);
  assert.equal(frame.rigidGroup, true);
  assertValidMeshChunks(frame.mesh);
  assertValidMeshChunks(deck.mesh);
  for (const x of [-36, 248]) {
    assert.equal(frame.fills.some(f => inside([x, 48], f.d)), true, `outer post at x=${x} in fills`);
    assert.equal(topTrianglesXZ(frame.mesh, [x, 48]), true, `outer post at x=${x} in mesh`);
  }
  const holeX = (-36 + (-40 + 4 + (292 - 8) / 7)) / 2;
  for (const z of [10, 37, 64, 90]) {
    assert.equal(frame.fills.some(f => inside([holeX, z], f.d)), false, `frame hole (${holeX},${z}) not in fills`);
    assert.equal(topTrianglesXZ(frame.mesh, [holeX, z]), false, `frame hole (${holeX},${z}) has no top triangles`);
  }
  const railHole = [-40 - 9 + .9 + 6.5, -8 - 3 - 5];
  assert.equal(deck.fills.some(f => inside(railHole, f.d)), false, 'railing hole not in fills');
  assert.equal(topTrianglesXZ(deck.mesh, railHole), false, 'railing hole has no top triangles');
});

test('preparePlate validates mesh/motionWith and preserves all 11 wards without migrating non-targets', () => {
  const basePart = {id: 'a', kind: KIND.tier, group: 'g', order: 0, layer: 2, mat: MAT.gold, reach: 1, thick: 0, bias: 0, anchor: [0, 0], fills: [{d: [[0, 0], [2, 0], [2, 2]], soft: 0, crisp: 1}], lines: []};
  assert.match(preparePlate([{...basePart, mesh: []}]).errors.join(), /bad mesh/);
  assert.match(preparePlate([{...basePart, mesh: [{mat: 999, vertices: new Array(24).fill(0)}]}]).errors.join(), /bad mesh chunk/);
  assert.match(preparePlate([{...basePart, mesh: [{mat: MAT.gold, vertices: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, NaN, 0, 1, 0, 1, 0, 0, 0]}]}]).errors.join(), /non-finite mesh/);
  assert.match(preparePlate([{...basePart, mesh: [{mat: MAT.gold, vertices: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0]}]}]).errors.join(), /degenerate mesh/);
  assert.match(preparePlate([{...basePart, mesh: [{mat: MAT.gold, vertices: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0]}]}]).errors.join(), /bad mesh normal/);

  assert.match(preparePlate([{...basePart, motionWith: 'missing'}]).errors.join(), /motionWith unknown/);
  assert.match(preparePlate([{...basePart, motionWith: 'a'}]).errors.join(), /motionWith self/);
  assert.match(preparePlate([basePart, {...basePart, id: 'b', group: 'other', motionWith: 'a'}]).errors.join(), /motionWith crosses group/);
  assert.match(preparePlate([{...basePart, motionWith: 'b'}, {...basePart, id: 'b', motionWith: 'a'}]).errors.join(), /motionWith cycle/);
  assert.match(preparePlate([basePart, {...basePart, id: 'b', kind: KIND.bird}, {...basePart, id: 'c', motionWith: 'b'}]).errors.join(), /motionWith bird/);
  assert.match(preparePlate([{...basePart, rigidGroup: true}, {...basePart, id: 'b', rigidGroup: true}]).errors.join(), /multiple rigidGroup/);

  const expectedCounts = {W_MINAMI: 48, W_UKYO: 25, W_NISHIKYO: 33, W_YAMASHINA: 34, W_FUSHIMI: 36, W_KITA: 29, W_KAMIGYO: 39, W_SAKYO: 31, W_NAKAGYO: 42, W_HIGASHIYAMA: 26, W_SHIMOGYO: 28};
  for (const [ward, build] of Object.entries(PLATES)) {
    const {parts, errors} = preparePlate(build());
    assert.deepEqual(errors, [], ward);
    assert.equal(parts.length, expectedCounts[ward], `${ward} part count`);
  }

  const fushimi = preparePlate(PLATES.W_FUSHIMI()).parts;
  for (const p of fushimi) {
    // Scope fence (p1, widened by p2): torii and the rōmon are explicit meshes; the rest of Fushimi is not migrated yet.
    const isTorii = p.id === 'torii' || p.id === 'torii-lip' || p.id.startsWith('gate-');
    if (isTorii || p.id.startsWith('romon-')) {
      assert.ok(Array.isArray(p.mesh) && p.mesh.length > 0, `${p.id} has mesh`);
      assert.equal(p.thick, 0, `${p.id} thick is 0`);
    } else {
      assert.equal(p.mesh, undefined, `${p.id} is not migrated`);
    }
  }
  assert.equal(fushimi.find(p => p.id === 'torii-lip').motionWith, 'torii');

  const higashiyama = preparePlate(PLATES.W_HIGASHIYAMA()).parts;
  for (const p of higashiyama) {
    // Scope fence (p1, widened by p2): the stage and the hondō on it are explicit meshes.
    if (p.id === 'butai-frame' || p.id === 'butai-deck' || p.id.startsWith('hondo-')) {
      assert.ok(Array.isArray(p.mesh) && p.mesh.length > 0, `${p.id} has mesh`);
      assert.equal(p.thick, 0, `${p.id} thick is 0`);
    } else {
      assert.equal(p.mesh, undefined, `${p.id} is not migrated`);
    }
    if (p.group === 'butai' && p.id !== 'butai-frame') {
      assert.equal(p.motionWith, 'butai-frame', `${p.id} follows butai-frame`);
    }
  }
});

test('life syncs butai rigidGroup motion while keeping materials independent, and packMeshes produces valid GPU data', async () => {
  const {packMeshes} = await import('../src/studies/toji/plate/mesh-geometry.js');
  const hParts = preparePlate(PLATES.W_HIGASHIYAMA()).parts;
  const life = createLife(hParts);
  const frame = hParts.find(p => p.id === 'butai-frame');
  const followers = hParts.filter(p => p.group === 'butai' && p.id !== 'butai-frame');
  assert.equal(followers.length, 5);

  // Wake near one end of hondo so distances differ across members
  const awake = run(life, 1.2, {light: [40, 10]});
  for (const f of followers) {
    assert.equal(awake.a[f.index * 4], awake.a[frame.index * 4], `${f.id} sway matches frame`);
    assert.equal(awake.a[f.index * 4 + 1], awake.a[frame.index * 4 + 1], `${f.id} stand matches frame`);
    assert.equal(awake.b[f.index * 4], awake.b[frame.index * 4], `${f.id} dx matches frame`);
    assert.equal(awake.b[f.index * 4 + 1], awake.b[frame.index * 4 + 1], `${f.id} dz matches frame`);
    assert.equal(awake.b[f.index * 4 + 2], awake.b[frame.index * 4 + 2], `${f.id} lift matches frame`);
  }
  const roof = hParts.find(p => p.id === 'hondo-roof');
  const lamp = hParts.find(p => p.id === 'hondo-wall-lamp');
  // At low light far from the group, each part keeps its own breathing phase in a.z (rise)
  const dimOut = run(life, .5, {light: [-320, 180], presence: .2}, 1500);
  assert.notEqual(dimOut.a[lamp.index * 4 + 2], dimOut.a[frame.index * 4 + 2], 'rise stays per-part');

  // After act(), lift and glow behave properly without splitting the rigid group
  assert.equal(life.act(roof.index, 2000), true);
  const acted = run(life, .2, {light: [40, 10]}, 2000);
  for (const f of followers) {
    assert.equal(acted.b[f.index * 4 + 2], acted.b[frame.index * 4 + 2], `${f.id} lift stays synced after act`);
    assert.ok(acted.a[f.index * 4 + 3] > 0, `${f.id} glow wakes on act`);
  }

  // Under still: true, all motion channels zero while wake still answers light
  const stillLife = createLife(hParts);
  const stillOut = stillLife.update(1 / 60, {time: 5000, light: lamp.centre, presence: 1, still: true, lift: 1});
  for (const f of [frame, ...followers]) {
    assert.equal(stillOut.a[f.index * 4], 0);
    assert.equal(stillOut.a[f.index * 4 + 1], 0);
    assert.equal(stillOut.b[f.index * 4], 0);
    assert.equal(stillOut.b[f.index * 4 + 1], 0);
    assert.equal(stillOut.b[f.index * 4 + 2], 0);
  }
  assert.ok(stillOut.a[lamp.index * 4 + 2] > .5);

  // Verify packed mesh buffers for Fushimi & Higashiyama
  for (const ward of ['W_FUSHIMI', 'W_HIGASHIYAMA']) {
    const parts = preparePlate(PLATES[ward]()).parts;
    const meshParts = parts.filter(p => p.mesh);
    const buf = packMeshes(meshParts);
    assert.ok(buf instanceof Float32Array && buf.length > 0 && buf.length % 16 === 0);
    for (let i = 0; i < buf.length; i++) assert.ok(Number.isFinite(buf[i]));
    let cursor = 0;
    for (const p of meshParts) {
      for (const chunk of p.mesh) {
        const count = chunk.vertices.length / 8;
        for (let k = 0; k < count; k++) {
          const base = (cursor + k) * 16;
          assert.equal(buf[base + 8], p.index);
          assert.equal(buf[base + 9], Math.fround(p.foot));
          assert.equal(buf[base + 10], Math.fround(p.anchor[0]));
          assert.equal(buf[base + 11], Math.fround(p.anchor[1]));
          assert.equal(buf[base + 12], Math.fround(p.hinge));
          assert.equal(buf[base + 13], chunk.mat);
          assert.equal(buf[base + 14], 0);
          assert.equal(buf[base + 15], Math.fround(p.bias));
        }
        cursor += count;
      }
    }
    assert.equal(cursor, buf.length / 16);
  }
});

test('torii post ribbons and kakezukuri deck front band exist at true surface heights', async () => {
  const {torii} = await import('../src/studies/toji/plate/vocab.js');
  const yBounds = v => {
    let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < v.length; i += 8) {
      minX = Math.min(minX, v[i]); maxX = Math.max(maxX, v[i]);
      minY = Math.min(minY, v[i + 1]); maxY = Math.max(maxY, v[i + 1]);
      minZ = Math.min(minZ, v[i + 2]); maxZ = Math.max(maxZ, v[i + 2]);
    }
    return {minX, maxX, minY, maxY, minZ, maxZ};
  };

  for (const s of [1.22, .74, .44]) {
    const [gate] = torii('t', 0, 0, s);
    assertValidMeshChunks(gate.mesh);
    const ribbons = gate.mesh.filter(c => c.mat === MAT.hyomonGold);
    assert.equal(ribbons.length, 3, `torii s=${s} has kasagi + 2 post gold ribbons`);
    const postRibbons = ribbons.filter(c => yBounds(c.vertices).maxZ > -60 * s);
    assert.equal(postRibbons.length, 2, `torii s=${s} has both post ribbons`);
    for (const pr of postRibbons) {
      const b = yBounds(pr.vertices);
      assert.ok(Math.abs(b.minZ - (-52 * s)) < .05 * s && Math.abs(b.maxZ - (-9 * s)) < .05 * s, `s=${s} post ribbon z range`);
      // Tapered semi-elliptical post drops from h=9 (~3.64*s) to h=52 (~3.29*s), plus .15*s ribbon thickness.
      assert.ok(b.maxY - b.minY > .35 * s, `s=${s} post ribbon follows curved/tapered surface rather than fixed y`);
      assert.ok(b.minY > 3.1 * s && b.maxY < 4.0 * s, `s=${s} post ribbon sits on post surface`);
    }
  }

  const fushimiGates = preparePlate(PLATES.W_FUSHIMI()).parts.filter(p => p.id === 'torii' || p.id.startsWith('gate-'));
  assert.equal(fushimiGates.length, 6);
  for (const g of fushimiGates) {
    assert.equal(g.mesh.filter(c => c.mat === MAT.hyomonGold).length, 3, `${g.id} retains all 3 gold bands`);
  }

  const [, deck] = kakezukuri('butai', -40, 252, -8, 104, {posts: 8, ties: 3});
  assertValidMeshChunks(deck.mesh);
  const silverBands = deck.mesh.filter(c => c.mat === MAT.hyomonSilver);
  assert.equal(silverBands.length, 1, 'butai-deck has front hyomonSilver band');
  const sb = yBounds(silverBands[0].vertices);
  assert.ok(Math.abs(sb.minX - (-48)) < 1e-5 && Math.abs(sb.maxX - 260) < 1e-5, 'deck front band x span');
  assert.ok(Math.abs(sb.minZ - (-7.35)) < 1e-5 && Math.abs(sb.maxZ - (-6.65)) < 1e-5, 'deck front band z width .7 at zDeck+1');
  assert.ok(Math.abs(sb.minY - 10) < 1e-5 && Math.abs(sb.maxY - 10.15) < 1e-5, 'deck front band sits on y=10 with .15 thickness');

  const hDeck = preparePlate(PLATES.W_HIGASHIYAMA()).parts.find(p => p.id === 'butai-deck');
  assert.equal(hDeck.mesh.filter(c => c.mat === MAT.hyomonSilver).length, 1, 'W_HIGASHIYAMA butai-deck keeps front silver band');
});

// ---- p2: roofed buildings as explicit meshes -------------------------------------------------------------------
const inPoly = (d, x, z) => {
  let inside = false;
  for (let i = 0, j = d.length - 1; i < d.length; j = i++) {
    const [xi, zi] = d[i], [xj, zj] = d[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
};
const meshCovers = (v, x, z) => {
  for (let i = 0; i < v.length; i += 24) {
    const ax = v[i], az = v[i + 2], bx = v[i + 8], bz = v[i + 10], cx = v[i + 16], cz = v[i + 18];
    const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
    if (Math.abs(d) < 1e-9) continue;
    const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
    if (l1 >= 0 && l2 >= 0 && l1 + l2 <= 1) return true;
  }
  return false;
};
const covers = (parts, x, z) => parts.some(p => p.fills.some(f => inPoly(f.d, x, z)) || (p.mesh || []).some(c => meshCovers(c.vertices, x, z)));

test('p2 roofs are shells on the original outline: real thickness, upturned wings, tile bands on the surface, mountY', async () => {
  const {roofSurface} = await import('../src/studies/toji/plate/architecture-mesh.js');
  for (const [halfW, mat] of [[58, MAT.gold], [153, MAT.lacquer]]) {
    const k = halfW < 75 ? .8 : 1, rise = halfW * .4, ridgeHalf = halfW * .3, upturn = halfW * .09, tiles = 9;
    const [p, lip] = roof('t', 0, 0, halfW, rise, {ridgeHalf, upturn, mat, tiles});
    const S = roofSurface(0, 0, halfW, rise, ridgeHalf, upturn).at;
    assert.equal(p.thick, 0);
    assert.equal(lip.thick, 0);
    assert.equal(lip.motionWith, 't');
    assert.equal(p.mountY, 14 * k);
    const ys = [];
    for (let i = 1; i < p.mesh[0].vertices.length; i += 8) ys.push(p.mesh[0].vertices[i]);
    assert.ok(Math.abs(Math.max(...ys) - 16.61 * k) < .15, `${halfW}: crown of the slope stands proud`);
    assert.ok(Math.abs(Math.min(...ys) - 8.2 * k) < .05, `${halfW}: underside is 2.8 below the eave`);
    assert.ok(S(-1, 1)[2] < S(0, 1)[2] - halfW * .05 && S(1, 1)[2] < S(0, 1)[2] - halfW * .05, `${halfW}: both wings turn up`);
    assert.ok(S(0, 0)[2] < S(0, 1)[2] - rise * .9, `${halfW}: ridge above eave`);

    const bands = p.mesh.slice(1, tiles + 2);
    assert.equal(bands.length, tiles + 1);
    for (const b of bands) assert.equal(b.mat, mat === MAT.gold ? MAT.hyomonGold : MAT.gold);
    const nearest = (x, y, z) => {
      let best = Infinity, bu = 0, bt = 0, du = 1 / 20, dt = 1 / 20;
      for (let u = -1; u <= 1 + 1e-9; u += du) for (let t = 0; t <= 1 + 1e-9; t += dt) {
        const q = S(u, t), d = Math.hypot(q[0] - x, q[1] - y, q[2] - z);
        if (d < best) { best = d; bu = u; bt = t; }
      }
      for (let level = 0; level < 5; level++) {
        du /= 4; dt /= 4;
        const [cu, ct] = [bu, bt];
        for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
          const u = Math.max(-1, Math.min(1, cu + i * du)), t = Math.max(0, Math.min(1, ct + j * dt));
          const q = S(u, t), d = Math.hypot(q[0] - x, q[1] - y, q[2] - z);
          if (d < best) { best = d; bu = u; bt = t; }
        }
      }
      return best;
    };
    let low = 0, total = 0, reachEave = false;
    const eaveMid = S(-1 + 2 * 4 / tiles, 1);
    for (const b of bands) {
      const v = b.vertices;
      for (let i = 0; i < v.length; i += 8 * 5) {
        const d = nearest(v[i], v[i + 1], v[i + 2]);
        assert.ok(d >= .05 && d <= .31, `${halfW}: tile band vertex ${d.toFixed(3)} from the roof`);
        if (d <= .18) low++;
        total++;
      }
      for (let i = 0; i < v.length; i += 8) if (Math.hypot(v[i] - eaveMid[0], v[i + 2] - eaveMid[2]) < 1.2) reachEave = true;
    }
    assert.ok(low > total * .3 && low < total * .7, `${halfW}: band undersides sit .12 off the surface, tops .24`);
    assert.ok(reachEave, `${halfW}: the middle tile band runs all the way to the eave`);
  }
});

test('p2 openings are real holes: galleries, romon and sanmon show the ground; karamon leaves stay closed', () => {
  const open = corridor('c', -110, 110, 100, {height: 26});
  const pw = 3.2, bayX = (-110 + pw / 2 + (-110 + pw / 2 + (220 - pw) / 10)) / 2;
  assert.equal(open.length, 3);
  assert.ok(!covers(open, bayX, 87), 'open gallery bay is empty');
  assert.ok(covers(open, -110 + pw / 2, 87), 'gallery post is solid');
  assert.ok(covers(open, 0, 75 + 1.2), 'head beam is solid');
  assert.ok(covers(corridor('w', -110, 110, 100, {height: 26, open: false}), bayX, 87), 'closed gallery stays a wall');
  assert.equal(open[0].rigidGroup, undefined);
  assert.equal(corridor('r', -110, 110, 100, {rigidGroup: true})[0].rigidGroup, true);
  assert.equal(open[1].motionWith, 'c-body');

  const r = romon('r', 0, 40, 62);
  assert.deepEqual(r.map(p => p.id), ['r-lower', 'r-lower-lamp', 'r-upper', 'r-upper-lamp', 'r-balcony', 'r-roof', 'r-roof-lip']);
  assert.ok(!covers(r, 0, 27), 'romon middle bay is open');
  assert.ok(covers(r, 16.12, 27), 'romon post is solid');
  assert.equal(r[0].rigidGroup, true);

  const s = sanmon('s', 0, 40, 73);
  assert.ok(!covers(s, 0, 20), 'sanmon passage is open');
  assert.ok(covers(s, 73 * .65, 20), 'sanmon post is solid');

  const k = karamon('k', 0, 100, 66);
  assert.deepEqual(k.map(p => p.id), ['k-doors', 'k-frame', 'k-gable']);
  assert.ok(covers([k[0]], 17, 75), 'karamon leaves are closed');
  assert.equal(k[0].mesh.filter(c => c.mat === MAT.hyomonGold).length, 12, 'twelve flat studs');

  const building = /^(kondo|pagoda|romon|hondo|kinkaku|hojo|old-shoin|middle-shoin|new-shoin|ginkaku|togudo|shishinden|west-gallery|east-gallery|south-west|jomei-mon|south-east|back-wall|amidado|goeido|watari|ninomaru-\d|karamon|honden|sanmon)-/;
  for (const [ward, build] of Object.entries(PLATES)) {
    for (const p of build()) {
      if (!building.test(p.id) || !/-(wall|lamp|roof|lip|body|balcony|finial|posts|frame|doors|gable|lower|upper|base|eave|crown)(-\d+)?$/.test(p.id)) continue;
      assert.ok(Array.isArray(p.mesh) && p.mesh.length > 0, `${ward} ${p.id} is a mesh`);
      assert.equal(p.thick, 0, `${ward} ${p.id} thick is 0`);
    }
  }
});

test('p2 pagoda: five storeys that each move as one, nine separate rings, a long sorin inside the plate', () => {
  const parts = preparePlate(PLATES.W_MINAMI()).parts, top = 128 - 17 - 4 * 40 - 25;
  const walls = parts.filter(p => /^pagoda-wall-\d$/.test(p.id));
  assert.equal(walls.length, 5);
  assert.deepEqual(walls.map(p => p.order), [1, 2, 3, 4, 5]);
  for (let i = 0; i < 5; i++) {
    for (const id of [`pagoda-wall-${i}-lamp`, `pagoda-roof-${i}`, `pagoda-roof-${i}-lip`]) {
      assert.equal(parts.find(p => p.id === id).motionWith, `pagoda-wall-${i}`, `${id} moves with its storey`);
    }
  }
  const fin = parts.find(p => p.id === 'pagoda-finial');
  assert.equal(fin.motionWith, 'pagoda-wall-4');
  const rings = fin.fills.filter(f => f.d.length === 4 && Math.abs(f.d[2][1] - f.d[0][1] - 1.1) < 1e-6).map(f => f.d[0][1]).sort((a, b) => a - b);
  assert.equal(rings.length, 9);
  for (let i = 1; i < rings.length; i++) assert.ok(rings[i] - rings[i - 1] - 1.1 >= 4.8, 'rings keep a real gap');
  let zMin = Infinity;
  for (const c of fin.mesh) for (let i = 2; i < c.vertices.length; i += 8) zMin = Math.min(zMin, c.vertices[i]);
  assert.ok(Math.abs(zMin - (top - 90)) < .01, 'tip at top - 90');
  assert.ok(zMin > -PLATE.halfH, 'sorin stays on the plate');

  const life = createLife(parts), byId = id => parts.find(p => p.id === id), light = byId('pagoda-wall-0').centre;
  const seen = [];
  let clock = 0;
  for (const dt of [1 / 60, .15, .2, .35, .8, 1.5]) {
    const out = run(life, dt, {light}, clock);
    clock += dt * 1000;
    for (let i = 0; i < 5; i++) {
      const w = byId(`pagoda-wall-${i}`), r = byId(`pagoda-roof-${i}`);
      assert.ok(Number.isFinite(out.a[w.index * 4 + 1]));
      assert.equal(out.a[r.index * 4 + 1], out.a[w.index * 4 + 1], `storey ${i} roof stands with its wall`);
    }
    seen.push([0, 4].map(i => out.a[byId(`pagoda-wall-${i}`).index * 4 + 1]));
  }
  assert.ok(seen.some(([low, high]) => low > high + 1e-4), 'the lowest storey stands before the top one');
});
