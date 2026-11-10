import test from 'node:test';
import assert from 'node:assert/strict';
import {MOTIFS,WARD_ART,wardSeed} from '../src/studies/toji/ward-art.js';
import {layoutBands,cabinetKeepout,centreZone} from '../src/studies/toji/backdrop.js';
import {lookAt,multiply,ortho} from '../src/studies/toji/geometry.js';
import {viewBox} from '../src/studies/toji/view.js';

const WARDS=['W_KITA','W_KAMIGYO','W_SAKYO','W_NAKAGYO','W_HIGASHIYAMA','W_SHIMOGYO','W_MINAMI','W_UKYO','W_NISHIKYO','W_YAMASHINA','W_FUSHIMI'];

test('every ward has its own pattern and a short verse in both languages',()=>{
  assert.deepEqual(Object.keys(WARD_ART).sort(),[...WARDS].sort());
  assert.equal(new Set(WARDS.map(id=>WARD_ART[id].motif)).size,11,'no two wards share a pattern');
  for(const id of WARDS){
    const {motif,verse}=WARD_ART[id];
    assert.equal(typeof MOTIFS[motif],'function',`${id}: ${motif}`);
    for(const lang of ['zh','ja']){
      assert.ok(verse[lang].length>=6&&verse[lang].length<=14,`${id} ${lang}: one line that fits down a phone's edge`);
      assert.ok(!/[A-Za-z0-9]/.test(verse[lang]),`${id} ${lang}: upright Latin text does not sit in a vertical line`);
    }
  }
});

test('pattern tiles are finite, non-empty and stay near their own period',()=>{
  for(const [name,make] of Object.entries(MOTIFS)){
    const tile=make();
    assert.ok(tile.w>0&&tile.h>0&&tile.cell>0,name);
    const points=[...(tile.lines??[]).flat(),...(tile.fills??[]).flat(),...(tile.circles??[]).map(([x,y])=>[x,y])];
    assert.ok(points.length>0,`${name} draws something`);
    for(const [x,y] of points){
      assert.ok(Number.isFinite(x)&&Number.isFinite(y),name);
      assert.ok(x>=-3*tile.w&&x<=4*tile.w&&y>=-3*tile.h&&y<=4*tile.h,`${name}: geometry belongs to the tile`);
    }
    assert.ok(points.some(([x,y])=>x>=0&&x<=tile.w&&y>=0&&y<=tile.h),`${name}: something lands inside the tile`);
  }
});

test('each ward lays its mist differently, and every layout still keeps the cabinet clear',()=>{
  assert.equal(new Set(WARDS.map(wardSeed)).size,11);
  assert.equal(wardSeed('W_KITA'),wardSeed('W_KITA'));
  const VIEW=lookAt([430,720,920],[0,40,0]);
  for(const [width,height] of [[375,698],[1440,760]]){
    const v=viewBox(width/height),keep=cabinetKeepout(multiply(ortho(v.left,v.right,v.bottom,v.top,1,2200),VIEW),width,height),zone=centreZone(keep);
    const layouts=new Set();
    for(const id of WARDS){
      const bands=layoutBands(width,height,keep,wardSeed(id));
      assert.ok(bands.length>=2,`${id} ${width}px keeps some mist`);
      layouts.add(JSON.stringify(bands.map(b=>[Math.round(b.x0),Math.round(b.y)])));
      for(const b of bands){
        const overlapsRows=b.y+b.h/2>zone.top&&b.y-b.h/2<zone.bottom;
        if(overlapsRows)assert.ok(b.x1+b.drift<=zone.left||b.x0-b.drift>=zone.right,`${id}: mist never crosses the middle of the cabinet`);
      }
    }
    assert.ok(layouts.size>=9,'the wards do not share one composition');
  }
});
