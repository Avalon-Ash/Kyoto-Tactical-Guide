/** Read-only inventory supplement. REVIEW items need source checks; they are not proven errors.
 * Run: npx --no-install tsx scripts/audit-data.ts
 * Existing validate_data.js remains the structural gate; this script never changes data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WARD_KEYS } from '../src/data/wards';
import { AREA_KEYS } from '../src/data/areas';
import { AREA_CENTERS, SPOT_POSITIONS } from '../src/data/map-centers';
import { WARD_BOUNDARIES, type WardGeometry } from '../src/data/geo/ward-boundaries';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors: string[] = [];
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const validPosition = (value: unknown): value is { lat: number; lng: number } => record(value) &&
  typeof value.lat === 'number' && Number.isFinite(value.lat) && Math.abs(value.lat) <= 90 &&
  typeof value.lng === 'number' && Number.isFinite(value.lng) && Math.abs(value.lng) <= 180;
const normalize = (name: string) => name.normalize('NFKC').replace(/\([^)]*\)/g, '').replace(/[\s・･]/g, '').toLowerCase();

// Ray casting against the simplified OSM geometry: candidate screening only,
// never automatic reassignment of wards or authoritative border adjudication.
function inRing(x: number, y: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
function inWard(lng: number, lat: number, geometry: WardGeometry): boolean {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some(rings => inRing(lng, lat, rings[0]) && !rings.slice(1).some(ring => inRing(lng, lat, ring)));
}

const spots: { id: string; ward: string; name: string; tags: string[] }[] = [];
const counts: Record<string, number> = {};
const normalizedNames = new Map<string, string[]>();
const expectedFiles = WARD_KEYS.map(ward => `${ward.slice(2).toLowerCase()}.ts`).sort();
for (const dir of ['spots', 'locales/zh', 'locales/ja']) {
  const found = fs.readdirSync(path.join(root, 'src/data', dir)).filter(file => file.endsWith('.ts')).sort();
  if (JSON.stringify(found) !== JSON.stringify(expectedFiles)) errors.push(`${dir}: ward file set differs from WARD_KEYS`);
}
for (const file of expectedFiles) {
  const key = file.slice(0, -3).toUpperCase();
  const read = async (dir: string, exported: string): Promise<unknown> =>
    (await import(pathToFileURL(path.join(root, 'src/data', dir, file)).href))[exported];
  const schema = await read('spots', `${key}_SCHEMA`);
  const zh = await read('locales/zh', `${key}_ZH`), ja = await read('locales/ja', `${key}_JA`);
  if (!Array.isArray(schema) || !record(zh) || !record(ja)) throw new Error(`${file}: invalid module exports`);
  counts[`W_${key}`] = schema.length;
  for (const spot of schema) {
    if (!record(spot)) { errors.push(`${file}: non-object schema entry`); continue; }
    if (!['id', 'wardId', 'areaId', 'typeId'].every(field => nonempty(spot[field]))) {
      errors.push(`${file}: empty or invalid required schema field`); continue;
    }
    const id = String(spot.id);
    const tags = spot.tagIds;
    if (tags !== undefined && (!Array.isArray(tags) || !tags.every(nonempty))) errors.push(`${id}: invalid tagIds`);
    if ('reservationRequired' in spot && spot.reservationRequired !== true) errors.push(`${id}: reservationRequired must be true or absent`);
    for (const [lang, locale] of [['zh', zh], ['ja', ja]] as const) {
      const entry = locale[id];
      if (!record(entry)) { errors.push(`${id}: invalid ${lang} locale`); continue; }
      for (const field of ['name', 'desc', 'tags']) if (!nonempty(entry[field])) errors.push(`${id}: empty/invalid ${lang}.${field}`);
      if (Object.keys(entry).some(field => !['name', 'desc', 'tags'].includes(field))) errors.push(`${id}: extra ${lang} locale field`);
    }
    const entry = ja[id];
    if (!record(entry) || !nonempty(entry.name)) continue;
    const nameKey = normalize(entry.name);
    normalizedNames.set(nameKey, [...(normalizedNames.get(nameKey) ?? []), id]);
    spots.push({ id, ward: String(spot.wardId), name: entry.name, tags: Array.isArray(tags) && tags.every(nonempty) ? tags : [] });
  }
}
for (const [id, position] of [...Object.entries(AREA_CENTERS), ...Object.entries(SPOT_POSITIONS)]) {
  if (!validPosition(position)) errors.push(`${id}: non-finite/out-of-range coordinates`);
}
for (const key of Object.keys(AREA_CENTERS)) if (!AREA_KEYS.includes(key)) errors.push(`${key}: unknown area center`);
const coordinateCandidates = spots.flatMap(spot => {
  const position = SPOT_POSITIONS[spot.id], geometry = WARD_BOUNDARIES[spot.ward];
  if (!validPosition(position) || !geometry || inWard(position.lng, position.lat, geometry)) return [];
  return [{ id: spot.id, name: spot.name, assignedWard: spot.ward, position,
    containingWards: Object.entries(WARD_BOUNDARIES).filter(([, g]) => inWard(position.lng, position.lat, g)).map(([id]) => id) }];
});
console.log(JSON.stringify({
  counts, total: spots.length, coordinates: Object.keys(SPOT_POSITIONS).length, areaCenters: Object.keys(AREA_CENTERS).length,
  errors,
  review: {
    note: 'Candidates only. Shared entities/ACG entries may be intentional; simplified boundaries may affect border points. No facts auto-corrected.',
    normalizedNameGroups: [...normalizedNames.entries()].filter(([, ids]) => ids.length > 1).map(([name, ids]) => ({ name, ids })),
    coordinatesOutsideAssignedWard: coordinateCandidates,
    heritageTagged: spots.filter(spot => spot.tags.includes('國寶') || spot.tags.includes('世界遺產')).map(({ id, name, tags }) => ({ id, name, tags })),
  },
}, null, 2));
if (errors.length) process.exitCode = 1;
