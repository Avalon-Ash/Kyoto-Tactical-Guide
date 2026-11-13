// Borrowed scenery in three depths: the near hall looks across a broad pond to rocks and a distant ridge.
// The empty foreground below the hall lets the eye cross the water before climbing into the mountain.
import {MAT, gardenGround, hill, pond, hall, branchPine as pine, branchMaple as maple, fallenLeaves, bird, rock, suyari} from './vocab.js';

export function ukyo() {
  return [
    ...gardenGround('hojo-bank', [[-330, -192], [-82, -204], [-38, -25], [-44, 110], [-315, 128]]),
    ...hill('arashiyama', -35, 355, -215, -96, 6, {amp: .65, humps: 3}),
    ...hill('west-ridge', -350, -80, -192, -133, 2, {amp: .3, mat: MAT.nashijiLight}),
    ...pond('sogen', 143, 49, 160, 115, 5),
    ...fallenLeaves('near-leaves', 238, 196, 96, 26, 14, 4),
    ...suyari('mist-ridge', -330, -107, -201, 12, 4),
    ...suyari('mist-pond', 45, 235, -123, 12, 8),
    ...suyari('mist-near', -310, -115, 157, 14, 3),
    ...rock('dragon-stone', 65, -55, 38, 22, 3),
    ...rock('shore-stone', 140, -48, 24, 20, 7, {mat: MAT.kirigin}),
    ...hall('hojo', -164, 48, 128, 54, {wallH: 34, bays: 9}),
    ...pine('west-pine', -289, -61, 104, 12, 2, {clusters: 3}),
    ...pine('ridge-pine', 263, -67, 98, -12, 6, {clusters: 3}),
    ...maple('near-maple', 272, 214, 104, -8, 9),
    ...bird('uguisu', [[-268.38, -103.48, 1, 'west-pine', 10], [298.77, 161.54, -1, 'near-maple', 12]]),
  ];
}
