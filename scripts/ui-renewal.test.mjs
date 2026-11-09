// UI renewal regressions (docs/UI_RENEWAL_ARCHITECTURE.md §6). Written by the main agent; implementers must not edit.
import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutBands, cabinetKeepout, centreZone, bandSegments, particleSpecs, spanX, bandMargin, random, BACKDROP_PALETTE, MAX_BANDS} from '../src/studies/toji/backdrop.js';
import {ortho, lookAt, multiply, project, buildScene} from '../src/studies/toji/geometry.js';
import {LANDMARK_STUDIES} from '../src/studies/toji/landmarks.js';

// Same camera as study.js render(): fixed eye, orthographic, halfW = max(475, 340·aspect).
const camera = (width, height) => {
  const aspect = width / height, halfW = Math.max(475, 340 * aspect), halfH = halfW / aspect;
  return multiply(ortho(-halfW, halfW, -halfH, halfH, 1, 2200), lookAt([430, 720, 920], [0, 40, 0]));
};
const STAGES = [[375, 640], [390, 700], [320, 420], [768, 900], [1280, 760], [1440, 820], [1024, 280]];
const inside = (poly, [x, y]) => {
  const area = poly.reduce((s, [ax, ay], i) => { const [bx, by] = poly[(i + 1) % poly.length]; return s + ax * by - bx * ay; }, 0);
  return poly.every(([ax, ay], i) => {
    const [bx, by] = poly[(i + 1) % poly.length], length = Math.hypot(bx - ax, by - ay);
    if (length < 1e-9) return true;
    return Math.sign(area) * ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) / length > -.5;
  });
};

test('silhouette encloses every vertex of all eleven reliefs and the plain cabinet', () => {
  for (const [w, h] of [[375, 640], [1440, 820]]) {
    const m = camera(w, h), keep = cabinetKeepout(m, w, h);
    for (const ward of [...Object.keys(LANDMARK_STUDIES), false]) {
      const mesh = buildScene(ward);
      for (let i = 0; i < mesh.length; i += 8) {
        const [nx, ny] = project(m, [mesh[i], mesh[i + 1], mesh[i + 2]]);
        const point = [(nx + 1) / 2 * w, (1 - ny) / 2 * h];
        assert.ok(inside(keep, point) || keep.some(([x, y]) => Math.hypot(x - point[0], y - point[1]) < .5), `${ward} vertex ${i / 8} at ${w}x${h}`);
      }
    }
  }
});

test('mist never reaches the centre behind the cabinet, even at the far end of its drift', () => {
  for (const [w, h] of STAGES) {
    const keep = cabinetKeepout(camera(w, h), w, h), zone = centreZone(keep), margin = bandMargin(h);
    const bands = layoutBands(w, h, keep);
    assert.ok(bands.length <= MAX_BANDS, `${w}x${h}`);
    for (const band of bands) {
      const rows = band.y + band.h / 2 > zone.top - margin && band.y - band.h / 2 < zone.bottom + margin;
      const x0 = band.x0 - band.drift, x1 = band.x1 + band.drift;
      assert.ok(!rows || x1 <= zone.left - margin + 1e-6 || x0 >= zone.right + margin - 1e-6, `${w}x${h} band at y=${Math.round(band.y)} enters the centre`);
      assert.ok(band.side < 0 ? x1 - 2 * band.drift <= w && band.x0 + band.drift < 0 : band.x1 - band.drift > w, `${w}x${h} band stays cropped by its edge while drifting`);
      assert.ok(band.y - band.h / 2 >= 0 && band.y + band.h / 2 <= h, `${w}x${h} band stays vertically on canvas`);
      const body = spanX(keep, band.y - band.h / 2, band.y + band.h / 2);
      const visible = !body ? band.x1 - band.x0 : band.side < 0 ? Math.min(band.x1, body.min) : w - Math.max(band.x0, body.max);
      assert.ok(visible >= band.h * 2.5 - 1e-6, `${w}x${h} band shows beside the cabinet`);
    }
    for (let i = 0; i < bands.length; i++) for (let j = i + 1; j < bands.length; j++) {
      const a = bands[i], b = bands[j];
      const xOverlap = a.x1 + a.drift > b.x0 - b.drift && b.x1 + b.drift > a.x0 - a.drift, gap = Math.abs(a.y - b.y) - (a.h + b.h) / 2;
      assert.ok(!xOverlap || gap > 0, `${w}x${h} bands ${i} and ${j} touch`);
    }
  }
});

test('phone gets four or more bands and desktop five, from both edges', () => {
  for (const [w, h, min] of [[375, 698, 4], [390, 700, 4], [1280, 754, 5], [1440, 820, 5]]) {
    const bands = layoutBands(w, h, cabinetKeepout(camera(w, h), w, h));
    assert.ok(bands.length >= min, `${w}x${h}: ${bands.length}`);
    assert.ok(bands.some(b => b.side < 0) && bands.some(b => b.side > 0), `${w}x${h} uses both edges`);
  }
});

test('each band is stepped: two or three tiers, all inside its own box', () => {
  for (const [w, h] of STAGES) for (const band of layoutBands(w, h, cabinetKeepout(camera(w, h), w, h))) {
    const segments = bandSegments(band);
    assert.ok(segments.length >= 2 && segments.length <= 3, `${w}x${h} ${segments.length} tiers`);
    for (const seg of segments) {
      assert.ok(seg.x0 >= 0 && seg.x1 <= band.x1 - band.x0 + 1e-6 && seg.x1 - seg.x0 >= seg.h * 2);
      assert.ok(seg.cy - seg.h / 2 >= -1e-6 && seg.cy + seg.h / 2 <= band.h + 1e-6);
    }
    assert.ok(new Set(segments.map(s => Math.round(s.cy))).size >= 2, 'tiers sit at different heights');
  }
});

test('layout is deterministic per seed so cabinet switches never reshuffle the backdrop', () => {
  const keep = cabinetKeepout(camera(1280, 760), 1280, 760);
  assert.deepEqual(layoutBands(1280, 760, keep, 7), layoutBands(1280, 760, keep, 7));
  assert.notDeepEqual(layoutBands(1280, 760, keep, 7), layoutBands(1280, 760, keep, 8));
  const a = random(3), b = random(3);
  for (let i = 0; i < 50; i++) { const v = a(); assert.equal(v, b()); assert.ok(v >= 0 && v < 1); }
});

test('a stage filled edge to edge by the cabinet gets no mist', () => {
  assert.deepEqual(layoutBands(800, 300, [[-50, 0], [850, 0], [850, 300], [-50, 300]]), []);
});

test('mist stays behind the lacquer: capped strength, day gold, night silver and fainter', () => {
  const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const {day, night} = BACKDROP_PALETTE;
  assert.ok(day.alpha <= .65 && night.alpha <= .4);
  assert.ok(night.alpha < day.alpha, 'night mist is more transparent');
  const [dr, , db] = rgb(day.fill), [nr, , nb] = rgb(night.fill);
  assert.ok(dr - db > 60, 'day band is warm gold');
  assert.ok(Math.abs(nr - nb) < 20, 'night band is neutral silver');
});

test('motes: gold flakes tumble down by day, silver dust rises by moonlight, in bounded numbers', () => {
  for (const [w, h] of STAGES) for (const night of [false, true]) {
    const motes = particleSpecs(w, h, night);
    assert.ok(motes.length >= 16 && motes.length <= 32, `${w}x${h} ${motes.length}`);
    for (const m of motes) {
      assert.ok(night ? m.travel < 0 && m.spin === 0 : m.travel > 0 && Math.abs(m.spin) >= 180);
      assert.ok(m.x >= 0 && m.x <= w && m.duration >= 14000 && m.duration <= 28000 && m.delay <= 0 && -m.delay <= m.duration);
      assert.ok(m.peak > 0 && m.peak <= 1 && m.size > 0 && m.size <= 6);
    }
  }
  assert.deepEqual(particleSpecs(375, 698, true), particleSpecs(375, 698, true));
});
