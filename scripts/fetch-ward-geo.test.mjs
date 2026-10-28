import test from 'node:test';
import assert from 'node:assert/strict';
import { selectWard, validateGeometry, publishArtifacts } from './fetch-ward-geo.mjs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const shell = [[135.7,35], [135.8,35], [135.8,35.1], [135.7,35.1], [135.7,35]];
const bbox = [35,35.1,135.7,135.8];
const geometry = { type: 'Polygon', coordinates: [shell] };
const ward = {
  osm_type: 'relation', osm_id: 123, category: 'boundary', type: 'administrative',
  name: '北区', namedetails: { 'name:ja': '北区' }, extratags: { admin_level: '8' },
  address: { country_code: 'jp', city: '京都市', province: '京都府' },
  geojson: geometry, boundingbox: bbox.map(String),
};
test('reject a same-named ward in another city, ambiguous matches, and missing admin level', () => {
  assert.equal(selectWard([ward], '北区').osm_id, 123);
  assert.throws(() => selectWard([{ ...ward, address: { ...ward.address, city: '大阪市' } }], '北区'));
  assert.throws(() => selectWard([ward, ward], '北区'));
  assert.throws(() => selectWard([{ ...ward, extratags: {} }], '北区'));
  assert.throws(() => selectWard([{ ...ward, category: 'place' }], '北区'));
});
test('reject corrupt geometry and mismatching bounds', () => {
  assert.equal(validateGeometry(geometry, bbox).vertices, 5);
  assert.throws(() => validateGeometry({ type: 'Point', coordinates: shell[0] }, bbox));
  assert.throws(() => validateGeometry({ type: 'Polygon', coordinates: [shell.slice(0,-1)] }, bbox));
  assert.throws(() => validateGeometry({ type: 'Polygon', coordinates: [shell.map(([x,y]) => [y,x])] }, bbox));
  assert.throws(() => validateGeometry(geometry, [35,35.2,135.7,135.8]));
  assert.throws(() => validateGeometry({ type: 'Polygon', coordinates: [[shell[0],shell[2],shell[1],shell[3],shell[0]]] }, bbox));
});
test('preserve holes and multipolygons; reject a hole outside its shell', () => {
  const hole = [[135.72,35.02],[135.74,35.02],[135.74,35.04],[135.72,35.04],[135.72,35.02]];
  const withHole = { type: 'Polygon', coordinates: [shell,hole] };
  const before = JSON.stringify(withHole);
  assert.equal(validateGeometry(withHole, bbox).vertices, 10);
  assert.equal(JSON.stringify(withHole), before);
  assert.throws(() => validateGeometry({ type: 'Polygon', coordinates: [shell,hole.map(([x,y])=>[x+0.2,y])] }, bbox));
  const second = shell.map(([x,y]) => [x+0.15,y]);
  assert.equal(validateGeometry({type:'MultiPolygon',coordinates:[[shell],[second]]},[35,35.1,135.7,135.95]).polygons,2);
});

for (const failAt of ['stage', 'publish', 'none']) {
  test(`paired publication preserves original bytes on ${failAt} failure`, async t => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kyoto-geo-test-'));
    // The fixture only writes flat files; no recursive filesystem removal.
    t.after(async () => {
      for (const name of await fs.readdir(dir)) await fs.unlink(path.join(dir, name));
      await fs.rmdir(dir);
    });
    const files = [path.join(dir,'geometry.ts'), path.join(dir,'sources.json')];
    for (const file of files) await fs.writeFile(file, 'old:' + file);
    const io = {
      ...fs,
      writeFile: async (file, body) => {
        if (failAt === 'stage' && file === files[1] + '.tmp') throw Object.assign(new Error('simulated write failure'), { code:'ENOSPC' });
        return fs.writeFile(file,body);
      },
      rename: async (from,to) => {
        if (failAt === 'publish' && from === files[1] + '.tmp') throw Object.assign(new Error('simulated rename failure'), { code:'EPERM' });
        return fs.rename(from,to);
      },
    };
    const run = publishArtifacts(files.map(file=>({file,body:'new:'+file})),io);
    if (failAt === 'none') await run;
    else await assert.rejects(run);
    for (const file of files) assert.equal(await fs.readFile(file,'utf8'), (failAt === 'none' ? 'new:' : 'old:') + file);
    assert.deepEqual((await fs.readdir(dir)).sort(),['geometry.ts','sources.json']);
  });
}
