// 南区・東寺. A composition, not a survey: the pagoda on its bank, the hall half lost in mist,
// a stream between two banks, pines in the foreground. A third of the ground stays empty nashiji.
import {MAT, hill, stream, suyari, rock, pagoda, hall, pine, bird, shell} from './vocab.js';

export function minami() {
  return [
    // Layer 0: the ground itself — banks and water. It swells, it does not stand.
    ...hill('bank-far', -360, -70, -168, -112, 11, {amp: .34, mat: MAT.nashijiLight, humps: 3}),
    ...hill('bank-left', -372, -52, 92, 214, 23, {amp: .8}),
    ...hill('bank-right', 44, 372, 118, 214, 31, {amp: .7, mat: MAT.gyobu, humps: 1}),
    ...stream('stream', [[-8, -150], [22, -70], [-30, 20], [14, 110], [-26, 232]], [7, 11, 17, 25, 36]),
    ...shell('shell', [[14, -44, 4.2, 2], [-22, 34, 5, 5], [6, 96, 4.4, 8], [-12, 168, 5.6, 3]]),
    // Slot 1: mist and stones.
    ...suyari('mist-hall', -360, -18, -34, 17, 5),
    ...suyari('mist-sky', 196, 372, -186, 15, 9),
    ...suyari('mist-far', -372, -210, -206, 13, 14),
    ...rock('rock-a', 62, 62, 34, 22, 3),
    ...rock('rock-b', -44, 112, 27, 18, 8, {mat: MAT.kirigin}),
    ...rock('rock-c', 48, 178, 38, 24, 6),
    // Slot 2: the hall, the pagoda and the trunks. These stand up from the lid.
    ...hall('kondo', -150, -72, 104, 44),
    ...pagoda('pagoda', 176, 128),
    ...pine('pine-a', -288, 172, 150, 26, 2),
    ...pine('pine-b', -134, 190, 104, -18, 7, {clusters: 3}),
    ...pine('pine-c', 300, 150, 96, -14, 5, {clusters: 3}),
    // Slot 3 holds the foliage pads (from pine). The bird's two perches ride on their pines but are painted in
    // slot 1, clear of the stones and the mist, so the pad under a sleeping bird stays whole.
    ...bird('uguisu', [[-240, 84, 1, 'pine-a'], [-112, 122, -1, 'pine-b']]),
  ];
}
