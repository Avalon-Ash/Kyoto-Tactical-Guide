// Dev only: the plate at rest as a .glb, for a path-traced reference render in ThreeRT (docs/MAKIE_THREERT_REFERENCE.md).
// The renderer moves every vertex on the GPU (three-pack.js PART_MOTION_GLSL, TREE_*_GLSL, BOX_GROUND_GLSL); this file
// runs the same transforms on the CPU for the pose of one frame, so the exported meshes stand where the screen shows
// them. Procedural shading (nashiji layers, kirikane, ryusui) does not travel: the ground carries one colour per
// material from the ident map, and every surface a plain PBR material (metal, roughness, clearcoat for lacquer).
// Loaded only from three-renderer.js under import.meta.env.DEV with ?export=glb, so it never reaches the built site.
import * as THREE from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {MAT} from './vocab.js';
import {MATERIALS, BOX_MATERIALS, meshesByMaterial, limbsByMaterial, stampsByMaterial, sliceBox} from './three-pack.js';
import {bakeStamps} from './stamps.js';

const HALF = [360, 230], SWELL = 17;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Ground colours for the reference: the honey nashiji, pale gold land, gold water, oxidised silver. */
const GROUND_COLOUR = {
  [MAT.ground]: '#c48f42', [MAT.nashijiLight]: '#d4a656', [MAT.mura]: '#d0a252', [MAT.gyobu]: '#c99a48',
  [MAT.gold]: '#e0b050', [MAT.silver]: '#a8a8a4', [MAT.kirikane]: '#f0c860', [MAT.kirigin]: '#c8c8c4',
  [MAT.aogai]: '#6fa8b0', [MAT.hyomonGold]: '#e6b94e', [MAT.hyomonSilver]: '#d0d2ce', [MAT.water]: '#d6a64c',
  [MAT.kasumi]: '#e6be66', [MAT.lacquer]: '#0b0807', [MAT.lamp]: '#ff9a3c',
};

/**
 * @param {{ward: string, parts: any[], soft: {data: Float32Array, sw: number, sh: number}, ident: Uint8Array,
 *   mw: number, mh: number, a: Float32Array, b: Float32Array, box: {data: Float32Array, lidTop: number, opaque: number}}} pose
 * @returns {THREE.Scene}
 */
export function plateScene(doc, pose) {
  const {parts, soft, ident, mw, mh, a, b, box} = pose;
  const sample = (u, v) => {
    const x = Math.min(soft.sw - 1, Math.max(0, u * soft.sw - .5)), y = Math.min(soft.sh - 1, Math.max(0, v * soft.sh - .5));
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(soft.sw - 1, x0 + 1), y1 = Math.min(soft.sh - 1, y0 + 1), fx = x - x0, fy = y - y0;
    const at = (i, j) => soft.data[j * soft.sw + i];
    return (at(x0, y0) * (1 - fx) + at(x1, y0) * fx) * (1 - fy) + (at(x0, y1) * (1 - fx) + at(x1, y1) * fx) * fy;
  };
  const identAt = (u, v) => (Math.min(mh - 1, Math.max(0, Math.floor(v * mh))) * mw + Math.min(mw - 1, Math.max(0, Math.floor(u * mw)))) * 2;
  /** GROUND_GLSL groundY, on the CPU. */
  const groundY = (px, pz) => {
    const cx = Math.max(-HALF[0], Math.min(HALF[0], px)), cz = Math.max(-HALF[1], Math.min(HALF[1], pz));
    const u = (cx + HALF[0]) / (2 * HALF[0]), v = (cz + HALF[1]) / (2 * HALF[1]);
    const rise = a[ident[identAt(u, v)] * 4 + 2];
    const dome = 3.2 * (1 - (px / 370) ** 2) * (1 - (pz / 240) ** 2);
    const e = (1 - smooth(HALF[0] - 44, HALF[0] - 6, Math.abs(cx))) * (1 - smooth(HALF[1] - 44, HALF[1] - 6, Math.abs(cz)));
    return dome + sample(u, v) * SWELL * (.3 + .7 * rise) * e;
  };
  const groundNormal = (x, z) => { const e = 1.5; return norm([groundY(x - e, z) - groundY(x + e, z), 2 * e, groundY(x, z - e) - groundY(x, z + e)]); };

  /** PART_MOTION_GLSL kyotoMotion for one vertex. owner = (index, foot, ax, az), style = (hinge, mat, 0, bias). */
  const partVertex = (pos, nrm, owner, style) => {
    const id = Math.round(owner[0]), A = a.subarray(id * 4, id * 4 + 4), B = b.subarray(id * 4, id * 4 + 4);
    const foot = owner[1], anchor = [owner[2], owner[3]];
    const theta = A[1] * style[0], ct = Math.cos(theta), st = Math.sin(theta), cs = Math.cos(A[0]), sn = Math.sin(A[0]);
    const r = [pos[0] - anchor[0], pos[2] - anchor[1]], q = [anchor[0] + cs * r[0] - sn * r[1] + B[0], anchor[1] + sn * r[0] + cs * r[1] + B[1]];
    const upF = style[0] > 0 ? smooth(.1, .7, A[1]) : 0, mix = (x, y) => x + (y - x) * upF, eps = 1.5;
    const gy = mix(groundY(q[0], q[1]), groundY(q[0], foot));
    const dgyX = (mix(groundY(q[0] + eps, q[1]), groundY(q[0] + eps, foot)) - mix(groundY(q[0] - eps, q[1]), groundY(q[0] - eps, foot))) / (2 * eps);
    const dgyZ = (1 - upF) * (groundY(q[0], q[1] + eps) - groundY(q[0], q[1] - eps)) / (2 * eps);
    const up = [0, ct, st], down = [0, -st, ct];
    const tx = [cs, down[1] * sn, down[2] * sn], tz = [-sn, down[1] * cs, down[2] * cs];
    const jx = [tx[0], tx[1] + dgyX * cs + dgyZ * sn, tx[2]], jy = up, jz = [tz[0], tz[1] - dgyX * sn + dgyZ * cs, tz[2]];
    const c1 = cross(jy, jz), c2 = cross(jz, jx), c3 = cross(jx, jy);
    const n = norm([0, 1, 2].map(k => c1[k] * nrm[0] + c2[k] * nrm[1] + c3[k] * nrm[2]));
    const height = pos[1] + style[3], d = q[1] - foot;
    return {p: [q[0] + down[0] * d + up[0] * height, gy + B[2] + .35 + down[1] * d + up[1] * height, foot + down[2] * d + up[2] * height], n};
  };
  /** TREE_MOTION_CORE_GLSL kyotoTreeTransform: rest (x, z) in the plate, height above it. */
  const treeVertex = (rest, height, localN, owner, style) => {
    const id = Math.round(owner[0]), A = a.subarray(id * 4, id * 4 + 4), B = b.subarray(id * 4, id * 4 + 4);
    const foot = owner[1], anchor = [owner[2], owner[3]];
    const theta = A[1] * style[0], ct = Math.cos(theta), st = Math.sin(theta), cs = Math.cos(A[0]), sn = Math.sin(A[0]);
    const r = [rest[0] - anchor[0], rest[1] - anchor[1]], q = [anchor[0] + cs * r[0] - sn * r[1] + B[0], anchor[1] + sn * r[0] + cs * r[1] + B[1]];
    const up = [0, ct, st], down = [0, -st, ct], tx = [cs, down[1] * sn, down[2] * sn], tz = [-sn, down[1] * cs, down[2] * cs];
    const gy = groundY(anchor[0], anchor[1]), d = q[1] - foot;
    const p = [q[0] + down[0] * d + up[0] * height, gy + B[2] + .6 + down[1] * d + up[1] * height, foot + down[2] * d + up[2] * height];
    return {p, n: norm([0, 1, 2].map(k => tx[k] * localN[0] + up[k] * localN[1] + tz[k] * localN[2]))};
  };

  const scene = new THREE.Scene();
  const physical = (spec, extra = {}) => new THREE.MeshPhysicalMaterial({
    name: spec.name, color: spec.color, metalness: spec.metalness, roughness: spec.roughness,
    clearcoat: spec.clearcoat ?? 0, clearcoatRoughness: spec.clearcoatRoughness ?? 0,
    ...(spec.emissive ? {emissive: spec.emissive, emissiveIntensity: 2} : {}), side: THREE.DoubleSide, ...extra,
  });
  const geometry = (positions, normals, uvs) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    if (uvs) g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return g;
  };

  // The lid's ground: the box's lid-top grid raised by groundY, coloured per material from the ident map.
  const [lidTop] = [...sliceBox(box.data, 0, box.lidTop).values()];
  const gp = [], gn = [], gu = [];
  for (let i = 0; i < lidTop.position.length; i += 3) {
    const x = lidTop.position[i], z = lidTop.position[i + 2];
    gp.push(x, groundY(x, z), z); gn.push(...groundNormal(x, z));
    gu.push(Math.min(1, Math.max(0, (x + HALF[0]) / (2 * HALF[0]))), Math.min(1, Math.max(0, (z + HALF[1]) / (2 * HALF[1]))));
  }
  const paint = doc.createElement('canvas'); paint.width = mw; paint.height = mh;
  const pctx = paint.getContext('2d'), img = pctx.createImageData(mw, mh);
  const rgb = hex => [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16));
  for (let i = 0; i < mw * mh; i++) {
    const [r, g, bl] = rgb(GROUND_COLOUR[ident[i * 2 + 1]] ?? GROUND_COLOUR[MAT.ground]);
    img.data.set([r, g, bl, 255], i * 4);
  }
  pctx.putImageData(img, 0, 0);
  const groundMap = new THREE.CanvasTexture(paint); groundMap.colorSpace = THREE.SRGBColorSpace; groundMap.flipY = false;
  // Nashiji is gold dust sunk in amber lacquer, not sheet gold: a deep amber tint over the colour map, the dust only
  // partly metal, and the polished coat on top (a fully metal ground turned the whole box into one sheet of gold).
  scene.add(new THREE.Mesh(geometry(gp, gn, gu), physical({name: 'ground-nashiji', color: '#c8945a', metalness: .6, roughness: .45, clearcoat: 1, clearcoatRoughness: .04}, {map: groundMap})));

  // The rest of the box (walls, rim, tray), as it stands.
  for (const [id, slice] of sliceBox(box.data, box.lidTop, box.opaque)) {
    const spec = BOX_MATERIALS[id];
    if (!spec) continue;
    scene.add(new THREE.Mesh(geometry(slice.position, slice.normal, slice.uv), physical(spec)));
  }

  // Meshes (buildings, torii, lanterns, rocks) and tree limbs share the 16-float layout of packMeshes.
  const addPacked = (byMat, kind) => {
    for (const [mat, data] of byMat) {
      const pos = [], nrm = [];
      for (let i = 0; i < data.length; i += 16) {
        const v = data.subarray(i, i + 16), owner = v.subarray(8, 12), style = v.subarray(12, 16);
        const out = kind === 'limb' ? treeVertex([v[0], v[2]], v[1], [v[3], v[4], v[5]], owner, style) : partVertex([v[0], v[1], v[2]], [v[3], v[4], v[5]], owner, style);
        pos.push(...out.p); nrm.push(...out.n);
      }
      scene.add(new THREE.Mesh(geometry(pos, nrm), physical(MATERIALS[mat] ?? MATERIALS[MAT.gold])));
    }
  };
  addPacked(meshesByMaterial(parts), 'part');
  addPacked(limbsByMaterial(parts), 'limb');

  // Foliage stamps: one quad each, cut out by the stamp's coverage (atlas G) as the live shader's alpha test does.
  const {size, layers} = bakeStamps(doc);
  const layerMaps = layers.map(pixels => {
    const c = doc.createElement('canvas'); c.width = c.height = size;
    const cx = c.getContext('2d'), im = cx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) im.data.set([255, 255, 255, pixels[i * 4 + 1]], i * 4);
    cx.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false;
    return t;
  });
  for (const [mat, s] of stampsByMaterial(parts)) {
    const byLayer = new Map();
    for (let i = 0; i < s.count; i++) {
      const pl = s.placement.subarray(i * 4, i * 4 + 4), st = s.stamp.subarray(i * 4, i * 4 + 4);
      const owner = s.owner.subarray(i * 4, i * 4 + 4), style = s.style.subarray(i * 4, i * 4 + 4), layer = Math.round(st[2]);
      if (!byLayer.has(layer)) byLayer.set(layer, {pos: [], nrm: [], uv: []});
      const l = byLayer.get(layer), c = Math.cos(pl[2]), sn = Math.sin(pl[2]);
      const corners = [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]];
      for (const [u, v] of corners) {
        const k = [(u - .5) * st[0], (v - .5) * st[1]], rest = [pl[0] + c * k[0] - sn * k[1], pl[1] + sn * k[0] + c * k[1]];
        const out = treeVertex(rest, pl[3], [0, 1, 0], owner, style);
        l.pos.push(...out.p); l.nrm.push(...out.n); l.uv.push(u, v);
      }
    }
    for (const [layer, l] of byLayer) {
      scene.add(new THREE.Mesh(geometry(l.pos, l.nrm, l.uv), physical(MATERIALS[mat] ?? MATERIALS[MAT.gold], {map: layerMaps[layer] ?? null, alphaTest: .5, transparent: false})));
    }
  }
  return scene;
}

/** Builds the scene and hands the browser a .glb download. Resolves to the file's size in bytes. */
export async function downloadPlateGlb(doc, pose) {
  const scene = plateScene(doc, pose);
  const buffer = await new GLTFExporter().parseAsync(scene, {binary: true});
  const blob = new Blob([/** @type {ArrayBuffer} */(buffer)], {type: 'model/gltf-binary'});
  const link = doc.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = `kyoto-${pose.ward}.glb`;
  doc.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  return blob.size;
}
