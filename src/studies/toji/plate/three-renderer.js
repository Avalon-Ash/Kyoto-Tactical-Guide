// The makie plate drawn with three.js (docs/MAKIE_THREE_PLAN.md). Same interface as plate/renderer.js:
// {setWard, draw, poke, active, dispose}. Opt in with ?three=1 (see ../renderer.js); the old pipeline stays the default.
//
// T0–T2 scope: box and lid, layer 0 ground relief (groundY from baked soft/ident maps) and makie ground/water shaders,
// floating semi-transparent mist (KIND.mist), every part that is already a mesh (p1–p3 buildings, torii, stage, lanterns),
// trees (T2: half-tube limbs with procedural bark + instanced foliage stamps with 2D array texture & alphaTest),
// their motion (createLife → DataTexture → onBeforeCompile hinge), and a DirectionalLight shadow map.
// Organic non-tree layer > 0 parts (T4: rocks, fox, phoenix, bird, sandCone, moonBowl) still use a transparent
// placeholder overlay on the lid until T4 replaces them with real three geometry.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {PLATE, MAT, KIND, rand} from './vocab.js';
import {PLATES, LAYERS, preparePlate, createLife, partAt} from './parts.js';
import {paintLayer, identMaps} from './bake.js';
import {blankStats} from './fillers.js';
import {buildBox, FITTINGS} from './renderer.js';
import {bakeStamps} from './stamps.js';
import {createCord, cordTube} from './cord.js';
import {stepSpring} from './spring.js';
import {groundPoint, normalize, trailIntensity} from '../geometry.js';
import {
  MATERIALS, BOX_MATERIALS, GROUND_LID, STATE_WIDTH, STATE_HEIGHT, packLifeState,
  meshesByMaterial, limbsByMaterial, stampsByMaterial, sliceBox,
  bakeSoftLayer, mistGeometryData, PART_MOTION_GLSL, PART_LIGHT_GLSL, BOX_MOTION_GLSL, BOX_GROUND_GLSL, BOX_GROUND_DEPTH_GLSL,
  TREE_LIMB_MOTION_GLSL, TREE_STAMP_MOTION_GLSL,
  MAKIE_GROUND_PARS_GLSL, MAKIE_GROUND_FRAG_GLSL, MAKIE_MIST_VERT_GLSL, MAKIE_MIST_FRAG_GLSL,
  BOX_SIDE_VERT_GLSL, BOX_SIDE_PARS_GLSL, BOX_SIDE_FRAG_GLSL,
} from './three-pack.js';

const EYE = [430, 720, 920], TARGET = [0, 40, 0];
const VIEW = normalize(EYE.map((v, i) => v - TARGET[i])), KEY = normalize([-.5, .78, .22]);
const STRIDE = 10;

/** Procedural gold-powder normal map: random small tilted flakes on a flat tangent-space field. No external image. */
export function bakeFlakeNormal(doc, size = 256) {
  const canvas = doc.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d'), r = rand(7);
  ctx.fillStyle = 'rgb(128,128,255)'; ctx.fillRect(0, 0, size, size);
  // Nashiji powder is fine and dense (Hatsune trousseau close-ups): many small flat flakes, gentle tilt.
  for (let i = 0; i < 5200; i++) {
    const x = r() * size, y = r() * size, rad = .9 + r() * 1.6, a = r() * 6.283, sides = 4 + Math.floor(r() * 2);
    ctx.fillStyle = `rgb(${Math.round(128 + (r() - .5) * 80)},${Math.round(128 + (r() - .5) * 80)},240)`;
    ctx.beginPath();
    for (let k = 0; k < sides; k++) { const t = a + k / sides * 6.283, s = rad * (.7 + r() * .5); ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(t) * s, y + Math.sin(t) * s); }
    ctx.closePath(); ctx.fill();
    // Wrap the flakes that cross an edge so the map tiles.
    for (const [ox, oy] of [[size, 0], [-size, 0], [0, size], [0, -size]]) if (x < rad * 2 || y < rad * 2 || x > size - rad * 2 || y > size - rad * 2) {
      ctx.save(); ctx.translate(ox, oy); ctx.beginPath();
      for (let k = 0; k < sides; k++) { const t = a + k / sides * 6.283; ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(t) * rad, y + Math.sin(t) * rad); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1 / 16, 1 / 16);
  return texture;
}

/** Procedural 8-layer stamp atlas (R = thin relief, G = coverage, B = incised veins/needles) uploaded as a DataArrayTexture. */
function bakeStampTexture(doc, maxAniso) {
  const {size, layers} = bakeStamps(doc);
  const data = new Uint8Array(size * size * 4 * layers.length);
  layers.forEach((pixels, i) => data.set(pixels, i * size * size * 4));
  const texture = new THREE.DataArrayTexture(data, size, size, layers.length);
  texture.format = THREE.RGBAFormat; texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true; texture.anisotropy = maxAniso;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Transparent overlay for parts above layer 0 that are not three meshes yet (T4 rocks, fox, phoenix, bird,
 * sandCone, moonBowl). Layer 0, KIND.mist, and T2 trees now use real shaders/meshes.
 */
export function paintPlaceholder(doc, parts, w, h) {
  const canvas = doc.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.setTransform(w / (PLATE.halfW * 2), 0, 0, h / (PLATE.halfH * 2), w / 2, h / 2);
  const trace = (d, close) => { ctx.beginPath(); ctx.moveTo(d[0][0], d[0][1]); for (let i = 1; i < d.length; i++) ctx.lineTo(d[i][0], d[i][1]); if (close) ctx.closePath(); };
  const paint = mat => MATERIALS[mat]?.paint ?? '#8a6a2c';
  ctx.lineCap = ctx.lineJoin = 'round';
  for (const p of parts.filter(q => !q.mesh && !q.limbs && !q.stamps && q.layer > 0 && q.kind !== KIND.mist).sort((a, b) => a.layer - b.layer)) {
    ctx.globalAlpha = .95;
    ctx.fillStyle = paint(p.mat);
    for (const f of p.fills) { trace(f.d, true); ctx.fill(); }
    ctx.globalAlpha = .85; ctx.strokeStyle = '#f0d48c';
    for (const l of p.lines) { ctx.lineWidth = Math.max(.6, l.w); trace(l.d, false); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
  return canvas;
}

/**
 * @param {WebGL2RenderingContext} gl the page's context, shared with the old pipeline
 * @param {HTMLCanvasElement} canvas
 */
export function createThreeRenderer(gl, canvas) {
  const doc = canvas.ownerDocument;
  const renderer = new THREE.WebGLRenderer({canvas, context: gl, antialias: true, alpha: true});
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const disposables = [];
  const own = object => { disposables.push(object); return object; };

  const scene = new THREE.Scene();
  try {
    const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(), env = pmrem.fromScene(room, .04);
    scene.environment = env.texture; own(env); pmrem.dispose(); room.dispose?.();
  } catch (error) { console.warn('Environment map unavailable:', error); }

  // The camera is the page's: view and projection come in as one matrix and are split into three's two.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2200);
  camera.position.set(...EYE); camera.up.set(0, 1, 0); camera.lookAt(...TARGET); camera.updateMatrixWorld(true);
  const pageMatrix = new THREE.Matrix4();

  const ambient = new THREE.AmbientLight('#ffffff', .5);
  const key = new THREE.DirectionalLight('#ffffff', 3);
  key.position.set(KEY[0] * 700, KEY[1] * 700, KEY[2] * 700);
  const shadowSize = canvas.clientWidth < 700 ? 1024 : 2048;
  Object.assign(key.shadow.camera, {left: -480, right: 480, top: 420, bottom: -420, near: 50, far: 1500});
  key.castShadow = true; key.shadow.mapSize.set(shadowSize, shadowSize); key.shadow.bias = -.0006; key.shadow.normalBias = 1.2;
  key.shadow.camera.updateProjectionMatrix();
  const lamp = new THREE.PointLight('#ffe2b0', 0, 0, 2);
  scene.add(ambient, key, key.target, lamp);

  // Per-part motion, written every frame: row 0 = (sway, stand, rise, glow), row 1 = (dx, dz, lift, group).
  const stateData = new Float32Array(STATE_WIDTH * STATE_HEIGHT * 4);
  const stateTexture = own(new THREE.DataTexture(stateData, STATE_WIDTH, STATE_HEIGHT, THREE.RGBAFormat, THREE.FloatType));
  stateTexture.minFilter = stateTexture.magFilter = THREE.NearestFilter; stateTexture.needsUpdate = true;
  const dummyRgba = own(new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType)); dummyRgba.needsUpdate = true;
  const dummyRg = own(new THREE.DataTexture(new Uint8Array([0, 0]), 1, 1, THREE.RGFormat, THREE.UnsignedByteType)); dummyRg.unpackAlignment = 1; dummyRg.needsUpdate = true;
  const dummySoft = own(new THREE.DataTexture(new Uint16Array([0]), 1, 1, THREE.RedFormat, THREE.HalfFloatType)); dummySoft.unpackAlignment = 1; dummySoft.needsUpdate = true;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const stampTex = own(bakeStampTexture(doc, maxAniso));
  const trails = Array.from({length: 20}, () => new THREE.Vector3());
  const shared = {
    uState: {value: stateTexture}, uTilt: {value: new THREE.Matrix3()}, uOpening: {value: 0},
    uSoft0: {value: dummySoft}, uIdent0: {value: dummyRg}, uFine0: {value: dummyRgba}, uPlaceholder: {value: dummyRgba},
    uMistFine: {value: dummyRgba}, uMistIdent: {value: dummyRg}, uStamps: {value: stampTex},
    uView: {value: new THREE.Vector3(...VIEW)}, uKey: {value: new THREE.Vector3(...KEY)}, uLamp: {value: new THREE.Vector3(0, 70, 0)},
    uTime: {value: 0}, uNight: {value: 1}, uPresence: {value: 0}, uPx: {value: 1}, uTrails: {value: trails},
  };

  const flake = own(bakeFlakeNormal(doc));
  const NORMAL_FIX = THREE.ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0');
  const bindGlow = (shader, spec) => {
    Object.assign(shader.uniforms, shared);
    shader.uniforms.uGlowBase = {value: spec.glow ? .3 : 1};
    shader.uniforms.uGlowGain = {value: spec.glow ? 1.8 : 0};
  };
  /** Faces are lit by their own normals whichever way they wind, as the old pipeline did. */
  const patchMaterial = (material, spec, glsl, call) => {
    const isPart = call === 'kyotoMotion';
    material.customProgramCacheKey = () => `kyoto-${call}-${spec.glow ? 1 : 0}${isPart ? '-l2w' : ''}`;
    material.onBeforeCompile = shader => {
      bindGlow(shader, spec);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${glsl}`)
        .replace('#include <beginnormal_vertex>', `vec3 kyotoP; vec3 objectNormal; ${call}(position, normal, kyotoP, objectNormal);`)
        .replace('#include <begin_vertex>', 'vec3 transformed = kyotoP;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying float vGlow; uniform float uGlowBase, uGlowGain;${isPart ? `\n${PART_LIGHT_GLSL}` : ''}`)
        .replace('#include <normal_fragment_begin>', NORMAL_FIX)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= uGlowBase + vGlow * uGlowGain;');
      if (isPart) {
        shader.fragmentShader = shader.fragmentShader.replace('#include <aomap_fragment>', `#include <aomap_fragment>
{
  // L1: contact darkness, strongest at the foot, gone by K_CONTACT_H plate units up.
  float kyotoContact=mix(K_CONTACT_MIN,1.,smoothstep(0.,K_CONTACT_H,vLift));
  reflectedLight.indirectDiffuse*=kyotoContact;
  reflectedLight.indirectSpecular*=kyotoContact;
  reflectedLight.directDiffuse*=mix(1.,kyotoContact,.5);
  // L2: the gold ground below lights faces that turn away from the sky (the plate's up follows the box's tilt).
  vec3 kyotoUp=normalize(uTilt*vec3(0.,1.,0.));
  vec3 kyotoNW=inverseTransformDirection(normal,viewMatrix);
  float kyotoDown=.5-.5*dot(kyotoNW,kyotoUp); // hemisphere: walls see half the ground, eaves all of it
  vec3 kyotoBounce=K_BOUNCE_C*K_BOUNCE*kyotoDown*mix(1.,.45,uNight)*kyotoContact;
  reflectedLight.indirectDiffuse+=material.diffuseContribution*kyotoBounce;
  reflectedLight.indirectSpecular+=material.specularColorBlended*kyotoBounce;
  // Soft window reflection in the key-light direction for upward-facing metallic faces (e.g. gold roofs).
  vec3 kyotoR=reflect(-normalize(uView),kyotoNW);
  float kyotoWin=smoothstep(1.-K_WIN_SOFT,1.,dot(kyotoR,normalize(uKey)));
  kyotoWin*=1.-smoothstep(.3,.8,material.roughness);
  reflectedLight.directSpecular+=material.specularColorBlended*kyotoWin*K_WIN*mix(1.,.35,uNight)*kyotoContact;
}`);
      }
    };
    return material;
  };
  const patchLimbMaterial = (material, spec) => {
    material.customProgramCacheKey = () => `kyoto-limb-${spec.glow ? 1 : 0}`;
    material.onBeforeCompile = shader => {
      bindGlow(shader, spec);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${TREE_LIMB_MOTION_GLSL}\nvarying vec2 vTreeUv;\nvarying float vBark;\nvarying vec3 vTreeTanX, vTreeTanZ;`)
        .replace('#include <beginnormal_vertex>', 'vec3 kyotoP, objectNormal, kyotoTx, kyotoTz; kyotoLimb(position, normal, kyotoP, objectNormal, kyotoTx, kyotoTz);')
        .replace('#include <begin_vertex>', 'vec3 transformed = kyotoP; vTreeUv = uv; vBark = aStyle.z; vTreeTanX = normalize(normalMatrix * kyotoTx); vTreeTanZ = normalize(normalMatrix * kyotoTz);');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vGlow;\nvarying vec2 vTreeUv;\nvarying float vBark;\nvarying vec3 vTreeTanX, vTreeTanZ;\nuniform float uGlowBase, uGlowGain;')
        .replace('#include <color_fragment>', `#include <color_fragment>
float kyotoGrain = sin(vTreeUv.x * 2.5 + .5 * sin(vTreeUv.y * .31));
float kyotoRow = floor(vTreeUv.y / 6.5);
float kyotoCu = fract(vTreeUv.x / 5. + mod(kyotoRow, 2.) * .5) - .5;
float kyotoCv = fract(vTreeUv.y / 6.5) - .5;
float kyotoSeam = abs(length(vec2(kyotoCu * 1.7, kyotoCv)) - .48) * 5.;
float kyotoBark = vBark > .5 ? 1. - smoothstep(.18, .6, kyotoSeam) : smoothstep(.62, .93, kyotoGrain);
diffuseColor.rgb *= 1. - kyotoBark * .45;`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .85, kyotoBark * .5);')
        .replace('#include <normal_fragment_begin>', NORMAL_FIX)
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = normalize(normal - kyotoGrain * .13 * vTreeTanX - cos(vTreeUv.y * .9) * .06 * vTreeTanZ);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= uGlowBase + vGlow * uGlowGain;');
    };
    return material;
  };
  const patchStampMaterial = (material, spec) => {
    material.customProgramCacheKey = () => `kyoto-stamp-${spec.glow ? 1 : 0}`;
    material.onBeforeCompile = shader => {
      bindGlow(shader, spec);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${TREE_STAMP_MOTION_GLSL}\nvarying vec3 vTreeTanX, vTreeTanZ;`)
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_NORMALMAP\nvNormalMapUv = (normalMapTransform * vec3(uv * aStamp.xy, 1.0)).xy;\n#endif')
        .replace('#include <beginnormal_vertex>', 'vec3 kyotoP, objectNormal, kyotoTx, kyotoTz; kyotoStamp(uv, kyotoP, objectNormal, kyotoTx, kyotoTz);')
        .replace('#include <begin_vertex>', 'vec3 transformed = kyotoP; vTreeTanX = normalize(normalMatrix * kyotoTx); vTreeTanZ = normalize(normalMatrix * kyotoTz);');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform highp sampler2DArray uStamps;\nvarying float vGlow;\nvarying vec4 vTree;\nvarying vec2 vTreeScale;\nvarying vec3 vTreeTanX, vTreeTanZ;\nuniform float uGlowBase, uGlowGain;')
        .replace('#include <map_fragment>', `#include <map_fragment>
vec4 kyotoInk = texture(uStamps, vTree.xyz);
diffuseColor.a *= kyotoInk.g;
float kyotoLine = kyotoInk.b / max(kyotoInk.g, 0.01);
diffuseColor.rgb *= 1. - kyotoLine * .42;`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .85, kyotoLine * .5);')
        .replace('#include <normal_fragment_begin>', NORMAL_FIX)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
vec2 kyotoE = 1. / vec2(textureSize(uStamps, 0).xy);
vec2 kyotoGrad = vec2(
  texture(uStamps, vTree.xyz + vec3(kyotoE.x, 0., 0.)).r - texture(uStamps, vTree.xyz - vec3(kyotoE.x, 0., 0.)).r,
  texture(uStamps, vTree.xyz + vec3(0., kyotoE.y, 0.)).r - texture(uStamps, vTree.xyz - vec3(0., kyotoE.y, 0.)).r
) * vTree.w / (2. * kyotoE * vTreeScale);
normal = normalize(normal - kyotoGrad.x * vTreeTanX - kyotoGrad.y * vTreeTanZ);`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= uGlowBase + vGlow * uGlowGain;');
    };
    return material;
  };
  const patchDepth = (key, glsl, beginVertex, fragHook) => {
    const material = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide, ...(fragHook ? {alphaTest: .5} : {})});
    material.customProgramCacheKey = () => `kyoto-depth-${key}`;
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, shared);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${glsl}`)
        .replace('#include <begin_vertex>', beginVertex);
      if (fragHook) fragHook(shader);
    };
    return own(material);
  };
  const partDepth = patchDepth('kyotoMotion', PART_MOTION_GLSL, 'vec3 kyotoP; vec3 kyotoN; kyotoMotion(position, normal, kyotoP, kyotoN); vec3 transformed = kyotoP;');
  const boxDepth = patchDepth('kyotoBox', BOX_MOTION_GLSL, 'vec3 kyotoP; vec3 kyotoN; kyotoBox(position, normal, kyotoP, kyotoN); vec3 transformed = kyotoP;');
  const groundDepth = patchDepth('kyotoGround', BOX_GROUND_DEPTH_GLSL, 'vec3 kyotoP; vec3 kyotoN; kyotoGround(position, normal, kyotoP, kyotoN); vec3 transformed = kyotoP;');
  const limbDepth = patchDepth('kyotoLimb', TREE_LIMB_MOTION_GLSL, 'vec3 kyotoP, kyotoN, kyotoTx, kyotoTz; kyotoLimb(position, normal, kyotoP, kyotoN, kyotoTx, kyotoTz); vec3 transformed = kyotoP;');
  const stampDepth = patchDepth(
    'kyotoStamp',
    TREE_STAMP_MOTION_GLSL,
    'vec3 kyotoP, kyotoN, kyotoTx, kyotoTz; kyotoStamp(uv, kyotoP, kyotoN, kyotoTx, kyotoTz); vec3 transformed = kyotoP;',
    shader => {
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform highp sampler2DArray uStamps;\nvarying vec4 vTree;')
        .replace('#include <map_fragment>', '#include <map_fragment>\nfloat kyotoCover = texture(uStamps, vTree.xyz).g;\ndiffuseColor.a = clamp((kyotoCover - .5) / max(fwidth(kyotoCover), .02) + .5, 0., 1.);');
    },
  );

  const physical = (spec, extra = {}) => {
    const m = new THREE.MeshPhysicalMaterial({
      color: spec.color, metalness: spec.metalness, roughness: spec.roughness, clearcoat: spec.clearcoat, clearcoatRoughness: spec.clearcoatRoughness,
      side: THREE.DoubleSide, shadowSide: THREE.DoubleSide, ...extra,
    });
    if (spec.emissive) { m.emissive.set(spec.emissive); m.emissiveIntensity = 1; }
    if (spec.iridescence) { m.iridescence = spec.iridescence; m.iridescenceIOR = spec.iridescenceIOR; m.iridescenceThicknessRange = [...spec.iridescenceThicknessRange]; }
    if (spec.flake) { m.normalMap = flake; m.normalScale.set(spec.flake, spec.flake); }
    return own(m);
  };
  const mesh = (geometry, material, depth, shadow = true) => {
    const m = new THREE.Mesh(geometry, material);
    m.frustumCulled = false; m.castShadow = shadow; m.receiveShadow = true; if (depth) m.customDepthMaterial = depth;
    return m;
  };
  const buffers = (position, normal, uv, part) => {
    const g = own(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(position, 3)); g.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); if (part) g.setAttribute('aPart', new THREE.BufferAttribute(part, 1));
    return g;
  };

  // The box: lid top (ground relief, water, sand, steps, border), then everything from the lid's edge down to the tray and packets.
  const box = buildBox(), boxGroup = new THREE.Group(); scene.add(boxGroup);
  const groundMaterial = physical(GROUND_LID);
  groundMaterial.customProgramCacheKey = () => 'kyoto-ground';
  groundMaterial.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, shared);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${BOX_GROUND_GLSL}`)
      .replace('#include <beginnormal_vertex>', 'vec3 kyotoP; vec3 objectNormal; kyotoGround(position, normal, kyotoP, objectNormal);')
      .replace('#include <begin_vertex>', 'vec3 transformed = kyotoP;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${MAKIE_GROUND_PARS_GLSL}`)
      .replace('#include <opaque_fragment>', `${MAKIE_GROUND_FRAG_GLSL}\n#include <opaque_fragment>`)
      .replace('#include <tonemapping_fragment>', '')
      .replace('#include <colorspace_fragment>', '');
  };
  const mistMaterial = own(new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: {...shared},
    vertexShader: MAKIE_MIST_VERT_GLSL,
    fragmentShader: MAKIE_MIST_FRAG_GLSL,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  }));
  Object.assign(mistMaterial.uniforms, shared);
  const [lidTop] = [...sliceBox(box.data, 0, box.lidTop).values()];
  boxGroup.add(mesh(buffers(lidTop.position, lidTop.normal, lidTop.uv, lidTop.part), groundMaterial, groundDepth));
  let boxVertices = box.lidTop;
  for (const [id, slice] of sliceBox(box.data, box.lidTop, box.opaque)) {
    const spec = BOX_MATERIALS[id];
    if (!spec) throw new Error(`three renderer: no material for box id ${id}`);
    // The cords are drawn live; the fixed geometry here never carries id 27 (they come from cordTube), but guard anyway.
    const boxMaterial = patchMaterial(physical(spec), spec, BOX_MOTION_GLSL, 'kyotoBox');
    if (spec.nashijiSide) {
      // The walls share the lid's nashiji shader (three-pack BOX_SIDE_*), on top of the box hinge patch.
      const hinge = boxMaterial.onBeforeCompile;
      boxMaterial.customProgramCacheKey = () => 'kyoto-box-side';
      boxMaterial.onBeforeCompile = shader => {
        hinge(shader);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', `#include <common>\n${BOX_SIDE_VERT_GLSL}`)
          .replace('vec3 transformed = kyotoP;', 'vec3 transformed = kyotoP; vKyotoSide = uv; vKyotoSideW = kyotoP; vKyotoSideN = objectNormal;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', `#include <common>\n${BOX_SIDE_PARS_GLSL}`)
          .replace('#include <opaque_fragment>', `${BOX_SIDE_FRAG_GLSL}\n#include <opaque_fragment>`);
      };
    }
    boxGroup.add(mesh(buffers(slice.position, slice.normal, slice.uv, slice.part), boxMaterial, boxDepth));
    boxVertices += slice.position.length / 3;
  }

  // The cords: a few hundred vertices rewritten every frame, already tilted on the CPU (as before).
  const cords = FITTINGS.map(f => ({...f, cord: createCord(f)}));
  for (const c of cords) c.cord.settle();
  const cordMaterial = physical(BOX_MATERIALS[27]);
  let cordMesh = null, cordCount = 0;
  const setCords = strands => {
    const n = strands.length / STRIDE;
    if (!cordMesh || cordCount !== n) {
      if (cordMesh) { scene.remove(cordMesh); cordMesh.geometry.dispose(); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
      cordMesh = mesh(g, cordMaterial, null); scene.add(cordMesh); cordCount = n;
    }
    const pos = cordMesh.geometry.attributes.position, nor = cordMesh.geometry.attributes.normal;
    for (let i = 0; i < n; i++) {
      pos.array[i * 3] = strands[i * STRIDE]; pos.array[i * 3 + 1] = strands[i * STRIDE + 1]; pos.array[i * 3 + 2] = strands[i * STRIDE + 2];
      nor.array[i * 3] = strands[i * STRIDE + 3]; nor.array[i * 3 + 1] = strands[i * STRIDE + 4]; nor.array[i * 3 + 2] = strands[i * STRIDE + 5];
    }
    pos.needsUpdate = nor.needsUpdate = true;
  };

  const materialCache = (patch, extra = {}) => {
    const cache = new Map();
    return mat => {
      if (!cache.has(mat)) {
        const spec = MATERIALS[mat];
        if (!spec) throw new Error(`three renderer: no material for MAT ${mat}`);
        cache.set(mat, patch(physical(spec, extra), spec));
      }
      return cache.get(mat);
    };
  };
  const partMaterial = materialCache((m, spec) => patchMaterial(m, spec, PART_MOTION_GLSL, 'kyotoMotion'));
  const limbMaterial = materialCache((m, spec) => patchLimbMaterial(m, spec));
  const stampMaterial = materialCache((m, spec) => patchStampMaterial(m, spec), {alphaTest: .45, alphaToCoverage: true});
  const IDENTITY = new THREE.Matrix4();

  let plate = null, life = null, lastTime = 0, wardGroup = null, wardTextures = [];
  const scratch = doc.createElement('canvas');
  const presence = {x: 0, v: 0}, drift = {offset: 0, velocity: 0}, size = {w: 0, h: 0};

  function freePlate() {
    if (wardGroup) {
      scene.remove(wardGroup);
      wardGroup.traverse(o => { o.geometry?.dispose(); o.dispose?.(); });
    }
    for (const tex of wardTextures.splice(0)) tex.dispose();
    shared.uFine0.value = shared.uPlaceholder.value = shared.uMistFine.value = dummyRgba;
    shared.uIdent0.value = shared.uMistIdent.value = dummyRg;
    shared.uSoft0.value = dummySoft;
    wardGroup = null; plate = null; life = null;
  }

  /** Builds a ward's plate. Returns false when the ward has not been redrawn as a plate. */
  function setWard(ward) {
    freePlate();
    if (!Object.hasOwn(PLATES, ward)) return false;
    const started = performance.now();
    const {parts, errors} = preparePlate(PLATES[ward]());
    if (errors.length) throw Error(`Plate ${ward}: ${errors.join('; ')}`);
    const w = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), canvas.clientWidth < 700 ? 1152 : 1536), h = Math.round(w * PLATE.halfH / PLATE.halfW);

    scratch.width = w; scratch.height = h;
    const ctx = scratch.getContext('2d', {willReadFrequently: true});
    paintLayer(ctx, w, h, parts, 0);
    const fine0Img = new Uint8Array(ctx.getImageData(0, 0, w, h).data);
    const fine0Tex = new THREE.DataTexture(fine0Img, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
    fine0Tex.minFilter = THREE.LinearMipmapLinearFilter; fine0Tex.magFilter = THREE.LinearFilter;
    fine0Tex.generateMipmaps = true; fine0Tex.anisotropy = maxAniso; fine0Tex.unpackAlignment = 1; fine0Tex.needsUpdate = true;

    const soft = bakeSoftLayer(fine0Img, w, h);
    const softHalf = new Uint16Array(soft.data.length);
    for (let i = 0; i < soft.data.length; i++) softHalf[i] = THREE.DataUtils.toHalfFloat(soft.data[i]);
    const soft0Tex = new THREE.DataTexture(softHalf, soft.sw, soft.sh, THREE.RedFormat, THREE.HalfFloatType);
    soft0Tex.minFilter = soft0Tex.magFilter = THREE.LinearFilter; soft0Tex.unpackAlignment = 1; soft0Tex.needsUpdate = true;

    const mw = Math.round(w / 2), mh = Math.round(h / 2), {maps, packed} = identMaps(doc, parts, mw, mh, LAYERS, MAT.ground);
    const ident0Tex = new THREE.DataTexture(packed[0], mw, mh, THREE.RGFormat, THREE.UnsignedByteType);
    ident0Tex.minFilter = ident0Tex.magFilter = THREE.NearestFilter; ident0Tex.unpackAlignment = 1; ident0Tex.needsUpdate = true;

    const placeholderTex = new THREE.CanvasTexture(paintPlaceholder(doc, parts, w, h));
    placeholderTex.flipY = false; placeholderTex.colorSpace = THREE.SRGBColorSpace; placeholderTex.anisotropy = maxAniso; placeholderTex.needsUpdate = true;

    // Bare nashiji, for reference only (fillers.js): share farther than 12 units from any part / largest empty radius.
    const occupied = new Uint8Array(mw * mh);
    for (const map of maps) for (let i = 0; i < map.length; i++) if (map[i]) occupied[i] = 1;
    const blank = blankStats(occupied, mw, mh, PLATE.halfW * 2 / mw);
    canvas.dataset.blank = `${(blank.ratio * 100).toFixed(1)}%/${blank.radius.toFixed(0)}`;

    wardTextures.push(fine0Tex, soft0Tex, ident0Tex, placeholderTex);
    shared.uFine0.value = fine0Tex;
    shared.uSoft0.value = soft0Tex;
    shared.uIdent0.value = ident0Tex;
    shared.uPlaceholder.value = placeholderTex;

    wardGroup = new THREE.Group(); scene.add(wardGroup);
    const addInterleaved = (byMat, getMaterial, depth) => {
      let vertices = 0;
      for (const [mat, data] of byMat) {
        const g = new THREE.BufferGeometry(), buffer = new THREE.InterleavedBuffer(data, 16);
        g.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer, 3, 0)); g.setAttribute('normal', new THREE.InterleavedBufferAttribute(buffer, 3, 3));
        g.setAttribute('uv', new THREE.InterleavedBufferAttribute(buffer, 2, 6));
        g.setAttribute('aOwner', new THREE.InterleavedBufferAttribute(buffer, 4, 8)); g.setAttribute('aStyle', new THREE.InterleavedBufferAttribute(buffer, 4, 12));
        wardGroup.add(mesh(g, getMaterial(mat), depth));
        vertices += data.length / 16;
      }
      return vertices;
    };
    const meshVertices = addInterleaved(meshesByMaterial(parts), partMaterial, partDepth);
    const treeVertices = addInterleaved(limbsByMaterial(parts), limbMaterial, limbDepth);

    let treeStamps = 0;
    for (const [mat, s] of stampsByMaterial(parts)) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-.5, 0, -.5, .5, 0, -.5, .5, 0, .5, -.5, 0, .5]), 3));
      g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      g.setAttribute('aPlacement', new THREE.InstancedBufferAttribute(s.placement, 4));
      g.setAttribute('aStamp', new THREE.InstancedBufferAttribute(s.stamp, 4));
      g.setAttribute('aOwner', new THREE.InstancedBufferAttribute(s.owner, 4));
      g.setAttribute('aStyle', new THREE.InstancedBufferAttribute(s.style, 4));
      const im = new THREE.InstancedMesh(g, stampMaterial(mat), s.count);
      for (let i = 0; i < s.count; i++) im.setMatrixAt(i, IDENTITY);
      im.instanceMatrix.needsUpdate = true;
      im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; im.customDepthMaterial = stampDepth;
      wardGroup.add(im);
      treeStamps += s.count;
    }

    const mistParts = parts.filter(p => p.kind === KIND.mist);
    if (mistParts.length) {
      paintLayer(ctx, w, h, mistParts.map(p => ({...p, layer: 1})), 1);
      const mistFineImg = new Uint8Array(ctx.getImageData(0, 0, w, h).data);
      const mistFineTex = new THREE.DataTexture(mistFineImg, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
      mistFineTex.minFilter = THREE.LinearMipmapLinearFilter; mistFineTex.magFilter = THREE.LinearFilter;
      mistFineTex.generateMipmaps = true; mistFineTex.anisotropy = maxAniso; mistFineTex.unpackAlignment = 1; mistFineTex.needsUpdate = true;

      const {packed: mistPacked} = identMaps(doc, mistParts.map(p => ({...p, layer: 0})), mw, mh, 1, 0);
      const mistIdentTex = new THREE.DataTexture(mistPacked[0], mw, mh, THREE.RGFormat, THREE.UnsignedByteType);
      mistIdentTex.minFilter = mistIdentTex.magFilter = THREE.NearestFilter; mistIdentTex.unpackAlignment = 1; mistIdentTex.needsUpdate = true;

      wardTextures.push(mistFineTex, mistIdentTex);
      shared.uMistFine.value = mistFineTex;
      shared.uMistIdent.value = mistIdentTex;

      const {position, owner} = mistGeometryData(mistParts);
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.BufferAttribute(position, 3));
      mg.setAttribute('aOwner', new THREE.BufferAttribute(owner, 4));
      const mistMesh = new THREE.Mesh(mg, mistMaterial);
      mistMesh.frustumCulled = false; mistMesh.castShadow = false; mistMesh.receiveShadow = false; mistMesh.renderOrder = 5;
      wardGroup.add(mistMesh);
    }
    scratch.width = scratch.height = 1;

    plate = {parts, maps, mw, mh, ward, soft, ident: packed[0], frames: 0};
    life = createLife(parts);
    canvas.dataset.renderer = 'three'; canvas.dataset.ward = ward;
    canvas.dataset.meshVertices = String(meshVertices); canvas.dataset.parts = String(parts.length);
    canvas.dataset.treeVertices = String(treeVertices); canvas.dataset.treeStamps = String(treeStamps);
    canvas.dataset.boxVertices = String(boxVertices); canvas.dataset.bakeMs = (performance.now() - started).toFixed(0);
    return true;
  }

  /**
   * @param {import('../renderer.js').Frame & {presence?:number}} f
   * @param {Float32Array} projection camera matrix for this frame (projection × the page's view)
   * @param {number} unitsPerPx plate units covered by one device pixel
   */
  function draw(f, projection, unitsPerPx) {
    if (!plate) return;
    // study.js writes 'webgl' once after init; the frame says which renderer actually drew it.
    canvas.dataset.renderer = 'three';
    const quiet = f.still || f.flat, dt = Math.min(.05, Math.max(0, (f.time - lastTime) / 1000) || .016); lastTime = f.time;
    const want = f.presence ?? 0;
    if (f.still) { presence.x = want; presence.v = 0; } else stepSpring(presence, want, want > presence.x ? 8 : 2.2, dt);
    const [lx, lz] = groundPoint(projection, f.px, -f.py).map(value => Math.max(-430, Math.min(430, value)));
    const LAMP_H = 70, lampAt = [lx - VIEW[0] / VIEW[1] * LAMP_H, LAMP_H, lz - VIEW[2] / VIEW[1] * LAMP_H];
    const state = life.update(dt, {time: f.time, light: [lx, lz], presence: presence.x, still: f.still, lift: f.lift, maps: plate.maps, mapW: plate.mw, mapH: plate.mh});
    canvas.dataset.under = state.under ? plate.parts[state.under - 1].id : '';
    packLifeState(state.a, state.b, stateData); stateTexture.needsUpdate = true;
    // Dev only (?export=glb): once the plate has settled, download it at rest for a ThreeRT reference render
    // (docs/MAKIE_THREERT_REFERENCE.md). The production build drops this branch and the module.
    if (import.meta.env.DEV && ++plate.frames === 30 && new URLSearchParams(location.search).get('export') === 'glb') {
      const pose = {ward: plate.ward, parts: plate.parts, soft: plate.soft, ident: plate.ident, mw: plate.mw, mh: plate.mh,
        a: Float32Array.from(state.a), b: Float32Array.from(state.b), box};
      void import('./export-glb.js').then(m => m.downloadPlateGlb(doc, pose))
        .then(bytes => { canvas.dataset.exported = String(bytes); }, error => { console.error('glb export failed', error); canvas.dataset.exported = 'error'; });
    }

    // The box leans a little toward the hand: Rx · Rz, column-major, as in the old pipeline.
    const rz = quiet ? 0 : -f.px * .05 * f.lift, rx = quiet ? 0 : f.py * .035 * f.lift;
    const cz = Math.cos(rz), sz = Math.sin(rz), cx = Math.cos(rx), sx = Math.sin(rx);
    shared.uTilt.value.fromArray([cz, cx * sz, sx * sz, -sz, cx * cz, sx * cz, 0, -sx, cx]);
    shared.uOpening.value = f.opening * f.opening * (3 - 2 * f.opening);

    // The cords feel the box lean and feel it pulled along its track; reduced motion leaves them hanging still.
    const tilt = shared.uTilt.value.elements;
    const offset = (f.offset ?? 0) * unitsPerPx * canvas.width / Math.max(1, canvas.clientWidth), velocity = (offset - drift.offset) / dt;
    const pull = quiet ? 0 : Math.max(-6000, Math.min(6000, -(velocity - drift.velocity) / dt * .5));
    drift.offset = offset; drift.velocity = velocity;
    const strands = [];
    for (const c of cords) {
      const [x, y, z] = [c.anchor[0], c.anchor[1] + 48, c.anchor[2]];
      const pin = [tilt[0] * x + tilt[3] * y + tilt[6] * z, tilt[1] * x + tilt[4] * y + tilt[7] * z - 48, tilt[2] * x + tilt[5] * y + tilt[8] * z];
      if (quiet) c.cord.settle(pin); else c.cord.step(dt, {anchor: pin, ax: pull, kick: (f.kick ?? 0) * 420});
      strands.push(...cordTube(c.cord.points, c.out));
    }
    setCords(strands);

    // Light: a key from the window side, a cool dim room by night, and the hand's own lamp.
    const night = f.night;
    ambient.color.set(night ? '#7f96d6' : '#fff4e0'); ambient.intensity = night ? .35 : .55;
    key.color.set(night ? '#9fb4e8' : '#fff0d6'); key.intensity = night ? 1.7 : 3.4;
    scene.environmentIntensity = night ? .22 : .55;
    lamp.position.set(lampAt[0], lampAt[1], lampAt[2]); lamp.intensity = (night ? 120000 : 50000) * (.15 + presence.x);

    shared.uLamp.value.set(lampAt[0], lampAt[1], lampAt[2]);
    shared.uTime.value = (f.time / 1000) % 3600;
    shared.uNight.value = night ? 1 : 0;
    shared.uPresence.value = presence.x;
    shared.uPx.value = unitsPerPx;
    for (let i = 0; i < 20; i++) {
      const p = f.trails?.[i];
      if (p) trails[i].set(p.x, p.z, trailIntensity(p.time, f.time, f.still));
      else trails[i].set(0, 0, 0);
    }

    const w = canvas.width, h = canvas.height;
    if (size.w !== w || size.h !== h) { size.w = w; size.h = h; renderer.setSize(w, h, false); }
    // three's view is the page's lookAt; its projection is whatever makes projection × view equal the page's matrix.
    pageMatrix.fromArray(projection);
    camera.projectionMatrix.multiplyMatrices(pageMatrix, camera.matrixWorld); camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    renderer.render(scene, camera);
    renderer.resetState();
    // Leave the context as the relief renderer expects to find it.
    gl.bindVertexArray(null); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.activeTexture(gl.TEXTURE0); gl.depthMask(true); gl.disable(gl.BLEND);
  }

  /** A tap on a part in close-up. Returns the part's id, or '' when the tap met bare ground. */
  function poke(x, z, time) {
    if (!plate) return '';
    const index = partAt(plate.maps, plate.mw, plate.mh, x, z);
    return index && life.act(index, time) ? plate.parts[index - 1].id : '';
  }

  return {
    setWard, draw, poke, active: () => Boolean(plate),
    dispose() {
      freePlate();
      if (cordMesh) cordMesh.geometry.dispose();
      for (const d of disposables.splice(0)) d.dispose?.();
      scene.environment = null;
      renderer.dispose();
    },
  };
}
