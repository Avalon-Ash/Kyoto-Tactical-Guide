import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server, loader, buildUrl, getLocation, buildClusters, positions, centers;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  loader = await server.ssrLoadModule('/src/data/spots-loader.ts');
  ({ buildGoogleMapsUrl: buildUrl } = await server.ssrLoadModule('/src/components/SpotCard.tsx'));
  ({ getSpotLocation: getLocation } = await server.ssrLoadModule('/src/data/municipalities.ts'));
  ({ buildMapClusters: buildClusters } = await server.ssrLoadModule('/src/lib/map-clusters.ts'));
  ({ SPOT_POSITIONS: positions, AREA_CENTERS: centers } = await server.ssrLoadModule('/src/data/map-centers.ts'));
});
after(async () => { await server?.close(); });
const query = spot => new URL(buildUrl(spot)).searchParams.get('query');

test('Kyoto navigation keeps existing ward and standalone-name rules', () => {
  assert.equal(query({ jaName: '二条城', wardId: 'W_NAKAGYO' }), '二条城 中京区 京都');
  assert.equal(query({ jaName: '先斗町', wardId: 'W_NAKAGYO' }), '先斗町公園 京都');
  assert.equal(query({ jaName: '阪急 嵐山駅', wardId: 'W_NISHIKYO' }), '阪急 嵐山駅 京都');
});
test('both real locale loaders retain Otsu municipality and correct navigation', async () => {
  for (const lang of ['zh', 'ja']) {
    const spots = await loader.loadSpotsByWard('W_SAKYO', lang);
    const spot = spots.find(s => s.id === 'SK-038');
    assert.equal(spot.municipalityId, 'M_OTSU');
    assert.equal(spot.wardId, 'W_SAKYO'); // travel directory remains reachable
    assert.equal(spot.areaId, 'A16');
    assert.equal(query(spot), '比叡山 延暦寺 大津市 滋賀県');
    assert.equal(getLocation(spot).ward, undefined);
    assert.equal(getLocation(spot).city[lang], '大津市');
  }
});
test('unknown municipality fails explicitly instead of quietly navigating to Kyoto', () => {
  assert.throws(() => query({ jaName: 'test', wardId: 'W_SAKYO', municipalityId: 'M_UNKNOWN' }), /Unknown municipality/);
});
test('external municipality takes precedence even for a standalone query name', () => {
  assert.equal(query({ jaName: '嵐山', wardId: 'W_SAKYO', municipalityId: 'M_OTSU' }), '嵐山 大津市 滋賀県');
});
test('Otsu trip is a selectable exact-position cluster, not an A16 area-center member', async () => {
  const spots = (await loader.loadSpotsByWard('W_SAKYO', 'zh')).filter(s => s.areaId === 'A16');
  const clusters = buildClusters(spots, 'A16', id => id);
  const trip = clusters.find(c => c.key === 'spot:SK-038');
  assert.deepEqual(trip.pos, [positions['SK-038'].lat, positions['SK-038'].lng]);
  assert.notDeepEqual(trip.pos, [centers.A16.lat, centers.A16.lng]);
  assert.deepEqual(trip.spots.map(s => s.id), ['SK-038']);
  assert(clusters.find(c => c.key === 'A16').spots.every(s => s.id !== 'SK-038'));
  assert.equal(clusters.flatMap(c => c.spots).length, spots.length);
});
test('nearby trip cannot silently fall back to a made-up coordinate', () => {
  assert.throws(() => buildClusters([{ id: 'TEST-999', wardId: 'W_SAKYO', areaId: 'A16', municipalityId: 'M_OTSU', name: 'Test' }], 'A16', id => id), /verified coordinates/);
});
