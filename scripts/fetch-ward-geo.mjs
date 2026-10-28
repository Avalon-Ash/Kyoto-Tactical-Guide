/** One-off build tool; never invoke from the website, CI or a recurring job.
 * Policy: https://operations.osmfoundation.org/policies/nominatim/
 * Single process, >=1.1s between requests, identified UA, persistent response cache.
 * On failure stop without replacing the last complete artifact. Do not bypass blocks.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CACHE = path.join(ROOT, '.claude/ward-geo-cache');
const OUTPUT = path.join(ROOT, 'src/data/geo/ward-boundaries.ts');
const USER_AGENT = 'Kyoto-Tactical-Guide/1.0 (https://github.com/Avalon-Ash/Kyoto-Tactical-Guide; one-off ward boundary build)';
const THRESHOLD = 0.0005; // Do not re-fetch just to change simplification.
const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const onSegment = (a, b, p) => Math.abs(cross(a, b, p)) < 1e-12
  && p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0])
  && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
function intersects(a, b, c, d) {
  const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
  return (abC * abD < 0 && cdA * cdB < 0)
    || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}
function inside(point, ring) {
  let result = false;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1];
    if ((a[1] > point[1]) !== (b[1] > point[1])
      && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}
function ringsIntersect(a, b) {
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      if (intersects(a[i], a[i + 1], b[j], b[j + 1])) return true;
    }
  }
  return false;
}

/** Validate all vertices, rings and holes, without dropping or rounding geometry. */
export function validateGeometry(geometry, bbox) {
  if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) throw new Error('Expected Polygon/MultiPolygon');
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  if (!Array.isArray(polygons) || !polygons.length) throw new Error('Empty geometry');
  const points = [];
  for (const rings of polygons) {
    if (!Array.isArray(rings) || !rings.length) throw new Error('Empty polygon');
    for (const ring of rings) {
      if (!Array.isArray(ring) || ring.length < 4) throw new Error('Short ring');
      for (const p of ring) {
        // A broad Kyoto sanity envelope, not an authoritative municipal boundary.
        if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite)
          || p[0] < 135.5 || p[0] > 136 || p[1] < 34.8 || p[1] > 35.4) throw new Error('Invalid/out-of-range coordinate');
        points.push(p);
      }
      if (!equal(ring[0], ring.at(-1)) || new Set(ring.map(p => p.join(','))).size < 3) throw new Error('Unclosed/degenerate ring');
      let area = 0;
      for (let i = 0; i < ring.length - 1; i++) {
        if (equal(ring[i], ring[i + 1])) throw new Error('Duplicate adjacent vertex');
        area += cross(ring[0], ring[i], ring[i + 1]);
        for (let j = i + 2; j < ring.length - 1; j++) {
          if (i === 0 && j === ring.length - 2) continue;
          if (intersects(ring[i], ring[i + 1], ring[j], ring[j + 1])) throw new Error('Self-intersecting ring');
        }
      }
      if (Math.abs(area) < 1e-12) throw new Error('Zero-area ring');
    }
    for (let i = 1; i < rings.length; i++) {
      if (!inside(rings[i][0], rings[0]) || ringsIntersect(rings[i], rings[0])) throw new Error('Hole outside/touching shell');
      for (let j = 1; j < i; j++) {
        if (ringsIntersect(rings[i], rings[j]) || inside(rings[i][0], rings[j]) || inside(rings[j][0], rings[i])) throw new Error('Overlapping holes');
      }
    }
  }
  // Conservatively reject touching/overlapping components; require manual review.
  for (let i = 0; i < polygons.length; i++) for (let j = 0; j < i; j++) {
    if (ringsIntersect(polygons[i][0], polygons[j][0])
      || inside(polygons[i][0][0], polygons[j][0]) || inside(polygons[j][0][0], polygons[i][0])) throw new Error('Touching/overlapping polygon components');
  }
  const actual = [Math.min(...points.map(p => p[1])), Math.max(...points.map(p => p[1])), Math.min(...points.map(p => p[0])), Math.max(...points.map(p => p[0]))];
  if (!Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(Number.isFinite)
    || bbox[0] >= bbox[1] || bbox[2] >= bbox[3]
    || actual.some((v, i) => Math.abs(v - bbox[i]) > THRESHOLD * 2)) throw new Error('Bounding box mismatch');
  return { vertices: points.length, polygons: polygons.length, bbox: actual };
}

export function selectWard(data, name) {
  if (!Array.isArray(data)) throw new Error('Search response is not an array');
  const matches = data.filter(hit => hit.osm_type === 'relation' && hit.category === 'boundary'
    && hit.type === 'administrative' && hit.extratags?.admin_level === '8'
    && (hit.namedetails?.['name:ja'] ?? hit.name) === name
    && hit.address?.country_code === 'jp' && hit.address?.city === '京都市'
    && (hit.address?.province ?? hit.address?.state) === '京都府');
  if (matches.length !== 1) throw new Error(`${name}: expected exactly one verified ward, found ${matches.length}`);
  const hit = matches[0];
  if (!Number.isSafeInteger(hit.osm_id) || hit.osm_id <= 0) throw new Error(`${name}: invalid relation ID`);
  validateGeometry(hit.geojson, hit.boundingbox?.map(Number));
  return hit;
}

export async function main() {
  // Read the project's existing metadata via tsx, without duplicating the ward list.
  const { tsImport } = await import('tsx/esm/api');
  const { WARD_KEYS, WARD_NAMES } = await tsImport(pathToFileURL(path.join(ROOT, 'src/data/wards.ts')).href, import.meta.url);
  if (WARD_KEYS.length !== 11) throw new Error('Expected 11 wards; review the build contract');
  await fs.mkdir(CACHE, { recursive: true });
  const lock = await fs.open(path.join(CACHE, 'build.lock'), 'wx');
  try {
    const boundaries = {}, sources = {}, seen = new Set();
    let lastRequest = 0;
    for (const key of WARD_KEYS) {
      const name = WARD_NAMES[key].ja;
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.search = new URLSearchParams({ q: `${name}, 京都市, 京都府, 日本`, format: 'jsonv2', countrycodes: 'jp', 'accept-language': 'ja', addressdetails: '1', namedetails: '1', extratags: '1', polygon_geojson: '1', polygon_threshold: String(THRESHOLD), limit: '10' }).toString();
      const cacheFile = path.join(CACHE, `${key}.json`);
      let cached;
      try { cached = JSON.parse(await fs.readFile(cacheFile, 'utf8')); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (cached && cached.url !== url.href) throw new Error(`${key}: cached query differs; review manually, do not auto-refetch`);
      if (!cached) {
        if (process.argv.includes('--offline')) throw new Error(`${key}: response cache missing in offline mode`);
        await new Promise(resolve => setTimeout(resolve, Math.max(0, 1100 - (Date.now() - lastRequest))));
        lastRequest = Date.now();
        const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(25000) });
        if (!response.ok) throw new Error(`${key}: HTTP ${response.status}; stopped, no automatic retry`);
        cached = { url: url.href, fetchedAt: new Date().toISOString(), data: await response.json() };
        await fs.writeFile(cacheFile, JSON.stringify(cached, null, 2));
      }
      const hit = selectWard(cached.data, name);
      if (seen.has(hit.osm_id)) throw new Error(`${key}: duplicate relation`);
      seen.add(hit.osm_id);
      boundaries[key] = hit.geojson;
      sources[key] = { name, relation: hit.osm_id, fetchedAt: cached.fetchedAt, query: cached.url, displayName: hit.display_name, address: hit.address, adminLevel: hit.extratags.admin_level, ...validateGeometry(hit.geojson, hit.boundingbox.map(Number)) };
      console.log(`${key}: relation/${hit.osm_id} ${hit.display_name}`);
    }
    const body = `// AUTO-GENERATED by scripts/fetch-ward-geo.mjs. Do not hand-edit.\n// © OpenStreetMap contributors; ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/\n// Sources and transforms: ./ward-boundaries.sources.json and ./README.md\nimport type { Polygon, MultiPolygon } from 'geojson';\n\nexport type WardGeometry = Polygon | MultiPolygon;\nexport const WARD_BOUNDARIES: Record<string, WardGeometry> = ${JSON.stringify(boundaries)};\n`;
    if (Buffer.byteLength(body) > 150 * 1024) throw new Error('Artifact exceeds 150 KiB; simplify cached geometry offline and revalidate, do not re-query');
    await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
    await fs.writeFile(`${OUTPUT}.tmp`, body);
    await fs.writeFile(path.join(path.dirname(OUTPUT), 'ward-boundaries.sources.json'), JSON.stringify({ licence: 'ODbL-1.0', attribution: '© OpenStreetMap contributors', polygonThreshold: THRESHOLD, transform: 'Nominatim simplification only; no rounding or clipping', wards: sources }, null, 2) + '\n');
    await fs.rename(`${OUTPUT}.tmp`, OUTPUT);
    console.log(`Wrote ${(Buffer.byteLength(body) / 1024).toFixed(1)} KiB; 11 verified wards`);
  } finally {
    await lock.close();
    await fs.unlink(path.join(CACHE, 'build.lock'));
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
