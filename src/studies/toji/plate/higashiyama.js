// 東山区・清水. One mass held in the air: the hall and its stage on a lattice over the drop, Otowa behind it,
// maples in the valley. The left third is the drop itself: empty ground, a far ridge and a thread of water.
import {MAT, hill, stream, suyari, rock, hall, bird, shell, kakezukuri, maple, fallenLeaves} from './vocab.js';

export function higashiyama() {
  return [
    // Layer 0: the mountain behind the hall, the slope the lattice stands on, a far ridge, and the water.
    ...hill('otowa', -150, 372, -218, -92, 13, {amp: .8, humps: 2}),
    ...hill('slope', -70, 372, 84, 176, 27, {amp: .7, mat: MAT.gyobu, humps: 1}),
    ...hill('ridge-west', -372, -176, -150, -108, 35, {amp: .32, mat: MAT.nashijiLight, humps: 3}),
    ...stream('otowa-water', [[-80, 138], [-150, 156], [-222, 176], [-284, 204], [-330, 238]], [5, 8, 12, 17, 24]),
    ...shell('shell', [[-118, 146, 4, 2], [-196, 166, 4.8, 5], [-262, 192, 5.4, 8]]),
    // Fallen leaves of cut gold and silver drift from the maples down the valley toward the water.
    ...fallenLeaves('momiji', -60, 192, 240, 34, 30, 7),
    // Slot 1: mist and stones.
    ...suyari('mist-drop', -372, -84, 34, 16, 5),
    ...suyari('mist-sky', -350, -130, -200, 14, 11),
    ...suyari('mist-east', 236, 372, -158, 12, 8),
    ...rock('rock-a', -10, 150, 30, 20, 5),
    ...rock('rock-b', 262, 176, 34, 22, 7, {mat: MAT.kirigin}),
    // Slot 2: the stage. Lattice, deck, hall and roof are one solid standing on the lattice's foot.
    ...kakezukuri('butai', -40, 252, -8, 104, {posts: 8}),
    ...hall('hondo', 106, -44, 132, 60, {wallH: 33, bays: 9, group: 'butai', order: 2}),
    ...maple('maple-a', -134, 216, 96, 10, 2),
    ...maple('maple-b', 150, 218, 78, -8, 9),
    ...maple('maple-c', 316, 122, 72, -6, 4),
    ...bird('uguisu', [[-128, 140, 1, 'maple-a'], [314, 66, -1, 'maple-c']]),
  ];
}
