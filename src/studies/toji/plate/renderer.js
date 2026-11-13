// WebGL2 renderer for a makie plate: one box, its lid drawn as four ordered layers of relief.
// Nothing here can interpenetrate: parts live in layers, layers are drawn back to front.
import {PLATE, MAT, KIND} from './vocab.js';
import {PLATES, LAYERS, MAX_PARTS, preparePlate, createLife, partAt} from './parts.js';
import {paintLayer, identMaps} from './bake.js';
import {boxVert, partVert, frag, BLUR_VERT, BLUR_FRAG} from './shaders.js';
import {stepSpring} from './spring.js';
import {createCord, cordTube} from './cord.js';
import {groundPoint, normalize, trailIntensity} from '../geometry.js';

const EYE = [430, 720, 920], TARGET = [0, 40, 0];
const VIEW = normalize(EYE.map((v, i) => v - TARGET[i])), KEY = normalize([-.5, .78, .22]);
const STRIDE = 10;

/** Where each cord leaves its ring: on the two sides of the body that face the viewer. `out` points away from the wall. */
export const FITTINGS = [{anchor: [40, -72, 239], out: [0, 1]}, {anchor: [369, -72, -30], out: [1, 0]}];

/** The box: lid top (a shallow dome), chamfer, sides, silver rim, body, interior with its tray and scrolls, ring fittings, and its ground shadow. */
export function buildBox() {
  const out = [];
  const v = (p, n, uv, mat, part) => out.push(p[0], p[1], p[2], n[0], n[1], n[2], uv[0], uv[1], mat, part);
  const dome = (x, z) => 3.2 * (1 - (x / 370) ** 2) * (1 - (z / 240) ** 2);
  const NX = 120, NZ = 78;
  const top = (i, j) => {
    const x = -370 + 740 * i / NX, z = -240 + 480 * j / NZ;
    const n = normalize([3.2 * 2 * x / 370 ** 2 * (1 - (z / 240) ** 2), 1, 3.2 * 2 * z / 240 ** 2 * (1 - (x / 370) ** 2)]);
    return [[x, dome(x, z), z], n, [x, z]];
  };
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) for (const [a, b] of [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]]) { const t = top(i + a, j + b); v(t[0], t[1], t[2], 0, 0); }
  const lidTop = out.length / STRIDE;
  // Four trapezoids between an upper and a lower rectangular ring. ka/kb: 0 = normal up, 1 = normal outward.
  const band = (a, b, mat, part, ka, kb, sign = 1, ox = 0) => {
    const corners = r => [[ox - r.hx, r.y, -r.hz], [ox + r.hx, r.y, -r.hz], [ox + r.hx, r.y, r.hz], [ox - r.hx, r.y, r.hz]];
    const A = corners(a), B = corners(b), dirs = [[0, 0, -1], [1, 0, 0], [0, 0, 1], [-1, 0, 0]];
    let run = 0;
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4, d = dirs[i].map(x => x * sign), length = Math.hypot(A[j][0] - A[i][0], A[j][2] - A[i][2]);
      const na = normalize([d[0] * ka, 1 - ka, d[2] * ka]), nb = normalize([d[0] * kb, 1 - kb, d[2] * kb]);
      const quad = [[A[i], na, [run, a.y]], [A[j], na, [run + length, a.y]], [B[j], nb, [run + length, b.y]], [B[i], nb, [run, b.y]]];
      for (const k of [0, 1, 2, 0, 2, 3]) v(quad[k][0], quad[k][1], quad[k][2], mat, part);
      run += length;
    }
  };
  band({hx: 370, hz: 240, y: 0}, {hx: 372.6, hz: 242.6, y: -3}, 26, 0, .12, .88);
  band({hx: 372.6, hz: 242.6, y: -3}, {hx: 372.6, hz: 242.6, y: -33}, 20, 0, 1, 1);
  band({hx: 373.5, hz: 243.5, y: -33}, {hx: 373.5, hz: 243.5, y: -37.5}, 21, 0, 1, 1);
  band({hx: 372.6, hz: 242.6, y: -33}, {hx: 373.5, hz: 243.5, y: -33}, 21, 0, 0, 0);
  band({hx: 373.5, hz: 243.5, y: -37.5}, {hx: 365, hz: 235, y: -37.5}, 21, 0, 0, 0);
  band({hx: 365, hz: 235, y: -37.5}, {hx: 365, hz: 235, y: -94}, 20, 1, 1, 1);
  band({hx: 365, hz: 235, y: -40}, {hx: 357, hz: 227, y: -40}, 21, 1, 0, 0);
  band({hx: 357, hz: 227, y: -40}, {hx: 357, hz: 227, y: -88}, 22, 2, 1, 1, -1);
  const flat = (hx, hz, y, mat, part, ox = 0) => { const q = [[ox - hx, y, -hz], [ox + hx, y, -hz], [ox + hx, y, hz], [ox - hx, y, hz]]; for (const k of [0, 1, 2, 0, 2, 3]) v(q[k], [0, 1, 0], [q[k][0], q[k][2]], mat, part); };
  flat(357, 227, -88, 22, 2);
  // Kakego: a shallow tray resting in the left of the box, with its own silver rim.
  const TX = -236;
  band({hx: 118, hz: 224, y: -42}, {hx: 118, hz: 224, y: -62}, 22, 2, 1, 1, 1, TX);
  band({hx: 118, hz: 224, y: -42}, {hx: 113, hz: 219, y: -42}, 21, 2, 0, 0, 1, TX);
  band({hx: 113, hz: 219, y: -42}, {hx: 113, hz: 219, y: -57}, 28, 2, 1, 1, -1, TX);
  flat(113, 219, -57, 28, 2, TX);
  // Two small packets of ryoshi rest on the tray floor, below its rim.
  const packet = (x0, x1, z0, z1, y0, y1, mat) => {
    const p = [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],
      [x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];
    const faces = [[[4,7,6,5],[0,1,0]],[[0,1,2,3],[0,-1,0]],
      [[0,4,5,1],[0,0,-1]],[[3,2,6,7],[0,0,1]],
      [[0,3,7,4],[-1,0,0]],[[1,5,6,2],[1,0,0]]];
    for (const [ids,n] of faces) for (const k of [0,1,2,0,2,3]) {
      const q = p[ids[k]]; v(q,n,[q[0],q[2]],mat,2);
    }
  };
  for (const z of [-116,84]) {
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 2, dz = i * 1.5, y = -57 + i * 2.4;
      packet(TX-82+dx,TX+82+dx,z-56+dz,z+56+dz,y,y+2.4,23);
    }
    // A narrow gold paper band wraps each packet, leaving the paper legible.
    packet(TX-3,TX+3,z-56,z+59,-49.8,-49.1,24);
    packet(TX-3,TX+3,z-56.5,z-56,-57,-49.1,24);
    packet(TX-3,TX+3,z+59,z+59.5,-57,-49.1,24);
  }
  const cylinder = (x0, x1, y, z, r, mat, sides = 20) => {
    const at = (x, t) => [[x, y + Math.cos(t) * r, z + Math.sin(t) * r], [0, Math.cos(t), Math.sin(t)], [x, t * r]];
    for (let i = 0; i < sides; i++) {
      const t = i / sides * 6.2832, s = (i + 1) / sides * 6.2832, q = [at(x0, t), at(x1, t), at(x1, s), at(x0, s)];
      for (const k of [0, 1, 2, 0, 2, 3]) v(q[k][0], q[k][1], q[k][2], mat, 2);
      for (const [x, nx] of [[x0, -1], [x1, 1]]) { v([x, y, z], [nx, 0, 0], [0, 0], mat, 2); v(at(x, t)[0], [nx, 0, 0], [0, 0], mat, 2); v(at(x, s)[0], [nx, 0, 0], [0, 0], mat, 2); }
    }
  };
  for (const z of [-135, 0, 135]) { cylinder(-88, 300, -70, z, 17, 23); cylinder(-104, 318, -70, z, 4.5, 24, 12); }
  // Himo-kanagu: a domed seat and a ring on each side that faces the viewer. Local axes: u along the wall, w outward.
  for (const {anchor: [ax, , az], out: [ox, oz]} of FITTINGS) {
    const at = (u, vy, w) => [ax - oz * u + ox * (w - 4), vy, az + ox * u + oz * (w - 4)], dir = (u, vy, w) => normalize([-oz * u + ox * w, vy, ox * u + oz * w]);
    const cy = -58, rings = [[0, 4.5], [5, 4], [9, 2.4], [13, .4]], S = 20;
    for (let i = 0; i < S; i++) for (let k = 0; k < rings.length - 1; k++) {
      const a0 = i / S * 6.2832, a1 = (i + 1) / S * 6.2832, [r0, w0] = rings[k], [r1, w1] = rings[k + 1];
      const pt = (a, r, w) => [at(Math.cos(a) * r, cy + Math.sin(a) * r, w), dir(Math.cos(a) * (w0 - w1), Math.sin(a) * (w0 - w1), r1 - r0), [Math.cos(a) * r, Math.sin(a) * r]];
      const q = [pt(a0, r0, w0), pt(a1, r0, w0), pt(a1, r1, w1), pt(a0, r1, w1)];
      for (const j of [0, 1, 2, 0, 2, 3]) v(q[j][0], q[j][1], q[j][2], 24, 1);
    }
    // The ring: a small torus hanging from the seat.
    const R = 7, T = 1.5, M = 18, N = 8;
    for (let i = 0; i < M; i++) for (let k = 0; k < N; k++) {
      const pt = (ai, ak) => { const a = ai / M * 6.2832, b = ak / N * 6.2832, c = Math.cos(b), s = Math.sin(b); return [at(Math.cos(a) * (R + c * T), cy - R + Math.sin(a) * (R + c * T), 5 + s * T), dir(Math.cos(a) * c, Math.sin(a) * c, s), [a * R, b * T]]; };
      const q = [pt(i, k), pt(i + 1, k), pt(i + 1, k + 1), pt(i, k + 1)];
      for (const j of [0, 1, 2, 0, 2, 3]) v(q[j][0], q[j][1], q[j][2], 24, 1);
    }
  }
  const opaque = out.length / STRIDE;
  flat(640, 470, -94.5, 25, 1);
  return {data: new Float32Array(out), lidTop, opaque, total: out.length / STRIDE};
}

/**
 * The grid each solid is raised from: one mesh per group and layer, covering its parts and a margin. Every vertex
 * belongs to one part (the one drawn there, or the nearest of its group), so the mesh is continuous where parts of a
 * group meet and nothing can be seen between them. Same 10 floats per vertex as the part quads.
 * @param {ReturnType<typeof preparePlate>['parts']} standing
 * @param {Uint8Array[]} maps part index per texel, per layer
 */
export function solidMesh(standing, maps, mw, mh, cell = 2) {
  const out = [], sx = mw / (PLATE.halfW * 2), sz = mh / (PLATE.halfH * 2), byKey = new Map();
  for (const p of standing) { const key = `${p.groupIndex}:${p.layer}`; if (!byKey.has(key)) byKey.set(key, []); byKey.get(key).push(p); }
  for (const members of byKey.values()) {
    const layer = members[0].layer, map = maps[layer], own = new Map(members.map(p => [p.index, p])), pad = 8;
    const x0 = Math.min(...members.map(p => p.bounds[0])) - pad, z0 = Math.min(...members.map(p => p.bounds[1])) - pad;
    const nx = Math.ceil((Math.max(...members.map(p => p.bounds[2])) + pad - x0) / cell), nz = Math.ceil((Math.max(...members.map(p => p.bounds[3])) + pad - z0) / cell);
    // The part that owns each grid point: the one drawn there, else the nearest of this group within a few texels.
    const home = new Uint8Array((nx + 1) * (nz + 1));
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const tx = Math.floor((x0 + i * cell + PLATE.halfW) * sx), tz = Math.floor((z0 + j * cell + PLATE.halfH) * sz);
      search: for (let r = 0; r <= 4; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        const u = tx + dx, v = tz + dz;
        if (u < 0 || v < 0 || u >= mw || v >= mh) continue;
        if (own.has(map[v * mw + u])) { home[j * (nx + 1) + i] = map[v * mw + u]; break search; }
      }
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j], [i + 1, j + 1], [i, j + 1]], ids = corners.map(([a, b]) => home[b * (nx + 1) + a]);
      const any = ids.find(Boolean);
      if (!any) continue;
      corners.forEach(([a, b], k) => { const p = own.get(ids[k] || any); out.push(x0 + a * cell, z0 + b * cell, p.index, p.layer, p.foot, p.thick, p.anchor[0], p.anchor[1], p.hinge, p.bias); });
    }
  }
  return out;
}

export const SHADE_SIZE = 2048, SHADE_H = 380;
/**
 * The lamp's view of the lid, for the shade: an eye straight above the lamp's place, SHADE_H over the lid, looking
 * down through a frustum cut to the lid's rectangle. Taller than anything on the plate, so every solid lies between
 * the eye and the lid; shadows fan away from the hand. Column-major, clip = M · world.
 */
export function shadeMatrix(lx, lz, halfW = 392, halfH = 262, near = 40, far = SHADE_H + 40) {
  const k = near / SHADE_H, l = (-halfW - lx) * k, r = (halfW - lx) * k, b = (lz - halfH) * k, t = (lz + halfH) * k;
  // View: x' = x - lx, y' = lz - z, z' = y - SHADE_H. Then an off-axis perspective.
  const a = 2 * near / (r - l), c = 2 * near / (t - b), A = (r + l) / (r - l), B = (t + b) / (t - b), C = -(far + near) / (far - near), D = -2 * far * near / (far - near);
  return new Float32Array([
    a, 0, 0, 0,
    A, B, C, -1,
    0, -c, 0, 0,
    -a * lx - A * SHADE_H, c * lz - B * SHADE_H, -C * SHADE_H + D, SHADE_H,
  ]);
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 */
export function createPlateRenderer(gl, canvas) {
  const resources = [];
  const own = (object, free) => { resources.push(() => free.call(gl, object)); return object; };
  const compile = (vs, fs, attributes = []) => {
    const p = own(gl.createProgram(), gl.deleteProgram);
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = own(gl.createShader(type), gl.deleteShader);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    attributes.forEach((name, i) => gl.bindAttribLocation(p, i, name));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p));
    const cache = new Map();
    return {p, u: name => { if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name)); return cache.get(name); }};
  };
  // One lean program per pass (see shaders.js): 0 box, 1 ground, 5 slice depth, 2 slice colour, 4 mist, 7 shade.
  const boxP = compile(boxVert(0), frag(0), ['aPos', 'aNormal', 'aUv', 'aMeta']), groundP = compile(boxVert(1), frag(1), ['aPos', 'aNormal', 'aUv', 'aMeta']),
    floorP = compile(boxVert(6), frag(6), ['aPos', 'aNormal', 'aUv', 'aMeta']), blur = compile(BLUR_VERT, BLUR_FRAG);
  const cuts = Object.fromEntries([5, 2, 4, 7].map(mode => [mode, compile(partVert(mode), frag(mode), ['aPos', 'aPart', 'aInfo'])]));
  const box = buildBox();
  const vao = own(gl.createVertexArray(), gl.deleteVertexArray), empty = own(gl.createVertexArray(), gl.deleteVertexArray);
  const buffer = own(gl.createBuffer(), gl.deleteBuffer);
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, box.data, gl.STATIC_DRAW);
  [[3, 0], [3, 12], [2, 24], [2, 32]].forEach(([size, offset], i) => { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, size, gl.FLOAT, false, STRIDE * 4, offset); });
  gl.bindVertexArray(null);
  // One quad per part; rebuilt with each plate. 10 floats: rest position, (index, slot, foot, thickness), (anchor, hinge, bias).
  const partVao = own(gl.createVertexArray(), gl.deleteVertexArray), partBuffer = own(gl.createBuffer(), gl.deleteBuffer);
  gl.bindVertexArray(partVao); gl.bindBuffer(gl.ARRAY_BUFFER, partBuffer);
  [[2, 0], [4, 8], [4, 24]].forEach(([size, offset], i) => { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, size, gl.FLOAT, false, 40, offset); });
  gl.bindVertexArray(null);
  const floatTargets = Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  // The cords: a few hundred vertices rewritten every frame, in the box's vertex layout.
  const cordVao = own(gl.createVertexArray(), gl.deleteVertexArray), cordBuffer = own(gl.createBuffer(), gl.deleteBuffer);
  gl.bindVertexArray(cordVao); gl.bindBuffer(gl.ARRAY_BUFFER, cordBuffer);
  [[3, 0], [3, 12], [2, 24], [2, 32]].forEach(([size, offset], i) => { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, size, gl.FLOAT, false, STRIDE * 4, offset); });
  gl.bindVertexArray(null);
  const cords = FITTINGS.map(f => ({...f, cord: createCord(f)}));
  for (const c of cords) c.cord.settle();
  const drift = {offset: 0, velocity: 0};
  const framebuffer = own(gl.createFramebuffer(), gl.deleteFramebuffer);
  const scratch = canvas.ownerDocument.createElement('canvas');
  // The shade: a depth picture of the solids as the lamp sees them, redrawn every frame (see shadeMatrix).
  const shade = own(gl.createTexture(), gl.deleteTexture), shadeTarget = own(gl.createFramebuffer(), gl.deleteFramebuffer);
  gl.bindTexture(gl.TEXTURE_2D, shade); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SHADE_SIZE, SHADE_SIZE);
  for (const [name, value] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE], [gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL]]) gl.texParameteri(gl.TEXTURE_2D, name, value);
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadeTarget); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shade, 0);
  gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindTexture(gl.TEXTURE_2D, null);

  let plate = null, life = null, lastTime = 0;
  const presence = {x: 0, v: 0};
  function freePlate() { if (plate) for (const t of [plate.fine, plate.soft, plate.ident, plate.tmp]) gl.deleteTexture(t); plate = null; life = null; }
  resources.push(freePlate);

  /** Bake a ward's plate into textures. Returns false when the ward has not been redrawn as a plate. */
  function setWard(ward) {
    freePlate();
    if (!Object.hasOwn(PLATES, ward)) return false;
    const started = performance.now();
    const {parts, errors} = preparePlate(PLATES[ward]());
    if (errors.length) throw Error(`Plate ${ward}: ${errors.join('; ')}`);
    // A phone gets a lighter plate; close-up detail comes from the procedural powder, not from texels.
    const w = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), canvas.clientWidth < 700 ? 1152 : 1536), h = Math.round(w * PLATE.halfH / PLATE.halfW);
    const sw = Math.round(w / 4), sh = Math.round(h / 4), mw = Math.round(w / 2), mh = Math.round(h / 2);
    scratch.width = w; scratch.height = h;
    const ctx = scratch.getContext('2d');
    if (!ctx) throw Error('2D canvas unavailable');
    const array = (internal, tw, th, levels, filter) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, t); gl.texStorage3D(gl.TEXTURE_2D_ARRAY, levels, internal, tw, th, LAYERS);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, filter[0]); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, filter[1]);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    gl.activeTexture(gl.TEXTURE0);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const fine = array(gl.RGBA8, w, h, Math.floor(Math.log2(Math.max(w, h))) + 1, [gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR]);
    for (let layer = 0; layer < LAYERS; layer++) {
      paintLayer(ctx, w, h, parts, layer);
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, w, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, scratch);
    }
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    const softFormat = floatTargets ? gl.R16F : gl.R8;
    const soft = array(softFormat, sw, sh, 1, [gl.LINEAR, gl.LINEAR]);
    const tmp = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tmp); gl.texStorage2D(gl.TEXTURE_2D, 1, softFormat, sw, sh);
    for (const [name, value] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, name, value);
    // Blur the swell on the GPU: across into tmp, then down into the soft array.
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); gl.viewport(0, 0, sw, sh);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.depthMask(false);
    gl.useProgram(blur.p); gl.bindVertexArray(empty);
    gl.uniform1i(blur.u('uArray'), 0); gl.uniform1i(blur.u('uTex'), 1);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tmp);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, fine);
    for (let layer = 0; layer < LAYERS; layer++) {
      gl.uniform1f(blur.u('uLayer'), layer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tmp, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(blur.u('uPass'), 0); gl.uniform2f(blur.u('uStep'), 1 / sw, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, soft, 0, layer);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tmp); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(blur.u('uPass'), 1); gl.uniform2f(blur.u('uStep'), 0, 1 / sh); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindVertexArray(null); gl.depthMask(true);
    const {packed, maps} = identMaps(canvas.ownerDocument, parts, mw, mh, LAYERS, MAT.ground);
    const ident = array(gl.RG8, mw, mh, 1, [gl.NEAREST, gl.NEAREST]);
    for (let layer = 0; layer < LAYERS; layer++) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, mw, mh, 1, gl.RG, gl.UNSIGNED_BYTE, packed[layer]);
    scratch.width = scratch.height = 1;
    // The solids' grids first, then one quad per band of mist.
    const standing = parts.filter(p => p.layer > 0 && p.kind !== KIND.mist), mist = parts.filter(p => p.kind === KIND.mist);
    const quads = solidMesh(standing, maps, mw, mh), solid = quads.length / 10;
    for (const p of mist) {
      const pad = 3, [x0, z0, x1, z1] = [p.bounds[0] - pad, p.bounds[1] - pad, p.bounds[2] + pad, p.bounds[3] + pad];
      for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z0], [x1, z1], [x0, z1]]) quads.push(x, z, p.index, p.layer, p.foot, p.thick, p.anchor[0], p.anchor[1], p.hinge, p.bias);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, partBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quads), gl.STATIC_DRAW);
    plate = {fine, soft, ident, tmp, parts, maps, mw, mh, solid, mist: mist.length * 6};
    canvas.dataset.solidVertices = String(solid);
    life = createLife(parts);
    canvas.dataset.bakeMs = (performance.now() - started).toFixed(0);
    canvas.dataset.parts = String(parts.length);
    return true;
  }

  /**
   * @param {import('../renderer.js').Frame & {presence?:number}} f
   * @param {Float32Array} projection camera matrix for this frame
   * @param {number} unitsPerPx plate units covered by one device pixel
   */
  function draw(f, projection, unitsPerPx) {
    if (!plate) return;
    const quiet = f.still || f.flat, dt = Math.min(.05, Math.max(0, (f.time - lastTime) / 1000) || .016); lastTime = f.time;
    const want = f.presence ?? 0;
    if (f.still) { presence.x = want; presence.v = 0; } else stepSpring(presence, want, want > presence.x ? 8 : 2.2, dt);
    const [lx, lz] = groundPoint(projection, f.px, -f.py).map((value, i) => Math.max(-430, Math.min(430, value)) * (i ? 1 : 1));
    // The lamp sits where its mirror image in the flat lid lands under the hand: the glint follows the finger.
    const LAMP_H = 70, lamp = [lx - VIEW[0] / VIEW[1] * LAMP_H, LAMP_H, lz - VIEW[2] / VIEW[1] * LAMP_H];
    const shadeMat = shadeMatrix(lamp[0], lamp[2]);
    const state = life.update(dt, {time: f.time, light: [lx, lz], presence: presence.x, still: f.still, lift: f.lift, maps: plate.maps, mapW: plate.mw, mapH: plate.mh});
    canvas.dataset.under = state.under ? plate.parts[state.under - 1].id : '';
    // The box leans a little toward the hand: a real rotation, so nothing slides through anything.
    const rz = quiet ? 0 : -f.px * .05 * f.lift, rx = quiet ? 0 : f.py * .035 * f.lift;
    const cz = Math.cos(rz), sz = Math.sin(rz), cx = Math.cos(rx), sx = Math.sin(rx);
    // Rx · Rz, column-major.
    const tilt = new Float32Array([cz, cx * sz, sx * sz, -sz, cx * cz, sx * cz, 0, -sx, cx]);

    // The cords feel the box lean and feel it pulled along its track; reduced motion leaves them hanging still.
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
    gl.bindBuffer(gl.ARRAY_BUFFER, cordBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strands), gl.DYNAMIC_DRAW);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.depthMask(true); gl.stencilMask(0xff); gl.clearStencil(0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    const packed = new Float32Array(60);
    f.trails.forEach((p, i) => packed.set([p.x, p.z, trailIntensity(p.time, f.time)], i * 3));
    const opening = f.opening * f.opening * (3 - 2 * f.opening);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, plate.fine);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D_ARRAY, plate.soft);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D_ARRAY, plate.ident);
    for (const program of [boxP, groundP, floorP, ...Object.values(cuts)]) {
      const u = program.u;
      gl.useProgram(program.p);
      gl.uniformMatrix4fv(u('uCamera'), false, projection); gl.uniformMatrix3fv(u('uTilt'), false, tilt);
      gl.uniform1f(u('uOpening'), opening);
      gl.uniform3fv(u('uView'), VIEW); gl.uniform3fv(u('uKey'), KEY); gl.uniform3fv(u('uLamp'), lamp);
      gl.uniform1f(u('uTime'), (f.time / 1000) % 3600); gl.uniform1f(u('uNight'), f.night ? 1 : 0);
      gl.uniform1f(u('uPresence'), presence.x); gl.uniform1f(u('uPx'), unitsPerPx);
      gl.uniform4fv(u('uA[0]'), state.a); gl.uniform4fv(u('uB[0]'), state.b);
      gl.uniform3fv(u('uTrails[0]'), packed);
      gl.uniform1i(u('uFine'), 0); gl.uniform1i(u('uSoft'), 1); gl.uniform1i(u('uIdent'), 2);
      gl.uniform1i(u('uShade'), 3); gl.uniformMatrix4fv(u('uShadeMat'), false, shadeMat);
    }
    gl.bindVertexArray(partVao);
    if (opening < .999) {
      // 0. The shade's depth picture. Polygon offset keeps a rounded body from shading itself.
      gl.bindFramebuffer(gl.FRAMEBUFFER, shadeTarget); gl.viewport(0, 0, SHADE_SIZE, SHADE_SIZE);
      gl.depthMask(true); gl.clear(gl.DEPTH_BUFFER_BIT); gl.disable(gl.BLEND);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(2, 4);
      gl.useProgram(cuts[7].p); gl.uniformMatrix4fv(cuts[7].u('uCamera'), false, shadeMat); gl.drawArrays(gl.TRIANGLES, 0, plate.solid);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    }
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, shade); gl.activeTexture(gl.TEXTURE0);
    // 1. The box, then the lid's ground.
    gl.bindVertexArray(vao); gl.useProgram(floorP.p);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false); gl.drawArrays(gl.TRIANGLES, box.opaque, box.total - box.opaque);
    gl.useProgram(boxP.p); gl.depthMask(true); gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLES, box.lidTop, box.opaque - box.lidTop);
    gl.bindVertexArray(cordVao); gl.drawArrays(gl.TRIANGLES, 0, strands.length / STRIDE); gl.bindVertexArray(vao);
    gl.useProgram(groundP.p); gl.drawArrays(gl.TRIANGLES, 0, box.lidTop);
    gl.bindVertexArray(partVao);
    if (opening < .999) {
      // 2. The solids. Their shadows are not drawn: the lid and the solids each read the shade's depth picture. Depth first (alpha-to-coverage gives their outlines their softness), then colour only where
      // a surface is the one in front: each sample is shaded once.
      gl.disable(gl.BLEND); gl.depthMask(true); gl.colorMask(false, false, false, false); gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
      gl.useProgram(cuts[5].p); gl.drawArrays(gl.TRIANGLES, 0, plate.solid);
      gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE); gl.colorMask(true, true, true, true); gl.depthMask(false); gl.depthFunc(gl.EQUAL);
      gl.useProgram(cuts[2].p); gl.drawArrays(gl.TRIANGLES, 0, plate.solid);
      // 3. Mist floats over everything and writes no depth.
      gl.depthFunc(gl.LEQUAL); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(cuts[4].p); gl.drawArrays(gl.TRIANGLES, plate.solid, plate.mist);
    }
    // Leave the context as the relief renderer expects to find it.
    gl.depthMask(true); gl.disable(gl.BLEND); gl.bindVertexArray(null);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
  }

  /** A tap on a part in close-up. Returns the part's id, or '' when the tap met bare ground. */
  function poke(x, z, time) {
    if (!plate) return '';
    const index = partAt(plate.maps, plate.mw, plate.mh, x, z);
    return index && life.act(index, time) ? plate.parts[index - 1].id : '';
  }
  return {setWard, draw, poke, active: () => Boolean(plate), dispose() { resources.splice(0).reverse().forEach(free => free()); }};
}
export {MAX_PARTS};
