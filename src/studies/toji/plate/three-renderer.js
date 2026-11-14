// The makie plate drawn with three.js (docs/MAKIE_THREE_PLAN.md). Same interface as plate/renderer.js:
// {setWard, draw, poke, active, dispose}. Opt in with ?three=1 (see ../renderer.js); the old pipeline stays the default.
//
// T0 scope: box and lid, every part that is already a mesh (p1–p3 buildings, torii, stage, lanterns), their motion
// (createLife → DataTexture → onBeforeCompile hinge, the same code in the colour and the shadow-depth material), a
// DirectionalLight shadow map. Parts that are not meshes yet (ground, hills, mist, water, trees, fox, phoenix, bird) are
// painted flat onto the lid as a placeholder; T1/T2 replace that with real three geometry.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {PLATE, MAT, KIND, rand} from './vocab.js';
import {PLATES, LAYERS, preparePlate, createLife, partAt} from './parts.js';
import {identMaps} from './bake.js';
import {buildBox, FITTINGS} from './renderer.js';
import {createCord, cordTube} from './cord.js';
import {stepSpring} from './spring.js';
import {groundPoint, normalize} from '../geometry.js';
import {MATERIALS, BOX_MATERIALS, GROUND_LID, STATE_WIDTH, STATE_HEIGHT, packLifeState, meshesByMaterial, sliceBox, PART_MOTION_GLSL, BOX_MOTION_GLSL} from './three-pack.js';

const EYE = [430, 720, 920], TARGET = [0, 40, 0];
const VIEW = normalize(EYE.map((v, i) => v - TARGET[i])), KEY = normalize([-.5, .78, .22]);
const STRIDE = 10;

/** Procedural gold-powder normal map: random small tilted flakes on a flat tangent-space field. No external image. */
export function bakeFlakeNormal(doc, size = 256) {
  const canvas = doc.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d'), r = rand(7);
  ctx.fillStyle = 'rgb(128,128,255)'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i++) {
    const x = r() * size, y = r() * size, rad = 1.6 + r() * 4.2, a = r() * 6.283, sides = 4 + Math.floor(r() * 2);
    ctx.fillStyle = `rgb(${Math.round(128 + (r() - .5) * 120)},${Math.round(128 + (r() - .5) * 120)},235)`;
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
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1 / 36, 1 / 36);
  return texture;
}

/**
 * The placeholder for everything that is not a mesh yet: flat colour in plate coordinates (x right, z down; the canvas
 * covers the whole plate). Sources: fills, lines, tree limbs and stamps. Returns the canvas.
 */
export function paintPlaceholder(doc, parts, w, h) {
  const canvas = doc.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = MATERIALS[MAT.ground].paint; ctx.fillRect(0, 0, w, h);
  ctx.setTransform(w / (PLATE.halfW * 2), 0, 0, h / (PLATE.halfH * 2), w / 2, h / 2);
  const speck = rand(11);
  ctx.fillStyle = 'rgba(214,166,64,.35)';
  for (let i = 0; i < 2600; i++) { const s = .5 + speck() * 1.2; ctx.fillRect((speck() - .5) * PLATE.halfW * 2, (speck() - .5) * PLATE.halfH * 2, s, s); }
  const trace = (d, close) => { ctx.beginPath(); ctx.moveTo(d[0][0], d[0][1]); for (let i = 1; i < d.length; i++) ctx.lineTo(d[i][0], d[i][1]); if (close) ctx.closePath(); };
  const paint = mat => MATERIALS[mat]?.paint ?? '#8a6a2c';
  ctx.lineCap = ctx.lineJoin = 'round';
  // Stable sort: layer 0 first, then the parts that stand, in drawing order.
  for (const p of parts.filter(q => !q.mesh).sort((a, b) => a.layer - b.layer)) {
    ctx.globalAlpha = p.kind === KIND.mist ? .8 : .92;
    ctx.fillStyle = paint(p.mat);
    for (const f of p.fills) { trace(f.d, true); ctx.fill(); }
    ctx.globalAlpha = .85; ctx.strokeStyle = '#f0d48c';
    for (const l of p.lines) { ctx.lineWidth = Math.max(.6, l.w); trace(l.d, false); ctx.stroke(); }
    for (const limb of p.limbs ?? []) {
      ctx.strokeStyle = limb.mat ? paint(limb.mat) : '#3a2a14';
      for (let i = 1; i < limb.points.length; i++) {
        const [x0, z0, r0] = limb.points[i - 1], [x1, z1, r1] = limb.points[i];
        ctx.lineWidth = Math.max(.8, (r0 + r1)); ctx.beginPath(); ctx.moveTo(x0, z0); ctx.lineTo(x1, z1); ctx.stroke();
      }
    }
    for (const s of p.stamps ?? []) {
      ctx.fillStyle = paint(s.mat); ctx.beginPath(); ctx.ellipse(s.x, s.z, s.w / 2, s.h / 2, s.turn, 0, 6.283); ctx.fill();
    }
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
  const shared = {uState: {value: stateTexture}, uTilt: {value: new THREE.Matrix3()}, uOpening: {value: 0}};

  const flake = own(bakeFlakeNormal(doc));
  const NORMAL_FIX = THREE.ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0');
  /** Faces are lit by their own normals whichever way they wind, as the old pipeline did. */
  const patchMaterial = (material, spec, glsl, call) => {
    material.customProgramCacheKey = () => `kyoto-${call}-${spec.glow ? 1 : 0}`;
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, shared);
      shader.uniforms.uGlowBase = {value: spec.glow ? .3 : 1}; shader.uniforms.uGlowGain = {value: spec.glow ? 1.8 : 0};
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${glsl}`);
      shader.vertexShader = call === 'kyotoMotion'
        ? shader.vertexShader.replace('#include <beginnormal_vertex>', 'vec3 kyotoP; vec3 objectNormal; kyotoMotion(position, normal, kyotoP, objectNormal);')
        : shader.vertexShader.replace('#include <beginnormal_vertex>', 'vec3 kyotoP; vec3 objectNormal; kyotoBox(position, normal, kyotoP, objectNormal);');
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = kyotoP;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vGlow; uniform float uGlowBase, uGlowGain;')
        .replace('#include <normal_fragment_begin>', NORMAL_FIX)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= uGlowBase + vGlow * uGlowGain;');
    };
    return material;
  };
  const patchDepth = (call, glsl) => {
    const material = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide});
    material.customProgramCacheKey = () => `kyoto-depth-${call}`;
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, shared);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${glsl}`)
        .replace('#include <begin_vertex>', `vec3 kyotoP; vec3 kyotoN; ${call}(position, normal, kyotoP, kyotoN); vec3 transformed = kyotoP;`);
    };
    return own(material);
  };
  const partDepth = patchDepth('kyotoMotion', PART_MOTION_GLSL), boxDepth = patchDepth('kyotoBox', BOX_MOTION_GLSL);

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

  // The box: lid top (the picture is painted on it), then everything from the lid's edge down to the tray and packets.
  const box = buildBox(), boxGroup = new THREE.Group(); scene.add(boxGroup);
  const groundMaterial = patchMaterial(physical(GROUND_LID), GROUND_LID, BOX_MOTION_GLSL, 'kyotoBox');
  const [lidTop] = [...sliceBox(box.data, 0, box.lidTop).values()];
  for (let i = 0; i < lidTop.uv.length; i += 2) {
    const x = lidTop.uv[i], z = lidTop.uv[i + 1];
    lidTop.uv[i] = (x + PLATE.halfW) / (PLATE.halfW * 2); lidTop.uv[i + 1] = 1 - (z + PLATE.halfH) / (PLATE.halfH * 2);
  }
  boxGroup.add(mesh(buffers(lidTop.position, lidTop.normal, lidTop.uv, lidTop.part), groundMaterial, boxDepth));
  let boxVertices = box.lidTop;
  for (const [id, slice] of sliceBox(box.data, box.lidTop, box.opaque)) {
    const spec = BOX_MATERIALS[id];
    if (!spec) throw new Error(`three renderer: no material for box id ${id}`);
    // The cords are drawn live; the fixed geometry here never carries id 27 (they come from cordTube), but guard anyway.
    boxGroup.add(mesh(buffers(slice.position, slice.normal, slice.uv, slice.part), patchMaterial(physical(spec), spec, BOX_MOTION_GLSL, 'kyotoBox'), boxDepth));
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

  const materials = new Map();
  const partMaterial = mat => {
    if (!materials.has(mat)) {
      const spec = MATERIALS[mat];
      if (!spec) throw new Error(`three renderer: no material for MAT ${mat}`);
      materials.set(mat, patchMaterial(physical(spec), spec, PART_MOTION_GLSL, 'kyotoMotion'));
    }
    return materials.get(mat);
  };

  let plate = null, life = null, lastTime = 0, wardGroup = null, placeholder = null;
  const presence = {x: 0, v: 0}, drift = {offset: 0, velocity: 0}, size = {w: 0, h: 0};

  function freePlate() {
    if (wardGroup) {
      scene.remove(wardGroup);
      wardGroup.traverse(o => o.geometry?.dispose());
    }
    placeholder?.dispose(); placeholder = null; groundMaterial.map = null; groundMaterial.needsUpdate = true;
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
    placeholder = new THREE.CanvasTexture(paintPlaceholder(doc, parts, w, h));
    placeholder.colorSpace = THREE.SRGBColorSpace; placeholder.anisotropy = renderer.capabilities.getMaxAnisotropy();
    groundMaterial.map = placeholder; groundMaterial.needsUpdate = true;
    const mw = Math.round(w / 2), mh = Math.round(h / 2), {maps} = identMaps(doc, parts, mw, mh, LAYERS, MAT.ground);

    wardGroup = new THREE.Group(); scene.add(wardGroup);
    let meshVertices = 0;
    for (const [mat, data] of meshesByMaterial(parts)) {
      const g = new THREE.BufferGeometry(), buffer = new THREE.InterleavedBuffer(data, 16);
      g.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer, 3, 0)); g.setAttribute('normal', new THREE.InterleavedBufferAttribute(buffer, 3, 3));
      g.setAttribute('uv', new THREE.InterleavedBufferAttribute(buffer, 2, 6));
      g.setAttribute('aOwner', new THREE.InterleavedBufferAttribute(buffer, 4, 8)); g.setAttribute('aStyle', new THREE.InterleavedBufferAttribute(buffer, 4, 12));
      wardGroup.add(mesh(g, partMaterial(mat), partDepth));
      meshVertices += data.length / 16;
    }
    plate = {parts, maps, mw, mh};
    life = createLife(parts);
    canvas.dataset.renderer = 'three'; canvas.dataset.ward = ward;
    canvas.dataset.meshVertices = String(meshVertices); canvas.dataset.parts = String(parts.length);
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
