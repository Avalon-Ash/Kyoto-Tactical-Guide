// Six modest roofs descend in a goose-flight staircase, each with its own clear interval; there is no keep.
// The cusped gate anchors the open left court, while the masonry and moat underline the entire procession.
import {MAT, gardenGround, hall, karamon, moatWall, pine, bird, rock, suyari} from './vocab.js';

export function nakagyo() {
  const rooms = [[-248, -172, 62], [-161, -110, 64], [-74, -48, 66], [13, 14, 62], [100, 76, 58], [187, 138, 58]];
  return [
    ...gardenGround('palace-ground', [[-340, -214], [80, -214], [168, -97], [340, -12], [340, 189], [30, 189], [-138, 71], [-340, -34]], {mat: MAT.gyobu, amp: .16}),
    ...suyari('mist-court', -205, 15, -212, 11, 8),
    ...suyari('mist-east', 140, 337, 10, 12, 5),
    ...suyari('mist-gate', -344, -234, 125, 11, 2),
    ...moatWall('ishigaki', -333, 333, 201, 218, 232),
    ...rock('garden-stone', 294, 88, 25, 18, 4, {mat: MAT.kirigin}),
    ...rooms.flatMap(([x, z, w], i) => hall(`ninomaru-${i}`, x, z, w, 22, {wallH: 22, bays: 5})),
    ...karamon('karamon', -172, 184, 69),
    ...pine('west-pine', -305, 62, 99, 12, 2, {clusters: 3}),
    ...pine('east-pine', 282, -79, 112, -12, 6, {clusters: 3}),
    ...bird('uguisu', [[-291, -28, 1, 'west-pine', 22], [267, -176, -1, 'east-pine', 22]]),
  ];
}
