import assert from 'node:assert/strict';
import test from 'node:test';
import type { WardGeometry } from '../data/geo/ward-boundaries';
import {
  VIEW_BBOX, VIEW_W, VIEW_H, project, geometryToPath, smoothLinePath,
  mulberry32, cloudBandPath, ridgePath,
} from './geo-svg';

test('projection places north above south and east right of west', () => {
  assert.deepEqual(project(VIEW_BBOX.maxLat, VIEW_BBOX.minLng), [0, 0]);
  assert.equal(VIEW_W, 885);
  assert.equal(VIEW_H, 1000);
  const center = project(35, 135.75);
  assert.ok(project(35.01, 135.75)[1] < center[1]);
  assert.ok(project(35, 135.76)[0] > center[0]);
  // The geographic projection retains tenths; viewBox dimensions round to integers.
  const bottomRight = project(VIEW_BBOX.minLat, VIEW_BBOX.maxLng);
  assert.ok(Math.abs(bottomRight[0] - VIEW_W) <= 0.5);
  assert.equal(bottomRight[1], VIEW_H);
  assert.ok(project(VIEW_BBOX.maxLat + 0.01, VIEW_BBOX.minLng)[1] < 0);
});

const outer = [[135.7, 35.0], [135.8, 35.0], [135.8, 35.1], [135.7, 35.0]];
const hole = [[135.73, 35.02], [135.75, 35.02], [135.75, 35.04], [135.73, 35.02]];
const island = [[135.61, 34.9], [135.63, 34.9], [135.63, 34.92], [135.61, 34.9]];

test('Polygon preserves every ring and converts GeoJSON longitude/latitude order', () => {
  const geometry: WardGeometry = { type: 'Polygon', coordinates: [outer, hole] };
  const path = geometryToPath(geometry);
  const subpaths = path.match(/M[^Z]+Z/g) ?? [];
  assert.equal(subpaths.length, 2);
  for (const [index, ring] of [outer, hole].entries()) {
    const coordinates = [...subpaths[index].matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)]
      .map(match => [Number(match[1]), Number(match[2])]);
    assert.deepEqual(coordinates, ring.map(([lng, lat]) => project(lat, lng)));
  }
});

test('MultiPolygon retains holes and separate polygons as closed subpaths', () => {
  assert.equal(
    geometryToPath({ type: 'MultiPolygon', coordinates: [[outer, hole], [island]] }),
    geometryToPath({ type: 'Polygon', coordinates: [outer, hole] })
      + geometryToPath({ type: 'Polygon', coordinates: [island] }),
  );
  assert.equal(geometryToPath({ type: 'Polygon', coordinates: [] }), '');
  assert.equal(geometryToPath({ type: 'Polygon', coordinates: [[]] }), '');
  assert.equal(geometryToPath({ type: 'MultiPolygon', coordinates: [] }), '');
});

test('smooth lines handle empty/single points and pass through every projected point', () => {
  assert.equal(smoothLinePath([]), '');
  assert.equal(smoothLinePath([[35, 135.7]]), '');
  const points: [number, number][] = [[35, 135.7], [35.02, 135.72], [35.01, 135.74]];
  const path = smoothLinePath(points);
  assert.ok(path.startsWith(`M${project(...points[0]).join(',')}`));
  const segments = [...path.matchAll(/C[^C]+/g)];
  assert.equal(segments.length, points.length - 1);
  segments.forEach((segment, index) => {
    assert.ok(segment[0].trimEnd().endsWith(` ${project(...points[index + 1]).join(',')}`));
  });
  assert.doesNotMatch(path, /NaN|Infinity|Z/);
  assert.equal((smoothLinePath(points.slice(0, 2)).match(/ C/g) ?? []).length, 1);
});

test('seeded random and procedural paths are repeatable and vary with seed', () => {
  const sample = (seed: number) => {
    const rand = mulberry32(seed);
    return Array.from({ length: 100 }, () => rand());
  };
  assert.deepEqual(sample(794), sample(794));
  assert.notDeepEqual(sample(794), sample(795));
  assert.ok(sample(794).every(value => value >= 0 && value < 1));
  const cloud = (seed: number) => cloudBandPath(-80, 600, 10, 34, mulberry32(seed));
  assert.equal(cloud(794), cloud(794));
  assert.notEqual(cloud(794), cloud(795));
  assert.ok(cloud(794).endsWith('Z'));
  assert.doesNotMatch(cloud(794), /NaN|Infinity/);
  for (const side of ['top', 'left', 'right'] as const) {
    const ridge = (seed: number) => ridgePath(side, 100, mulberry32(seed));
    assert.equal(ridge(794), ridge(794));
    assert.notEqual(ridge(794), ridge(795));
    assert.ok(ridge(794).endsWith(' Z'));
    assert.doesNotMatch(ridge(794), /NaN|Infinity/);
  }
});

test('procedural helpers reject invalid dimensions or steps before generating paths', () => {
  const rand = mulberry32(794);
  assert.equal(cloudBandPath(10, 10, 0, 20, rand), '');
  assert.equal(cloudBandPath(10, 0, 0, 20, rand), '');
  assert.throws(() => cloudBandPath(0, Infinity, 0, 20, rand), RangeError);
  assert.throws(() => cloudBandPath(0, 100, 0, -1, rand), RangeError);
  for (const steps of [0, -1, 1.5, Infinity, NaN]) {
    assert.throws(() => ridgePath('top', 100, rand, steps), RangeError);
  }
  assert.throws(() => ridgePath('top', -1, rand), RangeError);
  assert.throws(() => ridgePath('top', Infinity, rand), RangeError);
});
