// Pure data for the three.js plate renderer (three-renderer.js): material table, box and mesh packing, motion state
// packing and the GLSL that moves a part. Nothing here imports three, so node:test can check it.
import {MAT} from './vocab.js';
import {MAX_PARTS} from './parts.js';
import {packMeshes} from './mesh-geometry.js';
import {limbMesh, stampInstances} from './limbs.js';

/**
 * MAT → MeshPhysicalMaterial parameters (docs/MAKIE_THREE_PLAN.md §3). First pass: T3 tunes the numbers against .shots/refs.
 * flake: strength of the procedural gold-powder normal map (0 = none). paint: the flat colour used by the ground texture
 * for parts that are not yet three meshes (T1/T2 replace that). glow: emissive follows the part's glow state.
 */
export const MATERIALS = {
  [MAT.ground]: {name: 'ground', color: '#a8742e', paint: '#9a6c2c', metalness: .75, roughness: .45, clearcoat: 1, clearcoatRoughness: .08, flake: .35},
  [MAT.nashijiLight]: {name: 'nashijiLight', color: '#b88a3c', paint: '#a8823a', metalness: .85, roughness: .5, clearcoat: .6, clearcoatRoughness: .1, flake: .5},
  [MAT.mura]: {name: 'mura', color: '#9c7430', paint: '#6e5222', metalness: .8, roughness: .55, clearcoat: .6, clearcoatRoughness: .1, flake: .45},
  [MAT.gyobu]: {name: 'gyobu', color: '#c29a46', paint: '#8a6a2c', metalness: .85, roughness: .45, clearcoat: .5, clearcoatRoughness: .1, flake: .7},
  [MAT.gold]: {name: 'gold', color: '#cf9e48', paint: '#d6a640', metalness: 1, roughness: .38, clearcoat: .3, clearcoatRoughness: .1, flake: .22},
  [MAT.silver]: {name: 'silver', color: '#d4d6d2', paint: '#cfd0cc', metalness: 1, roughness: .28, clearcoat: 0, clearcoatRoughness: 0, flake: .3},
  [MAT.kirikane]: {name: 'kirikane', color: '#f2c65e', paint: '#e0b650', metalness: .88, roughness: .45, clearcoat: 0, clearcoatRoughness: 0, flake: .12},
  [MAT.kirigin]: {name: 'kirigin', color: '#d8dbd6', paint: '#bfc0b8', metalness: .88, roughness: .45, clearcoat: 0, clearcoatRoughness: 0, flake: .12},
  [MAT.aogai]: {name: 'aogai', color: '#2a6f78', paint: '#3c8f90', metalness: .2, roughness: .25, clearcoat: 1, clearcoatRoughness: .05, flake: 0, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [200, 600]},
  [MAT.hyomonGold]: {name: 'hyomonGold', color: '#e6b94e', paint: '#e2b24c', metalness: 1, roughness: .18, clearcoat: 0, clearcoatRoughness: 0, flake: .15},
  [MAT.hyomonSilver]: {name: 'hyomonSilver', color: '#e0e2de', paint: '#d8d9d4', metalness: 1, roughness: .15, clearcoat: 0, clearcoatRoughness: 0, flake: .15},
  [MAT.water]: {name: 'water', color: '#2c4256', paint: '#2a3d50', metalness: .6, roughness: .12, clearcoat: 1, clearcoatRoughness: .02, flake: 0},
  [MAT.kasumi]: {name: 'kasumi', color: '#d9b25a', paint: '#caa24a', metalness: .9, roughness: .3, clearcoat: 0, clearcoatRoughness: 0, flake: .2},
  [MAT.lacquer]: {name: 'lacquer', color: '#0b0807', paint: '#1a1310', metalness: 0, roughness: .12, clearcoat: 1, clearcoatRoughness: .03, flake: 0},
  [MAT.lamp]: {name: 'lamp', color: '#2a1a0a', paint: '#ff9a3c', metalness: 0, roughness: .6, clearcoat: 0, clearcoatRoughness: 0, flake: 0, emissive: '#ff9a3c', glow: true},
};

/** The box has its own small material ids (see buildBox in renderer.js). 25 is the shadow underlay and is not drawn here. */
export const BOX_MATERIALS = {
  // Hatsune: the whole body is nashiji (amber lacquer over gold powder), not black lacquer (user decision, handoff §3).
  20: {name: 'side', color: '#c4893a', metalness: .72, roughness: .4, clearcoat: 1, clearcoatRoughness: .06, flake: 0, nashijiSide: true},
  // The lid's lip: gold, as on the Hatsune boxes (museum photos show no silver rim).
  21: {name: 'rim', color: '#c39345', metalness: 1, roughness: .3, clearcoat: .2, clearcoatRoughness: .1, flake: .2},
  22: {name: 'inner', color: '#8c6a2d', metalness: .8, roughness: .5, clearcoat: .5, clearcoatRoughness: .1, flake: .5},
  23: {name: 'paper', color: '#cdbd98', metalness: 0, roughness: .9, clearcoat: 0, clearcoatRoughness: 0, flake: 0},
  24: {name: 'gold', color: '#d7a64a', metalness: 1, roughness: .3, clearcoat: .2, clearcoatRoughness: .1, flake: .3},
  26: {name: 'edge', color: '#c99a42', metalness: 1, roughness: .3, clearcoat: .2, clearcoatRoughness: .1, flake: .3},
  27: {name: 'cord', color: '#85100a', metalness: 0, roughness: .6, clearcoat: 0, clearcoatRoughness: 0, flake: 0},
  28: {name: 'tray', color: '#b4843a', metalness: .8, roughness: .5, clearcoat: .5, clearcoatRoughness: .1, flake: .5},
};

/** The lid's own ground (box ids 0): the picture is painted on it. */
export const GROUND_LID = {name: 'lid', color: '#ffffff', metalness: .3, roughness: .4, clearcoat: 1, clearcoatRoughness: .06, flake: 0};

/** Texels per row of the motion texture; row 0 holds `a` (sway, stand, rise, glow), row 1 holds `b` (dx, dz, lift, group). */
export const STATE_WIDTH = MAX_PARTS, STATE_HEIGHT = 2;

/** Writes createLife's two Float32Arrays into one RGBA float texture's data, row 0 then row 1. */
export function packLifeState(a, b, out = new Float32Array(STATE_WIDTH * STATE_HEIGHT * 4)) {
  const row = STATE_WIDTH * 4;
  if (a.length < row || b.length < row) throw new Error('packLifeState: state arrays are shorter than MAX_PARTS * 4');
  out.set(a.subarray(0, row), 0); out.set(b.subarray(0, row), row);
  return out;
}

/** Part meshes grouped by material id: Map(mat → Float32Array of 16 floats per vertex, the packMeshes layout). */
export function meshesByMaterial(parts) {
  const mats = new Set();
  for (const p of parts) for (const chunk of p.mesh ?? []) mats.add(chunk.mat);
  const out = new Map();
  for (const mat of [...mats].sort((x, y) => x - y)) {
    const only = parts.filter(p => p.mesh?.some(c => c.mat === mat)).map(p => ({...p, mesh: p.mesh.filter(c => c.mat === mat)}));
    out.set(mat, packMeshes(only));
  }
  return out;
}

/** Tree limbs grouped by material id: Map(mat → Float32Array of 16 floats per vertex, the limbMesh layout). */
export function limbsByMaterial(parts) {
  const mats = new Set();
  for (const p of parts) for (const limb of p.limbs ?? []) mats.add(limb.mat ?? p.mat);
  const out = new Map();
  for (const mat of [...mats].sort((x, y) => x - y)) {
    const only = parts.filter(p => p.limbs?.some(l => (l.mat ?? p.mat) === mat))
      .map(p => ({...p, limbs: p.limbs.filter(l => (l.mat ?? p.mat) === mat)}));
    out.set(mat, limbMesh(only));
  }
  return out;
}

/**
 * Tree stamps grouped by material id for InstancedMesh:
 * Map(mat → {placement, stamp, owner, style, count}) where each typed array holds 4 floats per stamp.
 */
export function stampsByMaterial(parts) {
  const mats = new Set();
  for (const p of parts) for (const s of p.stamps ?? []) mats.add(s.mat);
  const out = new Map();
  for (const mat of [...mats].sort((x, y) => x - y)) {
    const only = parts.filter(p => p.stamps?.some(s => s.mat === mat))
      .map(p => ({...p, stamps: p.stamps.filter(s => s.mat === mat)}));
    const packed = stampInstances(only);
    const count = packed.length / 16;
    const placement = new Float32Array(count * 4), stamp = new Float32Array(count * 4);
    const owner = new Float32Array(count * 4), style = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const b = i * 16, o = i * 4;
      placement.set(packed.subarray(b, b + 4), o);
      stamp.set(packed.subarray(b + 4, b + 8), o);
      owner.set(packed.subarray(b + 8, b + 12), o);
      style.set(packed.subarray(b + 12, b + 16), o);
    }
    out.set(mat, {placement, stamp, owner, style, count});
  }
  return out;
}

const BOX_STRIDE = 10;
/** Splits buildBox's vertices [from, to) by box material id: Map(id → {position, normal, uv, part}) of Float32Arrays. */
export function sliceBox(data, from, to) {
  const lists = new Map();
  for (let v = from; v < to; v++) {
    const i = v * BOX_STRIDE, mat = data[i + 8];
    if (!lists.has(mat)) lists.set(mat, {position: [], normal: [], uv: [], part: []});
    const l = lists.get(mat);
    l.position.push(data[i], data[i + 1], data[i + 2]); l.normal.push(data[i + 3], data[i + 4], data[i + 5]);
    l.uv.push(data[i + 6], data[i + 7]); l.part.push(data[i + 9]);
  }
  return new Map([...lists].map(([mat, l]) => [mat, {position: new Float32Array(l.position), normal: new Float32Array(l.normal), uv: new Float32Array(l.uv), part: new Float32Array(l.part)}]));
}

/** The lid's ground has no height field yet (T1): the dome only, same formula as buildBox. */
export const DOME_GLSL = `float groundY(vec2 p){ return 3.2*(1.-(p.x/370.)*(p.x/370.))*(1.-(p.y/240.)*(p.y/240.)); }`;

/** Layer 0 height field: the shallow dome plus the blurred soft swell modulated by each bank's rise state. */
export const GROUND_GLSL = `
uniform sampler2D uSoft0, uIdent0;
const vec2 K_HALF=vec2(360.,230.);
const float K_SWELL=17.;
float groundY(vec2 p){
  vec2 c=clamp(p,-K_HALF,K_HALF),uv=(c+K_HALF)/(2.*K_HALF);
  ivec2 sz=textureSize(uIdent0,0);
  int id=int(texelFetch(uIdent0,clamp(ivec2(uv*vec2(sz)),ivec2(0),sz-1),0).r*255.+.5);
  float rise=texelFetch(uState,ivec2(id,0),0).z;
  float dome=3.2*(1.-(p.x/370.)*(p.x/370.))*(1.-(p.y/240.)*(p.y/240.));
  vec2 e=1.-smoothstep(K_HALF-44.,K_HALF-6.,abs(c));
  return dome+textureLod(uSoft0,uv,0.).r*K_SWELL*mix(.3,1.,rise)*e.x*e.y;
}`;

/**
 * Downsamples the red channel of layer 0 (4×4 box, matching mip 2 of the legacy GPU blur) and runs a
 * 15-tap separable Gaussian blur (`exp(-i*i/14)`), producing the soft swell height field in 0..1.
 */
export function bakeSoftLayer(rgba, w, h) {
  const sw = Math.round(w / 4), sh = Math.round(h / 4);
  const src = new Float32Array(sw * sh), tmp = new Float32Array(sw * sh), dst = new Float32Array(sw * sh);
  for (let sy = 0; sy < sh; sy++) {
    const y0 = Math.floor(sy * h / sh), y1 = Math.min(h, Math.floor((sy + 1) * h / sh));
    for (let sx = 0; sx < sw; sx++) {
      const x0 = Math.floor(sx * w / sw), x1 = Math.min(w, Math.floor((sx + 1) * w / sw));
      let sum = 0, count = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { sum += rgba[(y * w + x) * 4]; count++; }
      src[sy * sw + sx] = count ? sum / (count * 255) : 0;
    }
  }
  const weights = new Float32Array(15);
  let norm = 0;
  for (let i = -7; i <= 7; i++) { const wt = Math.exp(-(i * i) / 14); weights[i + 7] = wt; norm += wt; }
  for (let i = 0; i < 15; i++) weights[i] /= norm;
  for (let y = 0; y < sh; y++) {
    const row = y * sw;
    for (let x = 0; x < sw; x++) {
      let sum = 0;
      for (let i = -7; i <= 7; i++) sum += weights[i + 7] * src[row + Math.max(0, Math.min(sw - 1, x + i))];
      tmp[row + x] = sum;
    }
  }
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      let sum = 0;
      for (let i = -7; i <= 7; i++) sum += weights[i + 7] * tmp[Math.max(0, Math.min(sh - 1, y + i)) * sw + x];
      dst[y * sw + x] = sum;
    }
  }
  return {data: dst, sw, sh};
}

/**
 * Builds subdivided quads for every KIND.mist band so floating mist tracks the hills beneath it cleanly.
 * Returns {position: Float32Array, owner: Float32Array, count: number}.
 */
export function mistGeometryData(mistParts, nx = 24, nz = 6) {
  const pos = [], owner = [], pad = 3;
  for (const p of mistParts) {
    const x0 = p.bounds[0] - pad, z0 = p.bounds[1] - pad, x1 = p.bounds[2] + pad, z1 = p.bounds[3] + pad;
    const dx = (x1 - x0) / nx, dz = (z1 - z0) / nz;
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const xa = x0 + i * dx, xb = xa + dx, za = z0 + j * dz, zb = za + dz;
      for (const [x, z] of [[xa, za], [xb, za], [xb, zb], [xa, za], [xb, zb], [xa, zb]]) {
        pos.push(x, 0, z);
        owner.push(p.index, p.foot, p.anchor[0], p.anchor[1]);
      }
    }
  }
  return {position: new Float32Array(pos), owner: new Float32Array(owner), count: pos.length / 3};
}

/**
 * The hinge of mesh-shaders.js, written as a function so MeshPhysicalMaterial and MeshDepthMaterial run the same code:
 * stand up about the foot line, sway about the anchor, travel, lift, open with the lid, tilt with the hand.
 * Per-part state comes from uState (row 0 = a, row 1 = b, one texel per part index).
 */
export const PART_MOTION_GLSL = `
uniform sampler2D uState; uniform mat3 uTilt; uniform float uOpening;
attribute vec4 aOwner; attribute vec4 aStyle;
varying float vGlow;
${GROUND_GLSL}
void kyotoMotion(vec3 aPos, vec3 aNormal, out vec3 outPos, out vec3 outNormal){
  int id=int(aOwner.x+.5); vec4 A=texelFetch(uState,ivec2(id,0),0), B=texelFetch(uState,ivec2(id,1),0);
  float foot=aOwner.y; vec2 anchor=aOwner.zw;
  float theta=A.y*aStyle.x, ct=cos(theta), st=sin(theta), cs=cos(A.x), sn=sin(A.x);
  vec2 r=aPos.xz-anchor, q=anchor+vec2(cs*r.x-sn*r.y,sn*r.x+cs*r.y)+B.xy;
  float upF=aStyle.x>0.?smoothstep(.1,.7,A.y):0.;
  float gy=mix(groundY(q),groundY(vec2(q.x,foot)),upF);
  float eps=1.5;
  float gyX0=mix(groundY(q-vec2(eps,0.)),groundY(vec2(q.x-eps,foot)),upF);
  float gyX1=mix(groundY(q+vec2(eps,0.)),groundY(vec2(q.x+eps,foot)),upF);
  float dgyX=(gyX1-gyX0)/(2.*eps);
  float dgyZ=(1.-upF)*(groundY(q+vec2(0.,eps))-groundY(q-vec2(0.,eps)))/(2.*eps);
  vec3 up=vec3(0.,ct,st), down=vec3(0.,-st,ct), right=vec3(1.,0.,0.);
  vec3 tx=right*cs+down*sn, tz=-right*sn+down*cs;
  vec3 jx=tx+vec3(0.,dgyX*cs+dgyZ*sn,0.), jy=up, jz=tz+vec3(0.,-dgyX*sn+dgyZ*cs,0.);
  vec3 nLocal=cross(jy,jz)*aNormal.x+cross(jz,jx)*aNormal.y+cross(jx,jy)*aNormal.z;
  float height=aPos.y+aStyle.w;
  vec3 p=vec3(q.x,gy+B.z+.35,foot)+down*(q.y-foot)+up*height;
  p.y+=uOpening*360.; p.z-=uOpening*650.;
  vec3 centre=vec3(0.,-48.,0.); p=uTilt*(p-centre)+centre;
  outPos=p; outNormal=uTilt*normalize(nLocal);
  vGlow=A.w;
}`;

const TREE_MOTION_CORE_GLSL = `
uniform sampler2D uState; uniform mat3 uTilt; uniform float uOpening;
varying float vGlow;
${GROUND_GLSL}
void kyotoTreeTransform(vec2 rest, float height, vec3 localN, vec2 along, vec4 owner, vec4 style,
    out vec3 outPos, out vec3 outNormal, out vec3 outTanX, out vec3 outTanZ){
  int id=int(owner.x+.5); vec4 A=texelFetch(uState,ivec2(id,0),0), B=texelFetch(uState,ivec2(id,1),0);
  float foot=owner.y; vec2 anchor=owner.zw;
  float theta=A.y*style.x, ct=cos(theta), st=sin(theta), cs=cos(A.x), sn=sin(A.x);
  vec2 r=rest-anchor, q=anchor+vec2(cs*r.x-sn*r.y,sn*r.x+cs*r.y)+B.xy;
  vec3 up=vec3(0.,ct,st), down=vec3(0.,-st,ct), right=vec3(1.,0.,0.);
  vec3 tx=right*cs+down*sn, tz=-right*sn+down*cs;
  float gy=groundY(anchor);
  vec3 p=vec3(q.x,gy+B.z+.6,foot)+down*(q.y-foot)+up*height;
  p.y+=uOpening*360.; p.z-=uOpening*650.;
  vec3 centre=vec3(0.,-48.,0.); p=uTilt*(p-centre)+centre;
  outPos=p;
  outNormal=uTilt*normalize(tx*localN.x+up*localN.y+tz*localN.z);
  outTanX=uTilt*(tx*along.x+tz*along.y);
  outTanZ=uTilt*(-tx*along.y+tz*along.x);
  vGlow=A.w;
}`;

/** Tree limb hinge/sway transform matching tree-shaders.js (groundY at tree anchor, +0.6 clearance). */
export const TREE_LIMB_MOTION_GLSL = `
attribute vec4 aOwner; attribute vec4 aStyle;
${TREE_MOTION_CORE_GLSL}
void kyotoLimb(vec3 aPos, vec3 aNormal, out vec3 outPos, out vec3 outNormal, out vec3 outTanX, out vec3 outTanZ){
  kyotoTreeTransform(aPos.xz, aPos.y, aNormal, vec2(1.,0.), aOwner, aStyle, outPos, outNormal, outTanX, outTanZ);
}`;

/** Instanced tree stamp hinge/sway transform matching tree-shaders.js. */
export const TREE_STAMP_MOTION_GLSL = `
attribute vec4 aPlacement, aStamp, aOwner, aStyle;
varying vec4 vTree;
varying vec2 vTreeScale;
${TREE_MOTION_CORE_GLSL}
void kyotoStamp(vec2 aUv, out vec3 outPos, out vec3 outNormal, out vec3 outTanX, out vec3 outTanZ){
  float c=cos(aPlacement.z), s=sin(aPlacement.z);
  vec2 along=vec2(c,s), corner=(aUv-.5)*aStamp.xy;
  vec2 rest=aPlacement.xy+vec2(c*corner.x-s*corner.y,s*corner.x+c*corner.y);
  kyotoTreeTransform(rest, aPlacement.w, vec3(0.,1.,0.), along, aOwner, aStyle, outPos, outNormal, outTanX, outTanZ);
  vTree=vec4(aUv, aStamp.z, aStamp.w);
  vTreeScale=aStamp.xy;
}`;

/** The box and its lid: only the lid (part 0) opens, everything leans with the hand. */
export const BOX_MOTION_GLSL = `
uniform mat3 uTilt; uniform float uOpening;
attribute float aPart;
varying float vGlow;
void kyotoBox(vec3 aPos, vec3 aNormal, out vec3 outPos, out vec3 outNormal){
  vec3 p=aPos;
  if(aPart<.5){p.y+=uOpening*360.; p.z-=uOpening*650.;}
  vec3 centre=vec3(0.,-48.,0.); p=uTilt*(p-centre)+centre;
  outPos=p; outNormal=uTilt*aNormal; vGlow=0.;
}`;

/** Lid top vertex deformation: shares groundY with PART_MOTION_GLSL and passes plate coordinates to the fragment shader. */
export const BOX_GROUND_GLSL = `
uniform sampler2D uState; uniform mat3 uTilt; uniform float uOpening;
attribute float aPart;
varying float vGlow;
varying vec2 vKyotoPlate;
varying vec3 vKyotoWorld, vKyotoNormal, vKyotoTanX, vKyotoTanZ;
${GROUND_GLSL}
void kyotoGround(vec3 aPos, vec3 aNormal, out vec3 outPos, out vec3 outNormal){
  vec3 p=vec3(aPos.x,groundY(aPos.xz),aPos.z);
  if(aPart<.5){p.y+=uOpening*360.; p.z-=uOpening*650.;}
  vec3 centre=vec3(0.,-48.,0.); p=uTilt*(p-centre)+centre;
  outPos=p; outNormal=uTilt*aNormal; vGlow=0.;
  vKyotoPlate=aPos.xz; vKyotoWorld=p; vKyotoNormal=outNormal;
  vKyotoTanX=uTilt*vec3(1.,0.,0.); vKyotoTanZ=uTilt*vec3(0.,0.,1.);
}`;

/** Lid top shadow-depth vertex deformation so building shadows meet hills at their raised height. */
export const BOX_GROUND_DEPTH_GLSL = `
uniform sampler2D uState; uniform mat3 uTilt; uniform float uOpening;
attribute float aPart;
${GROUND_GLSL}
void kyotoGround(vec3 aPos, vec3 aNormal, out vec3 outPos, out vec3 outNormal){
  vec3 p=vec3(aPos.x,groundY(aPos.xz),aPos.z);
  if(aPart<.5){p.y+=uOpening*360.; p.z-=uOpening*650.;}
  vec3 centre=vec3(0.,-48.,0.); p=uTilt*(p-centre)+centre;
  outPos=p; outNormal=uTilt*aNormal;
}`;

const MAKIE_COMMON_GLSL = `
uniform vec3 uView, uKey, uLamp;
uniform float uTime, uNight, uPresence, uPx, uOpening;
uniform vec3 uTrails[20];
uniform sampler2D uSoft0, uIdent0;
const vec2 M_HALF=vec2(360.,230.);
const vec3 M_GOLD=vec3(1.,.70,.26), M_PALE=vec3(.98,.84,.48), M_SILVER=vec3(.84,.85,.83), M_LACQ=vec3(.020,.015,.013), M_AMBER=vec3(1.,.86,.58), M_OXID=vec3(.66,.66,.64);
const float M_SWELL=17., M_AMB=.17, M_KEY=.44, M_POOL=1.75;
const mat2 M_R1=mat2(.940,.342,-.342,.940), M_R2=mat2(.766,-.643,.643,.766), M_R3=mat2(.5,.866,-.866,.5);
vec2 mPuv(vec2 q){return (clamp(q,-M_HALF,M_HALF)+M_HALF)/(2.*M_HALF);}
ivec2 mIdent0(vec2 p){
  ivec2 sz=textureSize(uIdent0,0);
  return ivec2(texelFetch(uIdent0,clamp(ivec2((p+M_HALF)/(2.*M_HALF)*vec2(sz)),ivec2(0),sz-1),0).rg*255.+.5);
}
float mHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec2 mHash2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}
float mVnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mHash(i),mHash(i+vec2(1.,0.)),f.x),mix(mHash(i+vec2(0.,1.)),mHash(i+1.),f.x),f.y);}
vec3 mN, mHk, mHp, mKeyC, mPoolC, mAmbC, mWP; float mAtt, mDk, mDp, mWake=0., mSh=1., mBand=0.;
vec3 mLight(){return M_AMB*mAmbC+(M_KEY*mDk*mKeyC+M_POOL*mAtt*mDp*mPoolC)*mSh;}
vec3 mSpec(float e){return (M_KEY*pow(max(dot(mN,mHk),0.),e)*mKeyC+M_POOL*mAtt*pow(max(dot(mN,mHp),0.),e)*mPoolC)*mSh;}
vec3 mRoom(float rough){
  vec3 r=reflect(-uView,mN);
  float up=smoothstep(-.35,1.,r.y),win=smoothstep(mix(.74,.15,rough),1.,dot(r,uKey));
  return mAmbC*(.04+.30*up*up)+mKeyC*win*mix(1.15,.5,rough);
}
void mSetLight(vec3 n,vec3 worldPos){
  mN=n;mWP=worldPos;
  mKeyC=mix(vec3(1.,.95,.86),vec3(.64,.72,.90),uNight);
  mPoolC=mix(vec3(1.,.93,.80),vec3(.96,.96,1.),uNight);
  mAmbC=mix(vec3(1.,.96,.90),vec3(.50,.60,.84),uNight);
  vec3 toLamp=uLamp-worldPos;float d2=dot(toLamp,toLamp);vec3 lp=toLamp*inversesqrt(max(d2,1.));
  mAtt=(uPresence/(1.+d2/24000.))+mWake*.55;
  mDk=max(dot(n,uKey),0.);mDp=max(dot(n,lp),0.);
  mHk=normalize(uKey+uView);mHp=normalize(lp+uView);
  // Polished lacquer mirrors a soft window: a broad diagonal band whose place follows the reflected ray, so it
  // sweeps across the lid as the box leans toward the hand (the 移光), and rests off-centre when the box is still.
  vec3 r=reflect(-uView,n);
  float s=dot(r.xz-vec2(-.35,-.74),vec2(.62,-.78))*6.5+dot(worldPos.xz,vec2(.0021,.0013))-.35;
  mBand=exp(-s*s*2.2)*mSh;
}
float mFlake(vec2 p,float cell,float size,float dens,float sq,float spread,out vec3 glint){
  float vis=smoothstep(1.3,3.2,cell/max(uPx,.05));
  dens=min(dens,1.);
  float avg=dens*mix(1.95,3.57,sq)*size*size;
  vec3 broad=(M_KEY*pow(max(dot(mN,mHk),0.),12.)*mKeyC+M_POOL*mAtt*pow(max(dot(mN,mHp),0.),12.)*mPoolC)*mSh;
  vec2 g=p/cell,id=floor(g),r=mHash2(id);
  float present=step(mHash(id+7.31),dens);
  float sz=size*mix(1.,.55+.45*mHash(id+11.3),1.-sq*.6);
  vec2 d=fract(g)-(.5+(r-.5)*(1.-2.*sz));
  float a=(mHash(id+3.17)-.5)*mix(6.283,.5,sq),ca=cos(a),sa=sin(a);d=vec2(ca*d.x-sa*d.y,sa*d.x+ca*d.y);
  float ang=atan(d.y,d.x);
  float round_=length(d)*(1.+.26*sin(ang*3.+r.x*6.3)+.16*sin(ang*4.+r.y*9.)+.08*sin(ang*7.+r.x*4.));
  float dist=mix(round_,max(abs(d.x),abs(d.y)*mix(.8,1.25,r.x)),sq),aa=max(uPx,.05)/cell*.75;
  float cov=present*(1.-smoothstep(sz-aa,sz+aa,dist));
  vec3 nf=normalize(mN+vec3(r.x-.5,0.,r.y-.5)*spread);
  vec3 gl=(M_KEY*.45*pow(max(dot(nf,mHk),0.),70.)*mKeyC+M_POOL*mAtt*pow(max(dot(nf,mHp),0.),70.)*mPoolC)*mSh;
  glint=mix(avg*broad*.55,cov*gl*2.6,vis);
  return mix(avg,cov,vis);
}
// Kirikane as a diamond halftone (Hatsune trunks, rocks and banks): tiny gold squares turned 45 degrees on a regular
// lattice. Each piece grows with amount, so the pieces themselves draw light and shadow: large and close on the lit
// faces and the rims, shrinking away into the hollows and the shaded side.
float mKiri(vec2 p,float cell,float amount,out vec3 glint){
  vec2 q=mat2(.7071,-.7071,.7071,.7071)*p/cell,id=floor(q),j=mHash2(id)-.5,f=fract(q)-.5-j*.2;
  float sz=.33*sqrt(clamp(amount,0.,1.))*(.65+.7*mHash(id+5.1));
  float aa=max(uPx,.05)/cell*.75,cov=(1.-smoothstep(sz-aa,sz+aa,max(abs(f.x),abs(f.y))))*step(.02,sz);
  float vis=smoothstep(1.3,3.2,cell/max(uPx,.05));
  vec3 nf=normalize(mN+vec3(j.x,0.,j.y)*.5);
  vec3 gl=(M_KEY*.5*pow(max(dot(nf,mHk),0.),60.)*mKeyC+M_POOL*mAtt*pow(max(dot(nf,mHp),0.),60.)*mPoolC)*mSh;
  glint=cov*gl*2.4*vis;
  return mix(4.*sz*sz,cov,vis);
}
vec3 mCoat(){return vec3(1.,.95,.86)*(mSpec(220.)*.42+mSpec(36.)*.10)+mRoom(0.)*.045+mKeyC*mBand*.075;}
vec3 mNashiji(vec2 p,float dens,vec3 tint){
  // Gold powder sunk at three depths in amber lacquer (Hatsune: 金粉を透漆で塗りこむ). The lacquer absorbs blue
  // first, so the deepest powder reads red-brown and the shallow powder bright orange-gold; the body between grains
  // is the amber glow of powder further down, not black. Photos of the trousseau read honey-gold overall.
  vec3 L=mLight(),ga,gb,gc;
  float a=mFlake(M_R1*p,.62,.47,dens*1.15,0.,.55,ga),b=mFlake(M_R2*p+13.7,1.35,.43,dens*.85,0.,.5,gb),c=mFlake(M_R3*p+41.3,2.4,.36,dens*.30,0.,.4,gc);
  vec3 deep=tint*vec3(.82,.52,.17),mid=tint*vec3(1.,.70,.28),top=tint*vec3(1.,.86,.52);
  vec3 col=tint*vec3(.36,.20,.056)*(.16+.52*L);
  col=mix(col,deep*(.10+.62*L),a*.9);
  col=mix(col,mid*(.10+.84*L),b*.92);
  col=mix(col,top*(.12+1.02*L),c);
  return col+tint*M_AMBER*(ga*.7+gb*1.2+gc*1.5)*(1.+2.2*mBand)+mCoat();
}
vec3 mMetal(vec2 p,vec3 f0,float rise){
  vec3 g;mFlake(p,.5,.4,.9,0.,.35,g);
  vec3 c=f0*f0*(.04+.30*mLight())+f0*mRoom(.7)*.85+mix(f0,vec3(1.),.14)*(mSpec(34.)*.8+mSpec(9.)*.10+g*.5);
  return mix(c*vec3(.80,.60,.36)*.8,c,smoothstep(.12,.85,rise));
}
vec3 mSheet(vec3 f0){return f0*(.05+.18*mLight()+mRoom(.12)*.8)+mix(f0,vec3(1.),.5)*(mSpec(160.)*1.5+mSpec(18.)*.18);}
vec3 mKiriColor(vec3 foil){return mSheet(foil)*.6+foil*(.16+.95*mLight());}
vec4 mFinish(vec3 c,float a){
  c*=1.25;float l=max(dot(c,vec3(.3,.55,.15)),1e-4),t=l/(1.+l*.42);
  c=mix(c*(t/l),vec3(t),smoothstep(.9,2.6,l)*.55);c=min(c,vec3(1.));
  c=mix(c,c*vec3(.92,.96,1.05)+vec3(.003,.005,.009),uNight*.6);
  return vec4(pow(c,vec3(.4545)),a);
}`;

/** Fragment declarations injected into groundMaterial (MeshPhysicalMaterial). */
export const MAKIE_GROUND_PARS_GLSL = `
varying float vGlow; uniform float uGlowBase, uGlowGain;
uniform sampler2D uState, uFine0, uPlaceholder, uOrn0;
varying vec2 vKyotoPlate;
varying vec3 vKyotoWorld, vKyotoNormal, vKyotoTanX, vKyotoTanZ;
${MAKIE_COMMON_GLSL}`;

/** Fragment body replacing outgoingLight right before #include <opaque_fragment> on the lid top. */
export const MAKIE_GROUND_FRAG_GLSL = `
if(uOpening>.999)discard;
vec2 kp=vKyotoPlate;
if(abs(kp.x)>M_HALF.x||abs(kp.y)>M_HALF.y){
  vec2 e=abs(kp)-M_HALF;float out_=max(e.x,e.y);
  mWake=0.;mSh=1.;mSetLight(normalize(vKyotoNormal),vKyotoWorld);
  vec3 bc=out_>7.4?mMetal(kp,M_GOLD*.92,1.):out_>6.4?mMetal(kp,M_GOLD*.6,1.):mNashiji(kp,.9,M_GOLD);
  outgoingLight=mFinish(bc,1.).rgb;
  diffuseColor.a=1.;
}else{
  ivec2 im=mIdent0(kp);int id=im.x,mat=im.y;
  float rise=texelFetch(uState,ivec2(id,0),0).z,glow=texelFetch(uState,ivec2(id,0),0).w;
  vec4 fine=texture(uFine0,mPuv(kp));float hs=texture(uSoft0,mPuv(kp)).r;
  float eS=3.,sH=M_SWELL*mix(.3,1.,rise),cH=2.4,lH=.7,eC=max(uPx*.9,.55);
  vec4 st=vec4(texture(uSoft0,mPuv(kp+vec2(eS,0.))).r,texture(uSoft0,mPuv(kp-vec2(eS,0.))).r,
               texture(uSoft0,mPuv(kp+vec2(0.,eS))).r,texture(uSoft0,mPuv(kp-vec2(0.,eS))).r);
  vec2 gs=vec2(st.x-st.y,st.z-st.w)/(2.*eS)*sH;
  vec4 fx1=texture(uFine0,mPuv(kp+vec2(eC,0.))),fx0=texture(uFine0,mPuv(kp-vec2(eC,0.))),
       fz1=texture(uFine0,mPuv(kp+vec2(0.,eC))),fz0=texture(uFine0,mPuv(kp-vec2(0.,eC)));
  vec2 grad=gs+vec2((fx1.g-fx0.g)*cH+(fx1.b-fx0.b)*lH,(fz1.g-fz0.g)*cH+(fz1.b-fz0.b)*lH)/(2.*eC)*mix(.55,1.,rise);
  grad*=min(1.,2.4/max(length(grad),1e-4));
  mWake=0.;float ring=0.;
  for(int i=0;i<20;i++){
    vec2 d=vKyotoWorld.xz-uTrails[i].xy;float dd=dot(d,d),tw=uTrails[i].z;
    mWake=max(mWake,exp(-dd/900.)*tw);
    float l=sqrt(dd);ring+=tw*exp(-l/46.)*sin(l*.55-(1.-tw)*26.);
  }
  float sh=1.;
  #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    if(receiveShadow){
      sh=getShadow(directionalShadowMap[0],directionalLightShadows[0].shadowMapSize,directionalLightShadows[0].shadowIntensity,directionalLightShadows[0].shadowBias,directionalLightShadows[0].shadowRadius,vDirectionalShadowCoord[0]);
    }
  #endif
  mSh=mix(1.,sh,.86);
  mSetLight(normalize(normalize(vKyotoNormal)-grad.x*vKyotoTanX-grad.y*vKyotoTanZ),vKyotoWorld);
  float line=fine.b;vec3 L=mLight();
  float w=smoothstep(.02,.34,hs);
  float dens=.82+.22*mVnoise(kp*.02),kAmt=0.,wN=0.,wM=0.,wS=0.,bigD=0.,bigCell=6.6,bigSq=0.;
  vec3 tint=M_GOLD,f0=M_GOLD,c=vec3(0.);
  if(mat==1)wN=1.;
  else if(mat==2||mat==3){
    float cloud=mat==3?mVnoise(kp*.045)*.6+mVnoise(kp*.13)*.3:.55;
    // Land in the Hatsune lids is pale smooth gold; powder gathers thick at the foot and thins toward the crown.
    wM=smoothstep(.06,.62,hs)*(.30+.25*cloud);wN=1.-wM;dens=mix(dens,1.25,smoothstep(.02,.3,hs)*(1.-wM));
    kAmt=smoothstep(.01,.09,hs)*.85;
    f0=mix(M_GOLD,M_PALE,.55);tint=mix(M_GOLD,M_PALE,.35*w);rise=max(rise,.75);c=M_PALE*line*(.14+.6*L)*w;
  }
  else if(mat==4){wN=1.;dens=mix(dens,1.05,w);bigD=.22*w;bigCell=4.;kAmt=smoothstep(.01,.09,hs)*.85;c=M_PALE*line*(.12+.5*L)*w;}
  else if(mat==5){wM=1.;c=M_PALE*line*(.12+.6*L)*mix(.5,1.,rise);}
  else if(mat==6){wM=1.;f0=M_SILVER;}
  else if(mat==7){wM=1.;f0=M_GOLD*.9;rise=max(rise,.6);bigD=.4;bigCell=7.;bigSq=1.;c=M_PALE*line*(.22+.6*L);}
  else if(mat==8){wM=1.;f0=mix(M_SILVER,M_GOLD,.25)*.9;rise=max(rise,.6);bigD=.4;bigCell=7.;bigSq=1.;c=M_SILVER*line*(.22+.6*L);}
  else if(mat==9||mat==12){wN=1.;}
  else if(mat==10){wS=1.;f0=M_PALE;c=M_PALE*glow*.5;}
  else if(mat==11){wS=1.;f0=M_SILVER;}
  else if(mat==13){wS=.82;wM=.18;f0=M_GOLD;tint=M_GOLD;}
  else if(mat==14)c=M_LACQ*(.8+1.4*L)+mCoat()*2.2+M_GOLD*line*(.16+.80*L)*mix(.5,1.,rise);
  else c=mix(vec3(.10,.06,.025)*(.4+.5*L),vec3(1.,.62,.22)*1.15,glow)+M_LACQ;
  c+=wN*mNashiji(kp,dens,tint)+wM*mMetal(kp,f0,rise)+wS*mSheet(f0);
  vec3 bigG;float bigX=mFlake(M_R2*kp,bigCell,mix(.47,.30,bigSq),bigD,bigSq,.26,bigG);
  if(mat==7||mat==8){
    vec3 foil=mat==7?M_PALE:M_SILVER;
    c=mix(c,mSheet(foil)+foil*(.10+.25*L)+foil*glow*(.45+.45*sin(kp.x*.31+kp.y*.17-uTime*9.)),bigX)+foil*bigG*.6;
  }else c=mix(c,tint*vec3(1.,.80,.44)*(.07+.74*L),bigX*.92)+tint*M_AMBER*bigG;
  if(kAmt>0.){
    // Halftone kirikane on banks: light-facing slopes and the rim of the bank get the big pieces.
    // Which way the bank faces the light, from the soft relief's slope: the lit face gets big pieces, the far face
    // is left darker with only specks, so the pieces carry the bank's depth.
    float slope=smoothstep(.02,.25,length(gs)),face=-dot(gs/max(length(gs),1e-4),normalize(uKey.xz))*slope;
    float rim=smoothstep(.0,.04,hs)*(1.-smoothstep(.1,.7,hs));
    // Silver carries the shade: the Hatsune rocks and sandbars are gold where lit and grey silver on the far face.
    c=mix(c*(1.-.14*kAmt),mMetal(kp,M_OXID,1.)*.82,clamp(kAmt*max(-face,0.)*1.1,0.,.75));
    vec3 kg;float kv=mKiri(kp,4.6,kAmt*clamp(.08+.8*rim+.6*max(face,0.)-.2*max(-face,0.),0.,1.),kg);
    c=mix(c,mKiriColor(mix(M_GOLD,M_PALE,.75))*1.15,kv)+M_PALE*kg;
  }
  if(mat==9){
    vec2 r=mHash2(floor(kp/2.3));
    float t=dot(normalize(mN+vec3(r.x-.5,0.,r.y-.5)*.5),mHp)*2.4+r.x*1.7+mAtt*.6;
    vec3 film=mix(vec3(.16,.50,.50),vec3(.26,.40,.70),.5+.5*sin(t*3.1));
    film=mix(film,vec3(.80,.56,.64),smoothstep(.55,1.,.5+.5*sin(t*2.3+2.))*.45);
    c=mix(c,film*(.16+.60*L)+vec3(.9,1.,1.)*mSpec(120.)*.9,clamp((fine.g-.2)/max(fwidth(fine.g)*1.5,.004)+.5,0.,1.));
  }
  if(mat==12){
    // Ryusui: tight, swirling, roughly parallel gold lines over gold (the Hatsune trousseau's streams), not a grey band.
    float m=clamp((fine.g-.035)/max(fwidth(fine.g)*1.5,.004)+.5,0.,1.);
    vec2 q=kp+vec2(mVnoise(kp*.035),mVnoise(kp*.035+7.3))*14.;
    float ph=(q.y+sin(q.x*.085+q.y*.02)*5.5+sin(q.x*.23+q.y*.05)*1.6)/3.4-uTime*.05;
    float fw=fwidth(ph),d=abs(fract(ph)-.5)*2.;
    float ln=mix(1.-smoothstep(.26-fw,.26+fw,d),.26,smoothstep(.22,.55,fw));
    float flow=.55+.45*sin(kp.y*.20-uTime*1.5+kp.x*.06);
    vec3 base=mMetal(kp,M_GOLD*.74,.9)*.82+tint*vec3(.36,.17,.045)*(.10+.30*L);
    vec3 crest=mSheet(M_PALE)*.45+mix(M_PALE,M_GOLD,.3)*(.10+.62*L)*(.8+.2*flow)+M_PALE*mBand*.12;
    vec3 wtr=mix(base,crest,ln)+M_SILVER*line*(.08+.36*L)*(.5+.5*flow)+M_SILVER*max(ring,0.)*.5*(.2+L)+mCoat()*.6;
    // A silver shore just inside the water's edge (the Hatsune sandbars and banks are grey silver).
    float e=.25*(texture(uFine0,mPuv(kp+vec2(7.,0.))).g+texture(uFine0,mPuv(kp-vec2(7.,0.))).g+texture(uFine0,mPuv(kp+vec2(0.,7.))).g+texture(uFine0,mPuv(kp-vec2(0.,7.))).g);
    float shore=1.-smoothstep(.5,.95,e/max(fine.g,.01));
    wtr=mix(wtr*vec3(1.,.93,.80),mMetal(kp,M_OXID,1.)*.85+M_SILVER*line*(.1+.3*L),shore*.7);
    c=mix(c,wtr,m);
  }
  vec4 orn=texture(uOrn0,mPuv(kp));
  c=mix(c,mMetal(kp,mix(M_OXID,M_GOLD,.45),1.)*.9,orn.b*.62);
  c=mix(c,.5*mNashiji(kp,1.6,mix(M_GOLD,M_PALE,.5))+.5*mMetal(kp,M_PALE*.95,1.),clamp(orn.a*1.6,0.,1.)*.85);
  c=mix(c,mKiriColor(M_PALE)*1.1,clamp(orn.r*1.6,0.,1.));
  c=mix(c,mKiriColor(M_OXID)*1.05,clamp(orn.g*1.6,0.,1.));
  vec4 ph=texture(uPlaceholder,mPuv(kp));
  if(ph.a>.001)c=mix(c,ph.rgb*(.45+1.05*L),ph.a);
  outgoingLight=mFinish(c,1.).rgb;
  diffuseColor.a=1.;
}`;

/** Box sides (box id 20): the lid's nashiji continues down the walls, with a low gold bank and a faint mist band, as
 * on the Hatsune stationery box and document box whose landscapes run onto the sides. uv = (perimeter run, world y). */
export const BOX_SIDE_VERT_GLSL = `varying vec2 vKyotoSide; varying vec3 vKyotoSideW, vKyotoSideN;`;
export const BOX_SIDE_PARS_GLSL = `
varying vec2 vKyotoSide; varying vec3 vKyotoSideW, vKyotoSideN;
${MAKIE_COMMON_GLSL}`;
export const BOX_SIDE_FRAG_GLSL = `
{
  vec2 sp=vKyotoSide;
  mWake=0.;mSh=1.;mSetLight(normalize(vKyotoSideN),vKyotoSideW);
  float body=step(sp.y,-35.);
  float bank=sp.y-(-92.+20.*mVnoise(vec2(sp.x*.011,1.3))+9.*mVnoise(vec2(sp.x*.043,4.1)));
  float land=(1.-smoothstep(-1.5,1.5,bank))*body;
  float mist=smoothstep(.56,.64,mVnoise(vec2(sp.x*.0075,(sp.y+(1.-body)*40.)*.05+2.)))*(1.-land);
  vec3 c=mNashiji(sp,.95,M_GOLD);
  c=mix(c,mMetal(sp,mix(M_GOLD,M_PALE,.5),1.)*.85+mNashiji(sp,1.3,M_PALE)*.2,land*.55);
  c=mix(c,.5*mMetal(sp,M_PALE*.95,1.)+.25*mSheet(M_PALE)+.3*mNashiji(sp,1.6,M_PALE),mist*.45);
  c+=M_PALE*(1.-smoothstep(0.,.9,abs(bank)))*body*(.06+.3*mLight());
  vec3 kg;float kv=mKiri(sp,4.2,land*(.05+.75*(1.-smoothstep(0.,14.,-bank))),kg);
  c=mix(c*(1.-.18*land),mKiriColor(mix(M_GOLD,M_PALE,.6)),kv)+M_PALE*kg;
  // Walls face the room, not the window: keep them a warmer, slightly deeper amber than the lid.
  outgoingLight=mFinish(c*vec3(1.,.86,.62)*.9,1.).rgb;
}`;

/** Vertex shader for KIND.mist (suyari-gasumi) bands floating above the hills. */
export const MAKIE_MIST_VERT_GLSL = `
uniform sampler2D uState; uniform mat3 uTilt; uniform float uOpening;
attribute vec4 aOwner;
varying vec3 vKyotoWorld, vKyotoNormal;
varying vec2 vKyotoUv, vKyotoMeta;
varying float vPartId;
${GROUND_GLSL}
void main(){
  int id=int(aOwner.x+.5);vec4 B=texelFetch(uState,ivec2(id,1),0);
  vec2 q=position.xz+B.xy;
  float gy=groundY(q);
  vec3 p=vec3(q.x,gy+B.z+.35,q.y);
  p.y+=uOpening*360.;p.z-=uOpening*650.;
  vec3 centre=vec3(0.,-48.,0.);p=uTilt*(p-centre)+centre;
  vKyotoWorld=p;vKyotoNormal=uTilt*vec3(0.,1.,0.);
  vKyotoUv=position.xz;vKyotoMeta=q;vPartId=aOwner.x;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;

/** Fragment shader for KIND.mist: semi-transparent gold foil drifting over the plate, clipped inside the lid lip. */
export const MAKIE_MIST_FRAG_GLSL = `
uniform sampler2D uState, uMistFine, uMistIdent;
varying vec3 vKyotoWorld, vKyotoNormal;
varying vec2 vKyotoUv, vKyotoMeta;
varying float vPartId;
out vec4 fragColor;
${MAKIE_COMMON_GLSL}
void main(){
  if(uOpening>.999)discard;
  ivec2 sz=textureSize(uMistIdent,0);
  int id=int(texelFetch(uMistIdent,clamp(ivec2((vKyotoUv+M_HALF)/(2.*M_HALF)*vec2(sz)),ivec2(0),sz-1),0).r*255.+.5);
  if(id==0||id!=int(vPartId+.5))discard;
  vec4 fine=texture(uMistFine,mPuv(vKyotoUv));
  float alpha=clamp((fine.a-.5)/max(fwidth(fine.a),.006)+.5,0.,1.)*.82;
  vec2 lip=1.-smoothstep(M_HALF-5.,M_HALF-1.,abs(vKyotoMeta));
  alpha*=lip.x*lip.y;
  if(alpha<.01)discard;
  float rise=texelFetch(uState,ivec2(id,0),0).z;
  mWake=0.;mSh=1.;mSetLight(normalize(vKyotoNormal),vKyotoWorld);
  // Suyari-gasumi in the Hatsune lids is dense, bright gold (濃梨子地 into flat gold), clearly richer than the ground.
  vec3 c=.5*mNashiji(vKyotoUv,1.6,mix(M_GOLD,M_PALE,.5))+.5*mMetal(vKyotoUv,M_PALE*.95,1.)+.25*mSheet(M_PALE);
  fragColor=mFinish(c,alpha);
}`;
