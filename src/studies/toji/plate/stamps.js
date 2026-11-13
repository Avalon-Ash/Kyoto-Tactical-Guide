// Pure stamp drawings, shared by the picking silhouettes and the GPU brush table.
// Coordinates are within [-.5,.5]; R = thin relief, G = coverage, B = line drawing.
export const STAMP = {pineFan: 0, pineLayer: 1, maple5: 2, maple7: 3, ginkgo: 4, blossom: 5, citrusLeaf: 6, fruit: 7};
const polar = (a, r, y = 0) => [Math.cos(a) * r, y + Math.sin(a) * r];
export function stampDrawing(cell) {
  const lines = [], d = [];
  if (cell === STAMP.pineFan) {
    d.push([0, .43]);
    for (let i = 0; i <= 48; i++) {
      const a = Math.PI + i / 48 * Math.PI, r = i % 2 ? .445 : .48;
      d.push([Math.cos(a) * r, .20 + Math.sin(a) * r * 1.25]);
    }
    for (let i = 0; i <= 22; i++) {
      const a = Math.PI + .05 + i / 22 * (Math.PI - .1);
      lines.push([[0, .37], [Math.cos(a) * .455, .20 + Math.sin(a) * .455 * 1.25]]);
    }
  } else if (cell === STAMP.pineLayer) {
    for (let i = 0; i <= 40; i++) { const t = i / 40; d.push([-.48 + .96 * t, -.10 - .28 * Math.sin(t * Math.PI)]); }
    for (let i = 40; i >= 0; i--) { const t = i / 40; d.push([-.48 + .96 * t, .13 + .17 * Math.abs(Math.sin(t * Math.PI * 5))]); }
    for (let k = 0; k < 5; k++) for (let j = 0; j < 7; j++) {
      const x = -.38 + k * .19, a = -Math.PI + .2 + j / 6 * (Math.PI - .4);
      lines.push([[x, .21], [x + .11 * Math.cos(a), -.04 + .20 * Math.sin(a)]]);
    }
  } else if (cell === STAMP.maple5 || cell === STAMP.maple7) {
    const lobes = cell === STAMP.maple5 ? 5 : 7;
    d.push([-.035, .46], [-.07, .15]);
    for (let i = 0; i < lobes; i++) {
      const a = -Math.PI / 2 + (i - (lobes - 1) / 2) * (lobes === 5 ? .69 : .49);
      const r = .47 * (1 - .12 * Math.abs(i - (lobes - 1) / 2));
      d.push(polar(a - .28, .245, .08), polar(a - .17, r * .72, .04), polar(a, r, .04), polar(a + .17, r * .72, .04));
      lines.push([[0, .16], polar(a, r * .91, .04)]);
    }
    d.push([.07, .15], [.035, .46]);
    lines.push([[0, .43], [0, .1]]);
  } else if (cell === STAMP.ginkgo) {
    d.push([-.025, .47], [-.04, .26]);
    for (let i = 0; i <= 32; i++) {
      const a = -Math.PI + .25 + i / 32 * (Math.PI - .5), r = .48 - .10 * Math.exp(-(((i - 16) / 1.5) ** 2));
      d.push([Math.cos(a) * r, .18 + Math.sin(a) * r * 1.25]);
      if (i % 3 === 0) lines.push([[0, .35], [Math.cos(a) * r * .94, .18 + Math.sin(a) * r * 1.17]]);
    }
    d.push([.04, .26], [.025, .47]);
  } else if (cell === STAMP.blossom) {
    for (let i = 0; i < 100; i++) {
      const a = i / 100 * Math.PI * 2, t = .5 + .5 * Math.cos(a * 5);
      d.push(polar(a, .25 + .21 * t - .065 * Math.pow(t, 20)));
    }
    for (let i = 0; i < 10; i++) lines.push([[0, 0], polar(i * Math.PI / 5, .13)]);
  } else if (cell === STAMP.citrusLeaf) {
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; d.push([Math.cos(a) * .29, Math.sin(a) * .47]); }
    lines.push([[0, .44], [0, -.43]]);
    for (let i = -2; i <= 2; i++) for (const s of [-1, 1]) lines.push([[0, i * .12], [s * .23, i * .12 - .12]]);
  } else {
    for (let i = 0; i < 48; i++) d.push(polar(i / 48 * Math.PI * 2, .44));
    for (let i = 0; i < 5; i++) lines.push([[0, -.28], polar(i * Math.PI * .4, .09, -.28)]);
  }
  return {d, lines};
}
export function stampOutline(s) {
  const cs = Math.cos(s.turn), sn = Math.sin(s.turn);
  return stampDrawing(s.cell).d.map(([u, v]) => [s.x + cs * u * s.w - sn * v * s.h, s.z + sn * u * s.w + cs * v * s.h]);
}
/** A texture array avoids atlas bleed, including in the mip chain. No blur / dilation. */
export function bakeStamps(doc, size = 192) {
  const canvas = doc.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  if (!ctx) throw Error('Stamp canvas unavailable');
  const layers = [];
  for (let cell = 0; cell < 8; cell++) {
    const {d, lines} = stampDrawing(cell);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, size, size);
    ctx.setTransform(size, 0, 0, size, size / 2, size / 2);
    ctx.beginPath(); d.forEach(([x, z], i) => i ? ctx.lineTo(x, z) : ctx.moveTo(x, z)); ctx.closePath();
    ctx.fillStyle = 'rgb(90,255,0)'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgb(240,255,230)'; ctx.lineWidth = .009; ctx.lineCap = 'round';
    for (const line of lines) { ctx.beginPath(); line.forEach(([x, z], i) => i ? ctx.lineTo(x, z) : ctx.moveTo(x, z)); ctx.stroke(); }
    ctx.restore();
    const pixels = ctx.getImageData(0, 0, size, size).data;
    // Store coverage separately; multiply RGB by coverage so normals remain defined at the edge.
    for (let i = 0; i < pixels.length; i += 4) { const a = pixels[i + 3] / 255; pixels[i] *= a; pixels[i + 1] = pixels[i + 3]; pixels[i + 2] *= a; }
    layers.push(pixels);
  }
  return {size, layers};
}
