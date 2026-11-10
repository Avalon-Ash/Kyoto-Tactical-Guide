import test, {before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {isTap,onLid,progressToward,OPEN_DURATION,swipeDirection,cabinetDragDirection,cabinetOffset,switchDistance,DRAG_DEAD,DRAG_FOLLOW,SWITCH_MAX,idlePlaybackAllowed,IDLE_RESUME_DELAY} from '../src/studies/toji/interaction.js';
let server,library,loader,buildUrl,collection;
before(async()=>{
  server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  library=await server.ssrLoadModule('/src/studies/toji/library.ts');
  collection=await server.ssrLoadModule('/src/studies/toji/collection.ts');
  loader=await server.ssrLoadModule('/src/data/spots-loader.ts');
  ({buildGoogleMapsUrl:buildUrl}=await server.ssrLoadModule('/src/components/SpotCard.tsx'));
});
after(async()=>{await server?.close();});
test('Minami volume reads both real locales and retains shared navigation',async()=>{
  for(const lang of ['zh','ja']){
    const spots=await loader.loadSpotsByWard('W_MINAMI',lang);
    assert.equal(spots.length,loader.computeWardStats().W_MINAMI);
    assert.ok(spots.every(s=>s.wardId==='W_MINAMI'));
    const match=library.filterVolume(spots,'東寺','T_TEMPLE');
    assert.ok(match.some(s=>s.id==='MN-001'));
    assert.ok(match.every(s=>s.typeId==='T_TEMPLE'));
    const toji=match.find(s=>s.id==='MN-001');
    assert.equal(new URL(buildUrl(toji)).searchParams.get('query'),'東寺 南区 京都');
    assert.equal(library.filterVolume(spots,'存在しない場所０１２３４５','').length,0);
  }
});
test('search normalizes width/case, ANDs tokens and never mutates source',()=>{
  const source=[{name:'ＡＢＣ 茶屋',desc:'抹茶',tags:'庭園',typeId:'T_SHOP',id:'x'}];
  assert.equal(library.filterVolume(source,'abc 抹茶','T_SHOP').length,1);
  assert.equal(library.filterVolume(source,'abc 京都','').length,0);
  assert.equal(source[0].name,'ＡＢＣ 茶屋');
});
test('late locale success or failure cannot replace the current request',()=>{
  const gate=library.createRequestGate(),zh=gate.next(),ja=gate.next();
  assert.equal(gate.current(zh),false);assert.equal(gate.current(ja),true);
  gate.next();assert.equal(gate.current(ja),false); // closing cancels the pending result
});
test('drag, long press, cancelled pointer and out-and-back motion never open the lid',()=>{
  const start={id:1,x:100,y:100,time:1000};
  assert.equal(isTap(start,{id:1,x:104,y:104,time:1100}),true);
  assert.equal(isTap(start,{id:1,x:120,y:100,time:1100}),false);
  assert.equal(isTap(start,{id:2,x:100,y:100,time:1100}),false);
  assert.equal(isTap(start,{id:1,x:100,y:100,time:1800}),false);
  assert.equal(isTap({...start,moved:true},{id:1,x:100,y:100,time:1100}),false);
  assert.equal(isTap(null,{id:1,x:100,y:100,time:1100}),false);
  assert.equal(onLid(0,0),true);assert.equal(onLid(371,0),false);assert.equal(onLid(NaN,0),false);
});
test('open/close progress clamps, reverses cleanly and becomes immediate with reduced motion',()=>{
  assert.equal(progressToward(0,1,OPEN_DURATION,false),1);
  assert.equal(progressToward(1,0,OPEN_DURATION*3,false),0);
  assert.equal(progressToward(.5,0,OPEN_DURATION/4,false),.25);
  assert.equal(progressToward(.2,1,0,true),1);
  assert.equal(progressToward(.8,0,0,true),0);
});

test('eleven cabinets cover both locales without cross-ward records and wrap in both directions',async()=>{
  const {CABINETS,adjacentCabinet,cabinetFor,volumeTitle}=collection;
  assert.equal(CABINETS.length,11);assert.equal(new Set(CABINETS.map(c=>c.id)).size,11);
  let total=0;
  for(const cabinet of CABINETS){
    total+=cabinet.count;
    for(const lang of ['zh','ja']){
      const spots=await loader.loadSpotsByWard(cabinet.id,lang);
      assert.equal(spots.length,cabinet.count);
      assert.ok(spots.every(s=>s.wardId===cabinet.id));
      assert.ok(spots.some(s=>s.id===cabinet.landmark.spotId));
      assert.ok(volumeTitle(cabinet.id,lang).includes(lang==='zh'?'之卷':'の巻'));
    }
    assert.equal(adjacentCabinet(adjacentCabinet(cabinet.id,1).id,-1).id,cabinet.id);
  }
  assert.equal(total,loader.loadAllSchemasSync().length);
  assert.equal(adjacentCabinet(CABINETS[0].id,-1).id,CABINETS.at(-1).id);
  assert.equal(adjacentCabinet(CABINETS.at(-1).id,1).id,CABINETS[0].id);
  assert.throws(()=>cabinetFor('W_UNKNOWN'));
  assert.equal(CABINETS.filter(c=>c.relief).length,11,'every cabinet has its own completed relief composition');
});
test('collection swipes reject vertical scroll, taps, long presses and other fingers',()=>{
  const start={id:2,x:200,y:100,time:100};
  assert.equal(swipeDirection(start,{id:2,x:100,y:105,time:400}),1);
  assert.equal(swipeDirection(start,{id:2,x:270,y:105,time:400}),-1);
  for(const end of [{id:2,x:180,y:100,time:200},{id:2,x:100,y:160,time:400},{id:2,x:100,y:105,time:1000},{id:3,x:100,y:105,time:400}])assert.equal(swipeDirection(start,end),0);
  assert.equal(swipeDirection(null,{id:2,x:100,y:100,time:200}),0);
});

test('the cabinet trails the finger and changes only once its centre reaches a side zone',()=>{
  const start={id:2,x:200,y:100,time:100};
  // A caress inside the dead zone leaves the box at rest; beyond it the box follows at DRAG_FOLLOW.
  assert.equal(cabinetOffset(DRAG_DEAD,375),0);assert.equal(cabinetOffset(-DRAG_DEAD,375),0);
  assert.equal(cabinetOffset(114,375),(114-DRAG_DEAD)*DRAG_FOLLOW);assert.equal(cabinetOffset(-114,375),-(114-DRAG_DEAD)*DRAG_FOLLOW);
  assert.equal(cabinetOffset(9999,375),375*.85);
  // Phone: the centre must travel 26% of the width, however slowly and whatever the vertical travel.
  const need=Math.ceil(switchDistance(375)/DRAG_FOLLOW+DRAG_DEAD);
  assert.equal(cabinetDragDirection(start,{id:2,x:200-need,y:300,time:9000},375),1);
  assert.equal(cabinetDragDirection(start,{id:2,x:200+need,y:100,time:9000},375),-1);
  assert.equal(cabinetDragDirection(start,{id:2,x:200-need+3,y:100,time:300},375),0);
  // A stroke across a third of the lid is still a caress.
  assert.equal(cabinetDragDirection(start,{id:2,x:80,y:100,time:300},375),0);
  // Wide screens cap the travel so a mouse need not cross the whole window.
  assert.equal(switchDistance(1440),SWITCH_MAX);
  assert.equal(cabinetDragDirection(start,{id:2,x:200+Math.ceil(SWITCH_MAX/DRAG_FOLLOW+DRAG_DEAD),y:100},1440),-1);
  assert.equal(cabinetDragDirection(start,{id:3,x:-500,y:100},375),0);
  assert.equal(cabinetDragDirection(null,{id:2,x:20,y:100},375),0);
  assert.equal(cabinetDragDirection(start,{id:2,x:-500,y:100},0),0);
});

test('idle playback yields to activity, reading, dragging, reduced motion and background tabs',()=>{
  const idle={embedded:true,reduced:false,visible:true,hidden:false,failed:false,bookState:'closed',dragging:false,idleFor:Infinity};
  assert.equal(idlePlaybackAllowed(idle),true);
  for(const override of [{embedded:false},{reduced:true},{visible:false},{hidden:true},{failed:true},{bookState:'reading'},{bookState:'switching'},{dragging:true},{idleFor:IDLE_RESUME_DELAY-1}])assert.equal(idlePlaybackAllowed({...idle,...override}),false);
  assert.equal(idlePlaybackAllowed({...idle,idleFor:IDLE_RESUME_DELAY}),true);
});
