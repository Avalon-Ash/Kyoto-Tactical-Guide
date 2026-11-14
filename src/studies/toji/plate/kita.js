// A horizontal mirror: three gold storeys rise from the far bank, their broken image lies in still water.
// The island pine balances the pavilion; the entire lower-left quarter stays bare lacquer and nashiji.
import {MAT, gardenGround, hill, pond, phoenix, storey, roof, branchPine as pine, bird, rock, suyari} from './vocab.js';

export function kita() {
  const pavilion = [];
  for (let i = 0; i < 3; i++) {
    const eave = -45 - i * 48, w = 94 - i * 17;
    pavilion.push(...storey(`kinkaku-wall-${i}`, -85, eave + 1, eave + 26, w * .73,
      {group: 'kinkaku', order: i * 2, mat: i ? MAT.gold : MAT.lacquer, windowMat: i ? MAT.lacquer : MAT.lamp}));
    pavilion.push(...roof(`kinkaku-roof-${i}`, -85, eave, w, 27,
      {group: 'kinkaku', order: i * 2 + 1, ridgeHalf: w * .48, motionWith: `kinkaku-wall-${i}`}));
  }
  return [
    ...gardenGround('shore-ground', [[-345, -210], [165, -210], [244, -122], [222, -35], [320, 100], [295, 173], [-43, 185], [-155, 145], [-300, 88]]),
    ...hill('far-bank', -270, 115, -213, -164, 12, {amp: .3, mat: MAT.mura}),
    ...pond('kyoko', -5, 68, 244, 82, 3, {reflection: {x: -85, z: 9, width: 78, height: 90}}),
    ...suyari('mist-west', -342, -202, -102, 13, 2),
    ...suyari('mist-east', 105, 342, -195, 14, 7),
    ...rock('shore-stone', -246, 18, 29, 20, 5),
    ...rock('island-stone', 204, 134, 30, 18, 8, {mat: MAT.kirigin}),
    ...pavilion,
    ...phoenix('ho-o', -85, -168, 1, {group: 'kinkaku', order: 6}).map(p => ({...p, motionWith: 'kinkaku-wall-2'})),
    ...pine('island-pine', 171, 97, 124, -15, 6),
    ...pine('west-pine', -291, -28, 114, 12, 2, {clusters: 3}),
    ...bird('uguisu', [[148.36, 45.72, -1, 'island-pine', 10], [-270.03, -74.88, 1, 'west-pine', 10]]),
  ];
}
