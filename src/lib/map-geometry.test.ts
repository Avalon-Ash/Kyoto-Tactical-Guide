import test from 'node:test';
import assert from 'node:assert/strict';
import { createOutsideMask } from './map-geometry';
import type { Position } from 'geojson';

const square = (x: number, y: number, size: number) => [[x,y],[x+size,y],[x+size,y+size],[x,y+size],[x,y]];
const inside = (p: Position, ring: Position[]) => {
  let yes = false;
  for (let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i], b=ring[j];
    if ((a[1]>p[1]) !== (b[1]>p[1]) && p[0] < (b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) yes=!yes;
  }
  return yes;
};
test('mask preserves transparent ward interiors, masked holes and all components', () => {
  const geometry = {type:'MultiPolygon' as const,coordinates:[[square(135.6,35,0.1),square(135.62,35.02,0.02)],[square(135.8,35,0.1)]]};
  const before=JSON.stringify(geometry), mask=createOutsideMask(geometry)!;
  const masked = (p:Position) => mask.features.some(f=>f.geometry.coordinates.reduce((parity,ring)=>parity !== inside(p,ring),false));
  assert.equal(masked([135.61,35.01]),false);
  assert.equal(masked([135.63,35.03]),true);
  assert.equal(masked([135.85,35.05]),false);
  assert.equal(masked([135.75,35.05]),true);
  assert.equal(JSON.stringify(geometry),before);
});
test('area mode has no mask, simple Polygon creates one world complement', () => {
  assert.equal(createOutsideMask(null),null);
  const mask=createOutsideMask({type:'Polygon',coordinates:[square(135.7,35,0.1)]})!;
  assert.equal(mask.features.length,1);
  assert.equal(mask.features[0].geometry.coordinates.length,2);
});
