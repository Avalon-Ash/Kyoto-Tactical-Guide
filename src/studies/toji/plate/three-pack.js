// Pure data for the three.js plate renderer (three-renderer.js): material table, box and mesh packing, motion state
// packing and the GLSL that moves a part. Nothing here imports three, so node:test can check it.
import {MAT} from './vocab.js';
import {MAX_PARTS} from './parts.js';
import {packMeshes} from './mesh-geometry.js';

/**
 * MAT → MeshPhysicalMaterial parameters (docs/MAKIE_THREE_PLAN.md §3). First pass: T3 tunes the numbers against .shots/refs.
 * flake: strength of the procedural gold-powder normal map (0 = none). paint: the flat colour used by the ground texture
 * for parts that are not yet three meshes (T1/T2 replace that). glow: emissive follows the part's glow state.
 */
export const MATERIALS = {
  [MAT.ground]: {name: 'ground', color: '#1a120d', paint: '#16100c', metalness: .25, roughness: .42, clearcoat: 1, clearcoatRoughness: .08, flake: .25},
  [MAT.nashijiLight]: {name: 'nashijiLight', color: '#b88a3c', paint: '#a8823a', metalness: .85, roughness: .5, clearcoat: .6, clearcoatRoughness: .1, flake: .5},
  [MAT.mura]: {name: 'mura', color: '#9c7430', paint: '#6e5222', metalness: .8, roughness: .55, clearcoat: .6, clearcoatRoughness: .1, flake: .45},
  [MAT.gyobu]: {name: 'gyobu', color: '#c29a46', paint: '#8a6a2c', metalness: .85, roughness: .45, clearcoat: .5, clearcoatRoughness: .1, flake: .7},
  [MAT.gold]: {name: 'gold', color: '#e0b04a', paint: '#d6a640', metalness: 1, roughness: .32, clearcoat: .3, clearcoatRoughness: .1, flake: .35},
  [MAT.silver]: {name: 'silver', color: '#d4d6d2', paint: '#cfd0cc', metalness: 1, roughness: .28, clearcoat: 0, clearcoatRoughness: 0, flake: .3},
  [MAT.kirikane]: {name: 'kirikane', color: '#f0c25a', paint: '#e0b650', metalness: 1, roughness: .22, clearcoat: 0, clearcoatRoughness: 0, flake: 0},
  [MAT.kirigin]: {name: 'kirigin', color: '#d0d3cf', paint: '#bfc0b8', metalness: 1, roughness: .22, clearcoat: 0, clearcoatRoughness: 0, flake: 0},
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
  20: {name: 'side', color: '#2b1d0b', metalness: .65, roughness: .38, clearcoat: 1, clearcoatRoughness: .05, flake: .5},
  21: {name: 'silverRim', color: '#d4d6d2', metalness: 1, roughness: .26, clearcoat: 0, clearcoatRoughness: 0, flake: .2},
  22: {name: 'inner', color: '#8c6a2d', metalness: .8, roughness: .5, clearcoat: .5, clearcoatRoughness: .1, flake: .5},
  23: {name: 'paper', color: '#cdbd98', metalness: 0, roughness: .9, clearcoat: 0, clearcoatRoughness: 0, flake: 0},
  24: {name: 'gold', color: '#d7a64a', metalness: 1, roughness: .3, clearcoat: .2, clearcoatRoughness: .1, flake: .3},
  26: {name: 'edge', color: '#c99a42', metalness: 1, roughness: .3, clearcoat: .2, clearcoatRoughness: .1, flake: .3},
  27: {name: 'cord', color: '#85100a', metalness: 0, roughness: .6, clearcoat: 0, clearcoatRoughness: 0, flake: 0},
  28: {name: 'tray', color: '#9a7634', metalness: .8, roughness: .5, clearcoat: .5, clearcoatRoughness: .1, flake: .5},
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

/**
 * The hinge of mesh-shaders.js, written as a function so MeshPhysicalMaterial and MeshDepthMaterial run the same code:
 * stand up about the foot line, sway about the anchor, travel, lift, open with the lid, tilt with the hand.
 * Per-part state comes from uState (row 0 = a, row 1 = b, one texel per part index).
 */
export const PART_MOTION_GLSL = `
uniform sampler2D uState; uniform mat3 uTilt; uniform float uOpening;
attribute vec4 aOwner; attribute vec4 aStyle;
varying float vGlow;
${DOME_GLSL}
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
