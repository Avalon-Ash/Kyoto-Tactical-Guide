import test from 'node:test';
import assert from 'node:assert/strict';
import {lookAt,multiply,ortho,groundPoint} from '../src/studies/toji/geometry.js';
import {baseHalf,viewBox,clampPan,panLimit,rubberBand,planePoint,anchorPan,dragPan,renderDpr,isZoomed,clampZoom,isDoubleTap,ZOOM_MAX} from '../src/studies/toji/view.js';

const VIEW=lookAt([430,720,920],[0,40,0]);
const camera=(aspect,zoom=1,cx=0,cy=0)=>{const v=viewBox(aspect,zoom,cx,cy);return multiply(ortho(v.left,v.right,v.bottom,v.top,1,2200),VIEW);};
const close=(a,b,eps=1e-6)=>assert.ok(Math.abs(a-b)<eps,`${a} vs ${b}`);

test('zoom 1 with no pan is the original home framing',()=>{
  for(const aspect of [390/550,1,1440/700]){
    const halfW=Math.max(475,340*aspect),v=viewBox(aspect,1,0,0);
    assert.deepEqual([v.left,v.right,v.bottom,v.top],[-halfW,halfW,-halfW/aspect,halfW/aspect]);
  }
});
test('zoom shrinks the view box around its centre',()=>{
  const v=viewBox(1,2,30,-20),b=baseHalf(1);
  close(v.halfW,b.halfW/2);close((v.left+v.right)/2,30);close((v.bottom+v.top)/2,-20);
});
test('pan stays inside the original frame and is zero at zoom 1',()=>{
  assert.deepEqual(panLimit(1,1),{x:0,y:0});
  for(const zoom of [1.3,2,ZOOM_MAX]){
    const [cx,cy]=clampPan(.7,zoom,1e5,-1e5),v=viewBox(.7,zoom,cx,cy),b=baseHalf(.7);
    assert.ok(v.right<=b.halfW+1e-9&&v.bottom>=-b.halfH-1e-9);
  }
});
test('rubber band resists but never reverses or jumps',()=>{
  assert.equal(rubberBand(50,100,300),50);
  let last=100;
  for(const value of [120,200,600,5000]){const r=rubberBand(value,100,300);assert.ok(r>last&&r<100+300);last=r;}
  assert.ok(rubberBand(-600,100,300)<-100);
});
test('pinch anchor keeps the point under the fingers fixed',()=>{
  const aspect=.7,p=planePoint(aspect,1,0,0,.3,.6),[cx,cy]=anchorPan(aspect,2.4,p,.3,.6),q=planePoint(aspect,2.4,cx,cy,.3,.6);
  close(p[0],q[0]);close(p[1],q[1]);
});
test('a lid tap still lands on the lid after zoom and pan',()=>{
  // Project a ground point through the zoomed camera, then invert it as the tap handler does.
  for(const [zoom,cx,cy] of [[1,0,0],[2.2,80,-40],[3,-150,90]]){
    const m=camera(.7,zoom,cx,cy),world=[120,0,-60];
    const sx=m[0]*world[0]+m[4]*world[1]+m[8]*world[2]+m[12],sy=m[1]*world[0]+m[5]*world[1]+m[9]*world[2]+m[13];
    const [x,z]=groundPoint(m,sx,sy);close(x,world[0],1e-6);close(z,world[2],1e-6);
  }
});
test('one-finger drag moves the box with the finger',()=>{
  const [dx,dy]=dragPan(1,2,100,50,400,400),v=viewBox(1,2);
  close(dx,-100/400*2*v.halfW);close(dy,50/400*2*v.halfH);
});
test('only a real close-up switches the drag to panning',()=>{
  assert.equal(isZoomed(1),false);assert.equal(isZoomed(1.02),false);assert.equal(isZoomed(1.2),true);
  assert.equal(clampZoom(.5),1);assert.equal(clampZoom(99),ZOOM_MAX);
});
test('close-up resolution rises but stays within the canvas budget',()=>{
  assert.equal(renderDpr(3,1,390,550),1.5);
  assert.equal(renderDpr(3,2,390,550),2);
  const big=renderDpr(3,2,1440,900);assert.ok(1440*900*big*big<=2.2e6+1||big===1.5);
});
test('double tap needs two quick taps in the same place',()=>{
  const a={x:100,y:100,time:0};
  assert.ok(isDoubleTap(a,{x:110,y:104,time:250}));
  assert.ok(!isDoubleTap(a,{x:110,y:104,time:400}));
  assert.ok(!isDoubleTap(a,{x:180,y:100,time:200}));
  assert.ok(!isDoubleTap(null,a));
});
