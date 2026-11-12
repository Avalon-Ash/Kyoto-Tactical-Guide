import test from 'node:test';
import assert from 'node:assert/strict';
import {frameDiff, percentile, summarize, isBlank} from '../src/studies/toji/probe.js';

test('frameDiff computes mean and max channel difference across RGB channels', () => {
  const a = new Uint8ClampedArray([10, 20, 30, 255]);
  const b = new Uint8ClampedArray([13, 22, 29, 255]);
  // RGB diffs: |10-13|=3, |20-22|=2, |30-29|=1. Mean=(3+2+1)/3=2, Max=3.
  assert.deepEqual(frameDiff(a, b), {mean: 2, max: 3});
});

test('frameDiff ignores alpha channel difference completely', () => {
  const a = new Uint8ClampedArray([100, 150, 200, 0]);
  const b = new Uint8ClampedArray([100, 150, 200, 255]);
  assert.deepEqual(frameDiff(a, b), {mean: 0, max: 0});

  const c = new Uint8ClampedArray([10, 20, 30, 0, 40, 50, 60, 128]);
  const d = new Uint8ClampedArray([20, 20, 30, 255, 40, 60, 60, 0]);
  // Pixel 1: dr=10, dg=0, db=0. Pixel 2: dr=0, dg=10, db=0.
  // 6 channels total, diff sum=20, mean=20/6, max=10.
  const res = frameDiff(c, d);
  assert.ok(Math.abs(res.mean - 20 / 6) < 1e-9);
  assert.equal(res.max, 10);
});

test('frameDiff handles empty arrays', () => {
  const empty1 = new Uint8ClampedArray(0);
  const empty2 = new Uint8ClampedArray(0);
  assert.deepEqual(frameDiff(empty1, empty2), {mean: 0, max: 0});
});

test('frameDiff throws RangeError on length mismatch', () => {
  const a = new Uint8ClampedArray(4);
  const b = new Uint8ClampedArray(8);
  assert.throws(() => frameDiff(a, b), RangeError);

  const empty = new Uint8ClampedArray(0);
  assert.throws(() => frameDiff(a, empty), RangeError);
});

test('percentile returns NaN for empty array', () => {
  assert.ok(Number.isNaN(percentile([], 0)));
  assert.ok(Number.isNaN(percentile([], 50)));
  assert.ok(Number.isNaN(percentile([], 100)));
});

test('percentile does not mutate the input array', () => {
  const original = [42, 17, 88, 5, 23];
  const copy = [...original];
  percentile(original, 50);
  assert.deepEqual(original, copy);
});

test('percentile computes exact linear interpolation on known values', () => {
  const data = [10, 20, 30, 40, 50];
  // n = 5
  // p=0 -> index 0 -> 10
  assert.equal(percentile(data, 0), 10);

  // p=25 -> index 0.25 * 4 = 1 -> 20
  assert.equal(percentile(data, 25), 20);

  // p=50 -> index 0.5 * 4 = 2 -> 30 (median)
  assert.equal(percentile(data, 50), 30);

  // p=75 -> index 0.75 * 4 = 3 -> 40
  assert.equal(percentile(data, 75), 40);

  // p=100 -> index 4 -> 50
  assert.equal(percentile(data, 100), 50);

  // p=40 -> index 0.4 * 4 = 1.6 -> 20 + 0.6 * (30 - 20) = 26
  assert.equal(percentile(data, 40), 26);

  // p=95 -> index 0.95 * 4 = 3.8 -> 40 + 0.8 * (50 - 40) = 48
  assert.equal(percentile(data, 95), 48);
});

test('percentile handles single element array', () => {
  assert.equal(percentile([77], 0), 77);
  assert.equal(percentile([77], 50), 77);
  assert.equal(percentile([77], 100), 77);
});

test('summarize computes stats from diffs and frameTimes', () => {
  const diffs = [
    {mean: 1.0, max: 4.0},
    {mean: 3.0, max: 8.0},
    {mean: 2.0, max: 6.0},
  ];
  const frameTimes = [16.0, 16.5, 17.0, 16.2, 16.8];
  const res = summarize({diffs, frameTimes});

  assert.equal(res.frames, 3);
  assert.equal(res.meanDiff, 2.0);
  assert.equal(res.maxDiff, 8.0);
  // Per-frame means sorted: [1, 2, 3]; p99 index 0.99 * 2 = 1.98 -> 2 + 0.98 = 2.98
  assert.ok(Math.abs(res.p99Diff - 2.98) < 1e-9);
  assert.equal(res.medianMs, 16.5);
  // Sorted frameTimes: [16.0, 16.2, 16.5, 16.8, 17.0]
  // p95 index: 0.95 * 4 = 3.8 -> 16.8 + 0.8 * (17.0 - 16.8) = 16.96
  assert.ok(Math.abs(res.p95Ms - 16.96) < 1e-9);
});

test('summarize handles empty inputs safely', () => {
  const res = summarize({diffs: [], frameTimes: []});
  assert.equal(res.frames, 0);
  assert.equal(res.meanDiff, 0);
  assert.equal(res.maxDiff, 0);
  assert.ok(Number.isNaN(res.medianMs));
  assert.ok(Number.isNaN(res.p95Ms));

  const def = summarize();
  assert.equal(def.frames, 0);
  assert.equal(def.meanDiff, 0);
  assert.equal(def.maxDiff, 0);
  assert.ok(Number.isNaN(def.medianMs));
  assert.ok(Number.isNaN(def.p95Ms));
});

test('isBlank is true only for a frame with no coverage at all', () => {
  assert.equal(isBlank(new Uint8ClampedArray(8)), true);
  assert.equal(isBlank(new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 1])), false);
  assert.equal(isBlank(new Uint8ClampedArray([9, 9, 9, 0])), true);
});
