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

test('opaque landmark ownership overrides the ward behind a roof, transparent texels fall through',()=>{
  const size=100, ids=new Uint8Array(size*size);
  // The Toji study roof crosses the southern edge of Shimogyo in the cartogram.
  const [x,y]=[.47,.63];
  assert.equal(scene.pickMakieWard(x,y),'W_SHIMOGYO');
  ids[63*size+47]=wards.indexOf('W_MINAMI')+1;
  assert.equal(scene.pickLandmarkOwner(ids,size,x,y),'W_MINAMI');
  assert.equal(scene.pickLandmarkOwner(ids,size,.46,y),null);
  assert.equal(scene.pickLandmarkOwner(ids,size,.46,y) ?? scene.pickMakieWard(.46,y),'W_SHIMOGYO');
});
test('landmark ownership cannot wrap rows or accept invalid/outside coordinates',()=>{
  const ids=new Uint8Array([1,2,3,4]);
  for(const [x,y] of [[1,0],[0,1],[-.01,0],[0,-.01],[NaN,.5],[.5,Infinity]]) {
    assert.equal(scene.pickLandmarkOwner(ids,2,x,y),null);
  }
  assert.equal(scene.pickLandmarkOwner(ids,2,0,0),wards[0]);
  assert.equal(scene.pickLandmarkOwner(ids,2,.999,.999),wards[3]);
});
