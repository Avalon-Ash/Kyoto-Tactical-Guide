// An axial ascent: stone treads lead through an open gate to the hall, held between two large maple crests.
// The lower outer corners are empty ground; the mist cuts across the ridge rather than across the stair.
import {MAT, gardenGround, hill, hall, sanmon, stoneSteps, lantern, maple, fallenLeaves, bird, rock, suyari} from './vocab.js';

export function yamashina() {
  return [
    ...gardenGround('mountain-ground', [[-320, -190], [312, -190], [323, 42], [174, 131], [88, 211], [-54, 211], [-141, 128], [-325, 37]], {amp: .35}),
    ...hill('mountain', -189, 232, -214, -137, 2, {amp: .5, humps: 3}),
    ...stoneSteps('climb', 20, 42, 211, 36, 73, 12),
    ...fallenLeaves('west-leaves', -236, 150, 92, 52, 16, 3),
    ...fallenLeaves('east-leaves', 252, 132, 84, 50, 14, 8),
    ...suyari('mist-west', -340, -163, -169, 13, 4),
    ...suyari('mist-east', 167, 339, -117, 12, 9),
    ...hall('honden', 20, -122, 112, 43, {wallH: 31}),
    ...sanmon('sanmon', 20, 40, 73),
    ...lantern('west-lantern', -114, 151, .9),
    ...lantern('east-lantern', 154, 151, .9),
    ...maple('west-maple', -252, 113, 135, 10, 2),
    ...maple('east-maple', 274, 89, 111, -8, 9),
    ...rock('west-stone', -231, 185, 27, 20, 5),
    ...rock('east-stone', 272, 178, 24, 18, 7, {mat: MAT.kirigin}),
    ...bird('uguisu', [[-240, 4, 1, 'west-maple', 20], [268, -1, -1, 'east-maple', 20]]),
  ];
}
