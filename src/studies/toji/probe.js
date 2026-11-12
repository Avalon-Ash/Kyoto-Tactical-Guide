/**
 * P0-A1: Flicker and frame time probe for Toji makie plate.
 */

/**
 * Computes mean and max absolute differences for RGB channels between two RGBA buffers.
 * Alpha channel is ignored. Throws RangeError if buffer lengths differ.
 *
 * @param {Uint8ClampedArray | ArrayLike<number>} a
 * @param {Uint8ClampedArray | ArrayLike<number>} b
 * @returns {{mean: number, max: number}}
 */
export function frameDiff(a, b) {
  if (a.length !== b.length) {
    throw new RangeError(`Length mismatch: ${a.length} !== ${b.length}`);
  }
  if (a.length === 0) {
    return {mean: 0, max: 0};
  }
  let total = 0;
  let max = 0;
  let count = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 3 && i + c < a.length; c++) {
      const diff = Math.abs(a[i + c] - b[i + c]);
      total += diff;
      if (diff > max) max = diff;
      count++;
    }
  }
  return {
    mean: count > 0 ? total / count : 0,
    max,
  };
}

/**
 * True when a sampled frame holds nothing at all. A WebGL canvas that was not drawn in this frame reads back
 * empty; such a sample says nothing about flicker and must not be compared.
 *
 * @param {Uint8ClampedArray | ArrayLike<number>} data RGBA
 * @returns {boolean}
 */
export function isBlank(data) {
  for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) return false;
  return true;
}

/**
 * Linear interpolation percentile. Empty array returns NaN.
 * Input array is not mutated.
 *
 * @param {ArrayLike<number>} values
 * @param {number} p Percentile in [0, 100]
 * @returns {number}
 */
export function percentile(values, p) {
  if (!values || values.length === 0) {
    return NaN;
  }
  const sorted = Array.from(values).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 1) {
    return sorted[0];
  }
  const clamped = Math.max(0, Math.min(1, p / 100));
  const idx = clamped * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) {
    return sorted[lo];
  }
  const f = idx - lo;
  return sorted[lo] + f * (sorted[hi] - sorted[lo]);
}

/**
 * @typedef {{frames: number, meanDiff: number, maxDiff: number, p99Diff: number, medianMs: number, p95Ms: number, blank?: number}} ProbeResult
 * meanDiff: mean over frames of each frame's mean channel difference; p99Diff: 99th percentile of those per-frame means;
 * maxDiff: the largest single-channel difference seen anywhere; blank: samples skipped because the canvas was not drawn.
 */

/**
 * Summarizes diffs and frame times.
 *
 * @param {{diffs?: Array<{mean: number, max: number} | number>, frameTimes?: number[]}} [data]
 * @returns {ProbeResult}
 */
export function summarize({diffs = [], frameTimes = []} = {}) {
  const frames = diffs.length || frameTimes.length;
  let totalMean = 0;
  let maxDiff = 0;
  for (const d of diffs) {
    const meanVal = typeof d === 'number' ? d : d.mean;
    const maxVal = typeof d === 'number' ? d : d.max;
    totalMean += meanVal;
    if (maxVal > maxDiff) maxDiff = maxVal;
  }
  const meanDiff = diffs.length > 0 ? totalMean / diffs.length : 0;
  const medianMs = percentile(frameTimes, 50);
  const p95Ms = percentile(frameTimes, 95);
  const p99Diff = diffs.length > 0 ? percentile(diffs.map(d => typeof d === 'number' ? d : d.mean), 99) : 0;
  return {
    frames,
    meanDiff,
    maxDiff,
    p99Diff,
    medianMs,
    p95Ms,
  };
}

/**
 * @typedef {{frames?: number, warmup?: number, zoomSteps?: number, zoom?: number, radius?: number, sample?: number, cx?: number, cy?: number}} ProbeOptions
 */

/**
 * Runs flicker probe in browser environment.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {ProbeOptions} [options]
 * @returns {Promise<ProbeResult>}
 */
export function runFlickerProbe(canvas, options = {}) {
  const search = typeof window !== 'undefined' && window.location ? window.location.search : '';
  const params = new URLSearchParams(search);

  /**
   * @param {string} paramKey
   * @param {keyof ProbeOptions} optKey
   * @param {number} fallback
   * @returns {number}
   */
  const getNum = (paramKey, optKey, fallback) => {
    if (params.has(paramKey)) {
      const v = Number(params.get(paramKey));
      if (!Number.isNaN(v)) return v;
    }
    const optVal = options[optKey];
    if (typeof optVal === 'number' && !Number.isNaN(optVal)) {
      return optVal;
    }
    return fallback;
  };

  const frames = getNum('frames', 'frames', 240);
  const warmup = getNum('warmup', 'warmup', 60);
  const zoomSteps = getNum('zoom', 'zoomSteps', options.zoom ?? 8);
  const radius = getNum('radius', 'radius', 6);
  const sample = getNum('sample', 'sample', 256);
  const cx = getNum('cx', 'cx', 0.5);
  const cy = getNum('cy', 'cy', 0.5);

  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i < zoomSteps; i++) {
        canvas.dispatchEvent(new KeyboardEvent('keydown', {key: '+', bubbles: true}));
      }

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width * cx;
      const centerY = rect.top + rect.height * cy;

      canvas.dispatchEvent(new PointerEvent('pointerenter', {
        pointerType: 'mouse',
        clientX: centerX,
        clientY: centerY,
        bubbles: true,
      }));
      canvas.dispatchEvent(new PointerEvent('pointermove', {
        pointerType: 'mouse',
        clientX: centerX,
        clientY: centerY,
        bubbles: true,
      }));

      const offscreen = document.createElement('canvas');
      const sampleW = sample;
      const aspect = canvas.clientHeight > 0 && canvas.clientWidth > 0
        ? canvas.clientHeight / canvas.clientWidth
        : (canvas.height > 0 && canvas.width > 0 ? canvas.height / canvas.width : 1);
      const sampleH = Math.max(1, Math.round(sample * aspect));
      offscreen.width = sampleW;
      offscreen.height = sampleH;
      const ctx = offscreen.getContext('2d', {willReadFrequently: true});
      if (!ctx) {
        throw new Error('Failed to create offscreen 2d context');
      }

      const sampleCurrent = () => {
        ctx.clearRect(0, 0, sampleW, sampleH);
        ctx.drawImage(canvas, 0, 0, sampleW, sampleH);
        return ctx.getImageData(0, 0, sampleW, sampleH).data;
      };

      /** @type {Array<{mean: number, max: number}>} */
      const diffs = [];
      /** @type {number[]} */
      const frameTimes = [];
      let warmupLeft = warmup;
      let step = 0;
      let blank = 0;
      let lastTime = 0;
      /** @type {Uint8ClampedArray | null} */
      let prevImgData = null;

      if (warmupLeft <= 0) {
        prevImgData = sampleCurrent();
        const angle0 = 0;
        const x0 = centerX + radius * Math.cos(angle0);
        const y0 = centerY + radius * Math.sin(angle0);
        canvas.dispatchEvent(new PointerEvent('pointermove', {
          pointerType: 'mouse',
          clientX: x0,
          clientY: y0,
          bubbles: true,
        }));
      }

      /** @param {DOMHighResTimeStamp} time */
      const loop = time => {
        try {
          if (warmupLeft > 0) {
            warmupLeft--;
            if (warmupLeft === 0) {
              prevImgData = sampleCurrent();
              lastTime = time;
              const angle0 = 0;
              const x0 = centerX + radius * Math.cos(angle0);
              const y0 = centerY + radius * Math.sin(angle0);
              canvas.dispatchEvent(new PointerEvent('pointermove', {
                pointerType: 'mouse',
                clientX: x0,
                clientY: y0,
                bubbles: true,
              }));
            }
            requestAnimationFrame(loop);
            return;
          }

          if (frames <= 0) {
            resolve(summarize({diffs: [], frameTimes: []}));
            return;
          }

          if (lastTime > 0) {
            frameTimes.push(time - lastTime);
          }
          lastTime = time;

          const currentImgData = sampleCurrent();
          if (isBlank(currentImgData)) blank++;
          else {
            if (prevImgData && !isBlank(prevImgData)) diffs.push(frameDiff(prevImgData, currentImgData));
            prevImgData = currentImgData;
          }
          step++;

          if (step < frames) {
            const angle = (step / frames) * Math.PI * 2;
            const nextX = centerX + radius * Math.cos(angle);
            const nextY = centerY + radius * Math.sin(angle);
            canvas.dispatchEvent(new PointerEvent('pointermove', {
              pointerType: 'mouse',
              clientX: nextX,
              clientY: nextY,
              bubbles: true,
            }));
            requestAnimationFrame(loop);
          } else {
            resolve({...summarize({diffs, frameTimes}), blank});
          }
        } catch (err) {
          reject(err);
        }
      };

      requestAnimationFrame(loop);
    } catch (err) {
      reject(err);
    }
  });
}
