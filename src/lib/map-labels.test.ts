import test from 'node:test';
import assert from 'node:assert/strict';
import { placeMapLabels, escapeMapLabel } from './map-labels';

test('coincident landmarks and cluster get distinct, non-overlapping boxes on mobile', () => {
  const items = ['temple','garden','cluster'].map((id,i)=>({id,x:170,y:250,width:150,height:i===2?70:44,anchorY:22}));
  const before=JSON.stringify(items), result=placeMapLabels(items,342,500);
  for(const a of items) {
    assert.equal(result[a.id].crowded,false);
    for(const b of items) if(a.id!==b.id) {
      const ax=a.x+result[a.id].dx,ay=a.y+result[a.id].dy-a.anchorY;
      const bx=b.x+result[b.id].dx,by=b.y+result[b.id].dy-b.anchorY;
      assert.ok(Math.abs(ax-bx)>=(a.width+b.width)/2 || ay+a.height<=by || by+b.height<=ay);
    }
  }
  assert.equal(JSON.stringify(items),before);
  assert.deepEqual(result,placeMapLabels(items,342,500));
});
test('edge labels stay visible, offscreen anchors stay offscreen and zoom changes rerun layout', () => {
  const item={id:'a',x:8,y:8,width:160,height:70,anchorY:22};
  const placed=placeMapLabels([item],342,500).a;
  assert.ok(item.x+placed.dx-item.width/2>=0);
  assert.ok(item.y+placed.dy-item.anchorY>=0);
  assert.deepEqual(placeMapLabels([{...item,x:-100}],342,500).a,{dx:0,dy:0,crowded:false});
  assert.notDeepEqual(placeMapLabels([{...item,x:170,y:200}],342,500).a,placed);
});
test('HTML marker text escapes markup and quotes',()=>assert.equal(escapeMapLabel('<寺 & "川">'), '&lt;寺 &amp; &quot;川&quot;&gt;'));

test('partially visible labels with offscreen anchors participate in collision avoidance', () => {
  const items = [
    { id: 'off', x: -1, y: 100, width: 160, height: 44, anchorY: 22 },
    { id: 'on', x: 8, y: 100, width: 160, height: 70, anchorY: 22 },
  ];
  const result = placeMapLabels(items, 342, 500);
  const boxes = items.map(item => ({
    x: item.x + result[item.id].dx - item.width / 2,
    y: item.y + result[item.id].dy - item.anchorY,
    w: item.width, h: item.height,
  }));
  const [a, b] = boxes;
  assert.equal(result.off.crowded, false);
  assert.equal(result.on.crowded, false);
  assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
});
