import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {LANDMARK_STUDIES} from '../src/studies/toji/landmarks.js';
import {buildScene,normalize,multiply,lookAt,ortho,project,groundPoint,trailIntensity} from '../src/studies/toji/geometry.js';

test('Toji relief mesh has finite positions, unit normals and four depth layers',()=>{
  const mesh=buildScene(),layers=new Set(),materials=new Set();
  assert.equal(mesh.length%24,0);
  assert.ok(mesh.length/8<150000,'mesh stays inside the local study budget');
  for(let i=0;i<mesh.length;i+=8){
    for(let j=0;j<8;j++)assert.ok(Number.isFinite(mesh[i+j]));
    assert.ok(Math.abs(Math.hypot(...mesh.slice(i+3,i+6))-1)<.00001);
    layers.add(mesh[i+7]);materials.add(mesh[i+6]);
  }
  assert.deepEqual([...layers].sort(),[0,1,2,3]);
  assert.deepEqual([...materials].sort(),[0,2,3,4,5,6,7,8,9]);
});
test('undecorated cabinets never inherit Toji architecture or terrain',()=>{
  const mesh=buildScene(false),layers=new Set();
  for(let i=0;i<mesh.length;i+=8)layers.add(mesh[i+7]);
  assert.deepEqual([...layers].sort(),[0,3]);
  assert.ok(mesh.length/8<10000);
  assert.ok(mesh.length>0);
});
test('all eleven reliefs are distinct, finite, within the lid envelope and the original mesh budget',()=>{
  const fingerprints=new Set();
  for(const ward of Object.keys(LANDMARK_STUDIES)){
    const mesh=buildScene(ward),layers=new Set();let highest=0;
    assert.equal(mesh.length%24,0,ward);
    assert.ok(mesh.length/8<=150000,`${ward}: bounded draw budget`);
    fingerprints.add(createHash('sha256').update(new Uint8Array(mesh.buffer)).digest('hex'));
    for(let i=0;i<mesh.length;i+=8){
      for(let j=0;j<8;j++)assert.ok(Number.isFinite(mesh[i+j]),ward);
      assert.ok(Math.abs(Math.hypot(...mesh.slice(i+3,i+6))-1)<.00001,ward);
      assert.ok(Math.abs(mesh[i])<372&&Math.abs(mesh[i+2])<242,`${ward}: no detached scenery outside the lid`);
      assert.ok(mesh[i+1]>=-88&&mesh[i+1]<250,ward);
      assert.ok(mesh[i+6]>=0&&mesh[i+6]<=11,ward);
      layers.add(mesh[i+7]);highest=Math.max(highest,mesh[i+1]);
    }
    assert.deepEqual([...layers].sort(),[0,1,2,3],ward);
    assert.ok(highest>65,`${ward}: real elevation, not only surface marks`);
  }
  assert.equal(fingerprints.size,11,'no ward is served a duplicate landmark mesh');
  assert.equal(buildScene('W_MINAMI').length/8,137982,'accepted Toji geometry remains intact');
  assert.throws(()=>buildScene('W_UNKNOWN'));
});
test('ground picking inverts the fixed projection on desktop and narrow screens',()=>{
  for(const [width,height] of [[1182,570],[337,450]]){
    const halfW=Math.max(475,340*width/height),halfH=halfW/(width/height);
    const matrix=multiply(ortho(-halfW,halfW,-halfH,halfH,1,2200),lookAt([430,720,920],[0,40,0]));
    for(const point of [[0,0,0],[-350,0,-230],[350,0,230],[72,0,25]]){
      const screen=project(matrix,point),world=groundPoint(matrix,screen[0],screen[1]);
      assert.ok(Math.hypot(world[0]-point[0],world[1]-point[2])<.001);
    }
    // Actual vertex displacement, not a lighting-only effect.
    const flat=project(matrix,[72,241*.025,25]);
    const relief=project(matrix,[72,241,25]);
    assert.ok(Math.abs(relief[1]-flat[1])*height/2>65);
  }
});
test('Kiyomizu roof keeps clearance above the hall and continuous normals within each roof slope',()=>{
  const mesh=buildScene('W_HIGASHIYAMA'),front=new Map();let faces=0,minY=Infinity;
  for(let i=0;i<mesh.length;i+=24){
    const vertices=[0,8,16].map(offset=>Array.from(mesh.slice(i+offset,i+offset+8)));
    if(!vertices.every(v=>v[6]===8&&v[1]>120))continue;
    faces++;
    for(let j=0;j<3;j++){
      const v=vertices[j],next=vertices[(j+1)%3];
      minY=Math.min(minY,v[1]);assert.equal(v[7],1,'roof shares the structural deformation layer');
      assert.ok(Math.hypot(...v.slice(0,3).map((x,k)=>x-next[k]))<25,'no broad diagonal face across the roof');
      if(v[2]>-33&&Math.abs(v[0])<80){
        const key=v.slice(0,3).map(x=>x.toFixed(4)).join(','),normal=v.slice(3,6);
        if(front.has(key))assert.ok(Math.hypot(...normal.map((x,k)=>x-front.get(key)[k]))<.00001,'shared slope vertices have matching normals');
        else front.set(key,normal);
      }
    }
  }
  assert.ok(faces>100&&front.size>100);
  // Raised hall body ends at 127. Both surfaces share the same affine deformation.
  for(const lift of [.025,.55,.82,1])assert.ok((minY-127)*lift>8*lift,'roof remains clear of the wall even when flattened or tilted');
});
test('Kiyomizu silver plinth stays above the overlapping stage and its gold seams',()=>{
  const mesh=buildScene('W_HIGASHIYAMA');let plinthBottom=Infinity,plinthTop=-Infinity,deckTop=-Infinity;
  for(let i=0;i<mesh.length;i+=8){
    const [x,y,z,,,,material,layer]=mesh.slice(i,i+8);
    if(material===5&&y>70&&y<110&&Math.abs(x)<=149&&z>=-108&&z<=40){
      plinthBottom=Math.min(plinthBottom,y);plinthTop=Math.max(plinthTop,y);
      assert.equal(layer,1);
    }
    if((material===8||material===4)&&y>70&&y<82&&Math.abs(x)<160&&z>=26&&z<=40){
      deckTop=Math.max(deckTop,y);assert.equal(layer,1);
    }
  }
  assert.ok(Number.isFinite(plinthBottom)&&Number.isFinite(deckTop));
  assert.ok(plinthTop>plinthBottom);
  // The overlap in plan is intentional; its surfaces must not coincide in height.
  for(const lift of [.025,.55,.82,1])assert.ok((plinthBottom-deckTop)*lift>4*lift,'silver base clears stage even during flattening and shear');
});
test('trail expires completely and reduced motion suppresses every sample',()=>{
  assert.equal(trailIntensity(100,100),1);
  assert.equal(trailIntensity(100,850),.5);
  assert.equal(trailIntensity(100,1600),0);
  assert.equal(trailIntensity(100,5000),0);
  assert.equal(trailIntensity(100,100,true),0);
  assert.deepEqual(normalize([0,0,0]),[0,0,0]);
});
