// Trees are pure data. The fills are exact projected coverage for bounds and picking only.
import {MAT, KIND, rand} from './vocab.js';
import {STAMP, stampOutline} from './stamps.js';
import {limbOutline} from './limbs.js';

function curve(points, radii) {
  const out = [];
  // Corner-cutting retains a deliberate crooked spine without angular pipe elbows.
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], d = points[Math.min(points.length - 1, i + 2)];
    for (let j = 0; j < 6; j++) {
      const t = j / 6, at = k => .5 * (2*b[k]+(c[k]-a[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(3*b[k]-a[k]-3*c[k]+d[k])*t*t*t);
      out.push([at(0), at(1), radii[i] + (radii[i+1]-radii[i])*t]);
    }
  }
  out.push([...points.at(-1), radii.at(-1)]); return out;
}
export function stampedTree(id, x, z, h, lean, seed, species) {
  const p = {id: id+'-trunk', kind: KIND.pine, group: id, order: 0, layer: 3, mat: MAT.gold,
    anchor: [x,z], reach: 1, thick: 0, bias: 0, fills: [], lines: [], limbs: [], stamps: [], species};
  const r = rand(seed), dir = Math.sign(lean) || 1;
  const at = (dx, up) => [x + lean * up + dx * h, z - up * h];
  const limb = (pts, radii) => { const points = curve(pts, radii); p.limbs.push({points, bark: species === 'pine' ? 1 : 0}); };
  const stamp = (cell, px, pz, w, hh, turn, mat) => p.stamps.push({cell,x:px,z:pz,w,h:hh,turn,mat,offset:4.8+p.stamps.length*.035,relief:species==='pine'?.42:.24});
  if (species === 'pine') {
    const spine = [at(0,0),at(-dir*.045,.18),at(dir*.04,.35),at(-dir*.055,.55),at(dir*.025,.75),at(0,.93)];
    limb(spine,[h*.065,h*.052,h*.042,h*.030,h*.021,.6]);
    const tiers = [[.40,dir*.24],[.59,-dir*.20],[.77,dir*.18],[.93,dir*.04]];
    tiers.forEach(([up, dx], k) => {
      const root = spine[k+1], tip = at(dx,up);
      limb([root,at(dx*.5,up-.06),tip],[h*.027,h*.017,.5]);
      for (let j = 0; j < 3; j++) {
        const px = tip[0]+(j-1)*h*.12, pz=tip[1]-(j===1?h*.035:0)+(k%2?j*h*.018:0);
        stamp(j===1?STAMP.pineLayer:STAMP.pineFan,px,pz,h*(j===1?.43:.27)*(k===3?.83:1),h*(j===1?.19:.17),(j-1)*.08+(r()-.5)*.08, (j+k)%4===0?MAT.nashijiLight:MAT.gold);
      }
    });
    // An exposed, near-horizontal twig is a physical perch, independent of the foliage.
    const a=at(dir*.015,.39), b=at(dir*.20,.42), c=at(dir*.31,.43);
    limb([a,b,c],[h*.027,h*.024,.6]); p.perch = [b[0],b[1],h*.024*.62];
  } else {
    const girth=species==='ginkgo'?.072:.037;
    limb([at(0,0),at(-.025,.19),at(.02,.40),at(-.035,.64),at(.015,.88)],[h*girth,h*girth*.8,h*.025,h*.017,.5]);
    const tips=[[-.23,.56],[.24,.51],[-.22,.78],[.19,.74],[.025,.93]];
    tips.forEach(([dx,up], k)=>{
      const end=at(dx,up);
      limb([at(.005,.25+k*.08),at(dx*.52,up-.15),end],[h*.023,h*.015,.45]);
      const count=species==='cherry'?10:7;
      for(let j=0;j<count;j++) {
        const a=j*2.399+k*.8, q=j===0?0:.055+ .035*(j%3), px=end[0]+Math.cos(a)*h*q, pz=end[1]+Math.sin(a)*h*q;
        const cell=species==='maple'?(j%2?STAMP.maple5:STAMP.maple7):species==='ginkgo'?STAMP.ginkgo:species==='cherry'?STAMP.blossom:STAMP.citrusLeaf;
        const size=h*(species==='cherry'?.14:species==='maple'?.29:.23)*(.90+r()*.22);
        stamp(cell,px,pz,size,size,(r()-.5)*1.8,species==='cherry'?(j%7?MAT.silver:MAT.aogai):(j%5?MAT.gold:MAT.nashijiLight));
        if(species==='citrus' && j%3===0) stamp(STAMP.fruit,px+size*.25,pz+size*.32,size*.5,size*.5,0,MAT.gold);
      }
    });
    const a=at(.02,.37), b=at(.16,.43), c=at(.28,.44);
    limb([a,b,c],[h*.025,h*.023,.5]); p.perch=[b[0],b[1],h*.023*.62];
  }
  for(const l of p.limbs) p.fills.push({d:limbOutline(l.points),soft:0,crisp:0});
  const chunks=species==='pine'?[p.stamps.slice(0,6),p.stamps.slice(6)]:[p.stamps];
  const leaves=chunks.map((stamps,i)=>({...p,id:id+'-leaf-'+i,order:1,limbs:[],stamps,fills:stamps.map(s=>({d:stampOutline(s),soft:0,crisp:0}))}));
  p.stamps=[];
  return [p,...leaves];
}
export const stampedPine = (id,x,z,h,lean,seed) => stampedTree(id,x,z,h,lean,seed,'pine');
export const stampedMaple = (id,x,z,h,lean,seed) => stampedTree(id,x,z,h,lean,seed,'maple');
export const stampedGinkgo = (id,x,z,h) => stampedTree(id,x,z,h,3,6,'ginkgo');
export const stampedCourtTree = (id,x,z,h,{citrus=false}={}) => stampedTree(id,x,z,h,citrus?-3:4,citrus?5:3,citrus?'citrus':'cherry');
