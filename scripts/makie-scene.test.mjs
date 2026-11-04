import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';
let server, scene, wards;
before(async()=>{
  server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  scene=await server.ssrLoadModule('/src/lib/makie-scene.ts');
  ({WARD_KEYS:wards}=await server.ssrLoadModule('/src/data/wards.ts'));
});
after(async()=>{await server?.close();});
test('all eleven real landmark anchors pick their own ward after cartogram projection',()=>{
  assert.deepEqual(new Set(scene.MAKIE_LANDMARKS.map(l=>l.wardId)),new Set(wards));
  for(const l of scene.MAKIE_LANDMARKS) {
    const [x,y]=scene.landmarkPosition(l);
    assert(x>0 && x<1 && y>0 && y<1);
    assert.equal(scene.pickMakieWard(x,y),l.wardId,l.spotId);
  }
});
test('picking outside the artwork cannot navigate to a ward',()=>{
  for(const [x,y] of [[-1,.5],[1.1,.5],[.5,-.1],[.5,1.1],[NaN,.5],[.5,Infinity]]) assert.equal(scene.pickMakieWard(x,y),null);
});
test('polygon holes and separate islands are excluded/included correctly',()=>{
  const outer=[[0,0],[10,0],[10,10],[0,10],[0,0]],hole=[[3,3],[7,3],[7,7],[3,7],[3,3]];
  const geom={type:'MultiPolygon',coordinates:[[outer,hole],[[[20,20],[22,20],[22,22],[20,22],[20,20]]]]};
  assert(scene.geometryContains(geom,2,2));
  assert(!scene.geometryContains(geom,5,5));
  assert(scene.geometryContains(geom,21,21));
  assert(!scene.geometryContains(geom,15,15));
});
