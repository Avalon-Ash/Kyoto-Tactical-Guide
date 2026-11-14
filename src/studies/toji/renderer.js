// WebGL for the cabinet: one mesh per ward, a shadow pass and the lacquer pass. It knows nothing of gestures or pages;
// study.js hands it a frame description and gets the camera matrix back for hit-testing.
import {buildScene, multiply, lookAt, ortho, normalize, trailIntensity} from './geometry.js';
import {vertex, fragment, depth} from './shaders.js';
import {viewBox, renderDpr} from './view.js';
import {createPlateRenderer} from './plate/renderer.js';
import {createThreeRenderer} from './plate/three-renderer.js';
import {hasPlate} from './plate/parts.js';

// Fixed home camera; the backdrop's cabinet keepout shares it.
const EYE = [430, 720, 920], CAMERA_VIEW = lookAt(EYE, [0, 40, 0]);
const SHADOW = 1024;
/** zoom/cx/cy default to the full frame; view.js keeps zoom 1 identical to the original framing. */
export function cameraMatrix(width, height, zoom = 1, cx = 0, cy = 0) {
  const v = viewBox(width / height, zoom, cx, cy);
  return multiply(ortho(v.left, v.right, v.bottom, v.top, 1, 2200), CAMERA_VIEW);
}

/**
 * @typedef {{time:number, moving:boolean, still:boolean, flat:boolean, night:boolean, ground:number, lift:number, opening:number,
 * px:number, py:number, zoom:number, panX:number, panY:number, presence?:number, offset?:number, kick?:number, trails:{x:number, z:number, time:number}[]}} Frame
 * @param {HTMLCanvasElement} canvas
 * @param {string} wardId
 * Throws when WebGL or the shadow framebuffer is unavailable; nothing is left allocated in that case.
 */
export function createRenderer(canvas, wardId) {
  // WebGL2 where it exists: redrawn wards are makie plates (plate/renderer.js). The relief mesh below is GLSL ES 1.00
  // and runs on either context, for the wards not yet redrawn and for devices without WebGL2.
  const settings = {alpha: true, antialias: true, stencil: true, powerPreference: 'low-power'};
  const gl2 = canvas.getContext('webgl2', settings), gl = gl2 ?? canvas.getContext('webgl', settings);
  if (!gl) throw Error('WebGL unavailable');
  const resources = [];
  const release = () => resources.splice(0).reverse().forEach(free => free());
  const shader = (type, source) => {
    const s = gl.createShader(type); resources.push(() => gl.deleteShader(s));
    gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = source => {
    const p = gl.createProgram(); resources.push(() => gl.deleteProgram(p));
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vertex)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, source)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p));
    const names = ['camera', 'lightMatrix', 'opening', 'pointer', 'lift', 'time', 'moving', 'light', 'eye', 'ground', 'night', 'trails[0]', 'shadowMap'];
    return {p, uniform: Object.fromEntries(names.map(n => [n, gl.getUniformLocation(p, n)])), attributes: ['position', 'normal', 'surface'].map(n => gl.getAttribLocation(p, n))};
  };
  try {
    const main = program(fragment), shadow = program(depth), buffer = gl.createBuffer();
    resources.push(() => gl.deleteBuffer(buffer));
    let mesh, ward = wardId, draws = 0, plateActive = false;
    // If the plate renderer cannot be built on this device, every ward falls back to the relief mesh.
    let plate = null;
    // ?three=1 opts into the three.js plate renderer (docs/MAKIE_THREE_PLAN.md); without it nothing changes.
    const useThree = typeof location !== 'undefined' && new URLSearchParams(location.search).get('three') === '1';
    if (gl2) try { plate = (useThree ? createThreeRenderer : createPlateRenderer)(gl2, canvas); } catch (error) { console.warn('Makie plate unavailable:', error); }
    if (plate) resources.push(() => plate.dispose());
    const setMesh = id => {
      ward = id;
      plateActive = Boolean(plate && hasPlate(id) && plate.setWard(id));
      canvas.dataset.plate = String(plateActive);
      if (plateActive) return;
      mesh = buildScene(id); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
    };
    const framebuffer = gl.createFramebuffer(), texture = gl.createTexture(), depthBuffer = gl.createRenderbuffer();
    resources.push(() => gl.deleteFramebuffer(framebuffer), () => gl.deleteTexture(texture), () => gl.deleteRenderbuffer(depthBuffer));
    gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SHADOW, SHADOW, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SHADOW, SHADOW);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw Error('Shadow framebuffer unavailable');
    setMesh(wardId);

    /** @param {Frame} f */
    function bind(prog, matrix, lightMatrix, f) {
      gl.useProgram(prog.p); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      for (let i = 0; i < 3; i++) if (prog.attributes[i] >= 0) { gl.enableVertexAttribArray(prog.attributes[i]); gl.vertexAttribPointer(prog.attributes[i], i === 2 ? 2 : 3, gl.FLOAT, false, 32, i * 12); }
      const u = prog.uniform, quiet = f.flat || f.still;
      gl.uniformMatrix4fv(u.camera, false, matrix); gl.uniformMatrix4fv(u.lightMatrix, false, lightMatrix);
      gl.uniform1f(u.opening, f.opening * f.opening * (3 - 2 * f.opening));
      gl.uniform2f(u.pointer, f.flat ? 0 : f.px, f.flat ? 0 : f.py); gl.uniform1f(u.lift, f.lift); gl.uniform1f(u.time, f.time / 1000);
      gl.uniform1f(u.moving, f.moving && !quiet ? 1 : 0);
    }
    return {
      setMesh,
      /** A tap on a part of a plate in close-up; '' when there is no plate or nothing was met. */
      poke: (x, z, time) => plateActive ? plate.poke(x, z, time) : '',
      /** Draws one frame and returns the camera matrix it used. @param {Frame} f */
      draw(f) {
        const dpr = renderDpr(devicePixelRatio, f.zoom, canvas.clientWidth, canvas.clientHeight), w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        const projection = cameraMatrix(w, h, f.zoom, f.panX, f.panY);
        canvas.dataset.renderedWard = ward; canvas.dataset.frames = String(++draws);
        if (plateActive) {
          plate.draw(f, projection, viewBox(w / h, f.zoom).halfW * 2 / w);
          return projection;
        }
        gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        const lightPos = [-390 + f.px * 170, 650, 280 + f.py * 140], lightDir = normalize(lightPos);
        const lightMatrix = multiply(ortho(-560, 560, -540, 540, 1, 1700), lookAt(lightPos, [0, 0, 0]));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); gl.viewport(0, 0, SHADOW, SHADOW); gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Unbind the sampled texture during the shadow pass to avoid framebuffer feedback.
        gl.bindTexture(gl.TEXTURE_2D, null); bind(shadow, lightMatrix, lightMatrix, f); gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 8);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        bind(main, projection, lightMatrix, f); const u = main.uniform;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.uniform1i(u.shadowMap, 0);
        gl.uniform3fv(u.light, lightDir); gl.uniform3fv(u.eye, EYE); gl.uniform1f(u.ground, f.ground); gl.uniform1f(u.night, f.night ? 1 : 0);
        const packed = new Float32Array(60);
        f.trails.forEach((p, i) => packed.set([p.x, p.z, trailIntensity(p.time, f.time, f.still)], i * 3));
        gl.uniform3fv(u['trails[0]'], packed); gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 8);
        canvas.dataset.vertices = String(mesh.length / 8);
        return projection;
      },
      dispose: release,
    };
  } catch (error) { release(); throw error; }
}
