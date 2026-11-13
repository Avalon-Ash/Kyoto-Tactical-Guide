// Two textures face each other: dark timber over a small pond, silver raked sand with a single level-topped cone.
// The pavilion stays at the far left, the cone at the near right; an open lower-left wedge separates them.
import {KIND, MAT, gardenGround, hill, pond, sandGarden, sandCone, moon, storey, roof, hall, pine, bird, rock, suyari} from './vocab.js';

export function sakyo() {
  return [
    ...gardenGround('garden-floor', [[-343, -210], [141, -210], [330, -176], [341, -34], [263, 176], [5, 178], [-72, 55], [-338, 80]]),
    ...hill('higashiyama', -345, 85, -216, -169, 4, {amp: .35}),
    ...pond('kinkyo', -182, 36, 112, 67, 5),
    ...sandGarden('ginshadan', 14, 249, 0, 102),
    ...sandCone('kogetsudai', 190, 160, 50, 62),
    // A thin shell moon rides the cone's own plane, clear of the pavilion.
    ...moon('moon', 190, 98, 15, {ripples: 0}).map(p => ({...p, kind: KIND.tier, layer: 3, group: 'kogetsudai', thick: 2.4, bias: 19})),
    ...suyari('mist-west', -336, -213, -37, 12, 6),
    ...suyari('mist-east', 59, 331, -198, 13, 11),
    ...rock('pond-stone', -112, 127, 25, 18, 4, {mat: MAT.kirikane}),
    ...storey('ginkaku-lower', -163, -88, -57, 64, {group: 'ginkaku', bays: 5}),
    ...roof('ginkaku-eave', -163, -90, 85, 27, {group: 'ginkaku', order: 1, mat: MAT.lacquer, ridgeHalf: 40}),
    ...storey('ginkaku-upper', -163, -138, -113, 46, {group: 'ginkaku', order: 2, windowMat: MAT.lacquer}),
    ...roof('ginkaku-crown', -163, -140, 63, 34, {group: 'ginkaku', order: 3, mat: MAT.lacquer, ridgeHalf: 25}),
    ...hall('togudo', 84, -102, 82, 32, {wallH: 24}),
    ...pine('near-pine', -293, 178, 99, 12, 2, {clusters: 3}),
    ...pine('east-pine', 282, -54, 112, -12, 6, {clusters: 3}),
    ...bird('uguisu', [[-279, 88, 1, 'near-pine', 22], [267, -151, -1, 'east-pine', 22]]),
  ];
}
