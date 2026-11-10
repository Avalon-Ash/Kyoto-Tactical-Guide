// What makes each ward's backdrop its own: a ground pattern woven into the paper and one line of verse.
// Pure data and geometry; backdrop.js bakes the pattern, study.js writes the verse.
// The pairings are design associations with each cabinet's relief (landmarks.js), not historical claims.

const H = Math.sqrt(3);
const TAU = Math.PI * 2;
const wave = (at, steps = 16) => Array.from({length: steps + 1}, (_, i) => at(i / steps));
/** Triangles of a unit-side triangular lattice covering one 1 × √3 period (and a margin, clipped when baked). */
function triangles() {
  const out = [];
  for (let row = -1; row < 3; row++) for (let col = -2; col < 3; col++) {
    const x = col + (row % 2 ? .5 : 0), y = row * H / 2;
    out.push([[x, y], [x + 1, y], [x + .5, y + H / 2]], [[x + 1, y], [x + 1.5, y + H / 2], [x + .5, y + H / 2]]);
  }
  return out;
}
const closed = points => [...points, points[0]];
function hexagons(spokes) {
  const a = 1 / H, lines = [];
  for (const [cx, cy] of [[0, 0], [1, 0], [.5, H / 2], [0, H], [1, H]]) {
    const v = Array.from({length: 6}, (_, k) => [cx + a * Math.cos(TAU * (k / 6 + 1 / 12)), cy + a * Math.sin(TAU * (k / 6 + 1 / 12))]);
    lines.push(closed(v));
    if (spokes) for (const k of [0, 2, 4]) lines.push([[cx, cy], v[k]]);
  }
  return lines;
}

/**
 * One repeating tile per pattern, in unit coordinates: `w` × `h`, stroked polylines, filled polygons, stroked circles.
 * `cell` scales the tile against the common cell size.
 * @type {Record<string, () => {w:number, h:number, cell:number, lines?:number[][][], fills?:number[][][], circles?:number[][]}>}
 */
export const MOTIFS = {
  /** 七宝: circles that quarter one another. */
  shippo: () => ({w: 1, h: 1, cell: 1, circles: [[0, 0, .5], [1, 0, .5], [0, 1, .5], [1, 1, .5], [.5, .5, .5]]}),
  /** 亀甲: honeycomb. */
  kikko: () => ({w: 1, h: H, cell: 1.15, lines: hexagons(false)}),
  /** 毘沙門亀甲 (simplified): honeycomb with the inner Y. */
  bishamon: () => ({w: 1, h: H, cell: 1.25, lines: hexagons(true)}),
  /** 波: rows of ripples, each row half a wave out of step. */
  nami: () => ({w: 1, h: .5, cell: 1.5, lines: [
    wave(t => [t, .125 + .06 * Math.sin(TAU * t)]), wave(t => [t, .375 - .06 * Math.sin(TAU * t)]),
  ]}),
  /** 格子: the close vertical bars of a machiya front, tied by one rail. */
  koshi: () => ({w: 1, h: 1.4, cell: 1.1, lines: [[[0, .7], [1, .7]], ...[.125, .375, .625, .875].map(x => [[x, 0], [x, 1.4]])]}),
  /** 麻の葉: every lattice triangle with spokes from its centre. */
  asanoha: () => ({w: 1, h: H, cell: 1.35, lines: triangles().flatMap(t => {
    const c = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
    return [closed(t), ...t.map(v => [c, v])];
  })}),
  /** 菱: diamonds with a smaller diamond at each crossing's heart. */
  hishi: () => ({w: 1, h: .6, cell: 1.5, lines: [[[0, 0], [1, .6]], [[1, 0], [0, .6]], closed([[.5, .17], [.72, .3], [.5, .43], [.28, .3]])]}),
  /** 鱗: every other lattice triangle filled. */
  uroko: () => ({w: 1, h: H, cell: 1, fills: triangles().filter((_, i) => i % 2 === 0)}),
  /** 籠目: three sets of bamboo strips, the level ones passing between the crossings. */
  kagome: () => ({w: 1, h: H, cell: 1.2, lines: [
    [[0, H / 4], [1, H / 4]], [[0, H * 3 / 4], [1, H * 3 / 4]],
    ...[-2, -1, 0, 1, 2].flatMap(k => [[[k, 0], [k + 1, H]], [[k + 1, 0], [k, H]]]),
  ]}),
  /** 市松: checks. */
  ichimatsu: () => ({w: 1, h: 1, cell: 1.2, fills: [[[0, 0], [.5, 0], [.5, .5], [0, .5]], [[.5, .5], [1, .5], [1, 1], [.5, 1]]]}),
  /** 立涌: rising lines that swell apart and draw together. */
  tatewaku: () => ({w: 1, h: 1.6, cell: 1.3, lines: [
    wave(t => [.25 + .12 * Math.sin(TAU * t), t * 1.6]), wave(t => [.75 - .12 * Math.sin(TAU * t), t * 1.6]),
  ]}),
};

/** @type {Record<string, {motif: keyof typeof MOTIFS, verse: {zh: string, ja: string}}>} */
export const WARD_ART = {
  W_KITA: {motif: 'shippo', verse: {zh: '鏡湖池上，金影不動。', ja: '鏡湖池に、金の影。'}},
  W_KAMIGYO: {motif: 'kikko', verse: {zh: '南庭白砂，回廊無聲。', ja: '南庭の白砂、回廊しずか。'}},
  W_SAKYO: {motif: 'nami', verse: {zh: '銀沙如波，向月而待。', ja: '銀沙の波、月を待つ。'}},
  W_NAKAGYO: {motif: 'koshi', verse: {zh: '唐門之內，御殿雁行。', ja: '唐門の奥、雁行の御殿。'}},
  W_HIGASHIYAMA: {motif: 'asanoha', verse: {zh: '音羽山腰，舞台凌空。', ja: '音羽の山に、懸かる舞台。'}},
  W_SHIMOGYO: {motif: 'hishi', verse: {zh: '兩堂並立，銀杏一樹。', ja: '堂ふたつ、銀杏ひともと。'}},
  W_MINAMI: {motif: 'uroko', verse: {zh: '梨地之上，五重塔影。', ja: '梨地に、五重の影。'}},
  W_UKYO: {motif: 'kagome', verse: {zh: '曹源池畔，借山入庭。', ja: '曹源池、山を借りる庭。'}},
  W_NISHIKYO: {motif: 'ichimatsu', verse: {zh: '月見台前，池心待月。', ja: '月見台、池に月を待つ。'}},
  W_YAMASHINA: {motif: 'bishamon', verse: {zh: '石階盡處，楓映本殿。', ja: '石段の先、楓の本殿。'}},
  W_FUSHIMI: {motif: 'tatewaku', verse: {zh: '樓門之後，鳥居連山。', ja: '楼門の奥、鳥居つらなる。'}},
};

/** Mist layout seed, so each ward's bands sit differently. Stable per ward. */
export function wardSeed(wardId) { return 7 + Math.max(0, Object.keys(WARD_ART).indexOf(wardId)) * 101; }
