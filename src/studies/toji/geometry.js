// Small, local relief mesh. Dimensions are artistic units, not a survey of Toji.
import {buildLandmark} from './landmarks.js';
export const MATERIAL = { ground:0, nashiji:1, dense:2, gyobu:3, gold:4, silver:5, shell:6, wood:7, darkGold:8, paper:9, redLacquer:10, water:11 };
export const normalize = a => { const d=Math.hypot(...a)||1; return a.map(v=>v/d); };
export const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const subtract = (a,b) => a.map((v,i)=>v-b[i]);
export function multiply(a,b) {
  const r=new Float32Array(16);
  for(let c=0;c<4;c++) for(let row=0;row<4;row++) for(let k=0;k<4;k++) r[c*4+row]+=a[k*4+row]*b[c*4+k];
  return r;
}
export function lookAt(eye,target) {
  const z=normalize(subtract(eye,target)),x=normalize(cross([0,1,0],z)),y=cross(z,x);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
export function ortho(l,r,b,t,n,f) {return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
export function project(m,p) {
  const v=[...p,1],r=[0,0,0,0];
  for(let row=0;row<4;row++) for(let k=0;k<4;k++) r[row]+=m[k*4+row]*v[k];
  return r.slice(0,3).map(x=>x/r[3]);
}
export function groundPoint(matrix,x,y) {
  // Invert the two screen equations at y=0. Orthographic camera remains fixed.
  const a=matrix[0],b=matrix[8],c=matrix[1],d=matrix[9];
  const u=x-matrix[12],v=y-matrix[13],det=a*d-b*c;
  return [(u*d-b*v)/det,(a*v-u*c)/det];
}
export function trailIntensity(birth,now,still=false) {return still?0:Math.max(0,1-(now-birth)/1500);}

export function buildScene(selection='W_MINAMI') {
  const out=[];
  const tri=(a,b,c,mat,layer=1,normals)=>{
    const direction=cross(subtract(b,a),subtract(c,a));
    if(Math.hypot(...direction)<.00001)return;
    const n=normalize(direction);
    [a,b,c].forEach((p,i)=>out.push(...p,...(normals?.[i]??n),mat,layer));
  };
  const quad=(a,b,c,d,m,l=1)=>{tri(a,b,c,m,l);tri(a,c,d,m,l);};
  function box(x,y,z,w,h,d,m,l=1) {
    const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c=[x+w/2,y,z+d/2],e=[x-w/2,y,z+d/2];
    const up=p=>[p[0],p[1]+h,p[2]],A=up(a),B=up(b),C=up(c),E=up(e);
    quad(A,E,C,B,m,l);quad(a,A,B,b,m,l);quad(b,B,C,c,m,l);quad(c,C,E,e,m,l);quad(e,E,A,a,m,l);
  }
  function rod(a,b,r,mat,layer=1,sides=8) {
    const axis=normalize(subtract(b,a)),u=normalize(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);
    const p=(center,t)=>center.map((c,i)=>c+r*(Math.cos(t)*u[i]+Math.sin(t)*v[i]));
    for(let i=0;i<sides;i++){const t=i/sides*Math.PI*2,s=(i+1)/sides*Math.PI*2;quad(p(a,t),p(a,s),p(b,s),p(b,t),mat,layer);tri(b,p(b,t),p(b,s),mat,layer);}
  }
  function mound(x,z,rx,rz,h,mat,base=1,layer=1,seed=0) {
    const rings=6,segments=36;
    const p=(r,t)=>{const shape=1+.08*Math.sin(t*7+seed)+.035*Math.cos(t*11-seed);return [x+Math.cos(t)*rx*r*shape,base+h*Math.pow(Math.max(0,1-r*r),.7),z+Math.sin(t)*rz*r*shape];};
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++)quad(p(j/rings,i/segments*6.283),p(j/rings,(i+1)/segments*6.283),p((j+1)/rings,(i+1)/segments*6.283),p((j+1)/rings,i/segments*6.283),mat,layer);
  }
  function ribbon(points,width,mat,y=1.4,layer=0) {
    for(let i=1;i<points.length;i++){
      const [x,z]=points[i-1],[X,Z]=points[i],len=Math.hypot(X-x,Z-z),nx=-(Z-z)/len*width,nz=(X-x)/len*width;
      quad([x-nx,y,z-nz],[x+nx,y,z+nz],[X+nx,y,Z+nz],[X-nx,y,Z-nz],mat,layer);
    }
  }
  // The continuous box is one surface; no administrative clip tiles.
  box(0,-32,0,740,32,480,0,0);
  box(0,-35,0,720,4,460,8,0);
  // A separate lower box stays in place as the removable lid lifts away.
  box(0,-88,0,720,8,460,0,3);
  box(0,-80,-224,720,45,12,0,3);box(0,-80,224,720,45,12,0,3);
  box(-354,-80,0,12,45,436,0,3);box(354,-80,0,12,45,436,0,3);
  box(0,-79,0,680,1,418,8,3);
  for(const z of [-135,0,135]){
    rod([-260,-57,z],[260,-57,z],18,9,3,24);
    rod([-278,-57,z],[278,-57,z],5,8,3,12);
    rod([-263,-57,z],[263,-57,z],2.5,4,3,8);
    box(-25,-38,z,50,.8,31,4,3);
    for(const x of [-256,256])rod([x,-57,z-2],[x,-57,z+2],20,4,3,20);
  }
  for(const z of [-240,240])rod([-370,.6,z],[370,.6,z],1.3,4,0);
  for(const x of [-370,370])rod([x,.6,-240],[x,.6,240],1.3,4,0);
  // A finer inner gold line follows the bevel.
  for(const z of [-230,230])rod([-360,.7,z],[360,.7,z],.5,5,0);
  for(const x of [-360,360])rod([x,.7,-230],[x,.7,230],.5,5,0);
  // The bare box is retained for geometry regression checks, not exposed as a ward.
  if(selection===false)return new Float32Array(out);
  const ward=selection===true?'W_MINAMI':selection;
  if(ward!=='W_MINAMI'){
    buildLandmark(ward,{box,rod,quad,tri,mound,ribbon});
    return new Float32Array(out);
  }
  // Shallow terrain and a stream connect architecture to the lid.
  mound(-70,-142,225,60,16,2,1,1,3);
  mound(190,-144,140,65,23,3,1,1,7);
  mound(70,30,144,107,9,2,1,1,4);
  const stream=Array.from({length:71},(_,i)=>{const z=-202+i*5.6;return [-165+44*Math.sin(z*.016)+18*Math.sin(z*.035),z];});
  ribbon(stream,13,5);
  ribbon(stream.map(([x,z])=>[x-8,z]),1.2,4,1.6);
  ribbon(stream.map(([x,z])=>[x+10,z]),.8,4,1.6);
  // Deliberately bounded nacre inlays, not a full-surface rainbow.
  for(let i=8;i<62;i+=6) ribbon(stream.slice(i,i+3),6,6,1.8);
  for(let k=0;k<9;k++){
    const z=104+k*7;
    ribbon(Array.from({length:32},(_,j)=>[-315+j*4,z+Math.sin(j*.17+k)*6]),.35,4);
  }
  // Ground stones are independent shallow volumes.
  for(const [x,z,rx,rz,h] of [[-88,70,32,23,16],[-48,91,24,16,12],[178,77,42,22,21],[210,66,25,20,14],[-242,-80,38,26,19],[-285,-96,25,20,13]])mound(x,z,rx,rz,h,5,1,1,x);

  function roof(x,z,y,w,d) {
    // Curved four-sided eaves, with separate underside and lip geometry.
    const ring=(scale,height)=>[[-w*scale,height,-d*scale],[w*scale,height,-d*scale],[w*scale,height,d*scale],[-w*scale,height,d*scale]].map(p=>[p[0]+x,p[1]+y,p[2]+z]);
    const outer=ring(1,2),low=ring(1,-1),middle=ring(.67,5),inner=ring(.27,17);
    for(let i=0;i<4;i++){
      const j=(i+1)%4;
      quad(outer[i],middle[i],middle[j],outer[j],8);
      quad(middle[i],inner[i],inner[j],middle[j],2);
      quad(low[i],outer[i],outer[j],low[j],4);
      rod(outer[i],outer[j],.7,4);
      for(let k=1;k<14;k++){
        const a=k/14,interp=(p,q)=>p.map((v,n)=>v*(1-a)+q[n]*a);
        const A=interp(outer[i],outer[j]),B=interp(middle[i],middle[j]),C=interp(inner[i],inner[j]);
        A[1]+=.55;B[1]+=.55;C[1]+=.55;
        rod(A,B,.34,4);rod(B,C,.34,4);
      }
    }
    quad(inner[0],inner[3],inner[2],inner[1],4);
    // Upturned corner ornaments visibly silhouette against the ground.
    for(const p of outer)rod(p,[p[0]+(p[0]-x)*.055,p[1]+5,p[2]+(p[2]-z)*.055],.9,5);
  }
  const tx=72,tz=25;
  box(tx,5,tz,156,5,122,5);box(tx,10,tz,146,3,112,4);
  for(let level=0;level<5;level++){
    const y=14+level*31,w=62-level*8,d=43-level*5;
    box(tx,y,tz,w*1.5,22,d*1.5,7);
    for(let j=-3;j<=3;j++){
      rod([tx+j*w/4,y,tz+d*.83],[tx+j*w/4,y+23,tz+d*.83],1.5,4);
      rod([tx+j*w/4,y,tz-d*.83],[tx+j*w/4,y+23,tz-d*.83],1.5,4);
    }
    for(const x of [-w*.83,w*.83]) for(let j=-2;j<=2;j++)rod([tx+x,y,tz+j*d/3],[tx+x,y+23,tz+j*d/3],1.3,4);
    // Delicate rails and lattice, not pasted facade icons.
    for(let j=-5;j<=5;j++)rod([tx+j*w/6,y+3,tz+d*.94],[tx+j*w/6,y+9,tz+d*.94],.65,5);
    rod([tx-w*.9,y+9,tz+d*.94],[tx+w*.9,y+9,tz+d*.94],.8,4);
    roof(tx,tz,y+22,89-level*11,63-level*7);
  }
  rod([tx,178,tz],[tx,241,tz],1.65,4,1,12);
  for(let j=0;j<9;j++){
    const y=188+j*4.5,r=8-j*.55;
    for(let k=0;k<24;k++){const a=k/24*6.283,b=(k+1)/24*6.283;rod([tx+Math.cos(a)*r,y,tz+Math.sin(a)*r],[tx+Math.cos(b)*r,y,tz+Math.sin(b)*r],.7,4,1,4);}
  }
  // Side hall belongs to the same Toji scene, not another landmark sample.
  box(-62,8,-92,99,28,56,7);
  for(let j=-4;j<=4;j++)rod([-62+j*11,8,-61],[-62+j*11,35,-61],1.4,4);
  roof(-62,-92,34,70,47);
  function pine(x,z,height,seed) {
    const a=[x,3,z],b=[x+7,height*.55,z-4],c=[x-2,height,z+3];
    rod(a,b,3.1,8,2);rod(b,c,2.1,8,2);
    for(let j=0;j<4;j++){
      const side=j%2?-1:1,y=height*(.48+j*.15),px=x+side*(25-j*3),pz=z+(j%3-1)*13;
      rod([x+3,y-9,z],[px,y,pz],1.6,8,2);
      mound(px,pz,27-j,18,5.5,2,y,2,seed+j);
      mound(px+5,pz+3,22-j,15,2.2,4,y+4,2,seed+j);
    }
  }
  pine(-260,14,78,2);pine(-212,42,59,4);pine(234,-34,96,7);pine(270,-57,77,9);pine(187,-103,63,1);
  // Small gold/silver geometric inlays on the foreground, with a quiet border rhythm.
  for(let i=0;i<27;i++){
    const x=-32+i*9,z=163+Math.sin(i*.65)*7;
    box(x,1.1,z,3.4,.25,1.7,i%4===0?5:4,0);
  }
  return new Float32Array(out);
}
