// 伏見区・稲荷. A diagonal, not a centre: the great torii in the near corner, the two-storey gate behind it, and
// a line of gates climbing the mountain to the far corner. The fox keeps the other near corner.
// The sky above the gate and the ground between the fox and the climb stay empty nashiji.
import {MAT, hill, suyari, rock, pine, bird, shell, torii, romon, fox, pawPrints, steppingStones} from './vocab.js';

/** Five gates up the slope, each smaller than the one before and clear of its neighbours. */
function climb() {
  // The z intervals clear the full height of the preceding gate, so their x spans can overlap safely.
  const steps = [[14, 144], [76, 62], [132, -12], [181, -78], [224, -136]];
  return steps.flatMap(([x, z], i) => torii(`gate-${i}`, x, z, .74 - i * .075));
}

export function fushimi() {
  return [
    // Layer 0: the mountain the gates climb, a far ridge, and the bank the great torii stands on.
    ...hill('inari-yama', -70, 372, -214, -34, 17, {amp: .85, humps: 2}),
    ...hill('ridge-far', -372, -96, -176, -128, 29, {amp: .3, mat: MAT.nashijiLight, humps: 3}),
    ...hill('bank-near', -372, -128, 152, 218, 41, {amp: .7, mat: MAT.gyobu, humps: 1}),
    ...shell('shell', [[-128, 132, 5, 8], [58, 122, 4.2, 2], [176, 58, 4.6, 5], [268, -12, 4, 3]]),
    // The approach: stones of cut silver under the gates, so the eye climbs with them.
    ...steppingStones('sando', [[-47, 154, 7], [-17, 153, 7], [14, 153, 7], [45, 112, 6.5], [76, 71, 6.5], [104, 34, 6], [132, -3, 6], [158, -36, 5.5], [181, -69, 5.5], [204, -98, 5], [224, -127, 5]]),
    // The fox's own trail, in cut silver, from the gates to its stone.
    ...pawPrints('trail', [[34, 126], [56, 136], [80, 142], [104, 152], [128, 158], [146, 168]]),
    // Slot 1: mist and stones.
    ...suyari('mist-sky', -372, -128, -196, 15, 6),
    ...suyari('mist-gate', -372, -214, -96, 13, 12),
    ...suyari('mist-foot', 78, 336, 92, 14, 4),
    ...rock('rock-a', 96, 192, 28, 18, 4),
    ...rock('rock-b', 10, 174, 24, 16, 9, {mat: MAT.kirigin}),
    // Slot 2: the gates, the fox and the trunks. These stand up from the lid.
    ...torii('torii', -232, 204, 1.22, {cap: true}),
    ...romon('romon', -250, 40, 62),
    ...climb(),
    ...fox('kitsune', 176, 200, -1, 1.5),
    ...pine('pine-a', -100, 214, 100, 16, 3, {clusters: 3}),
    ...pine('pine-b', 288, 206, 112, -14, 6, {clusters: 3}),
    // The bird sits on the crown pad of either pine: on the pad, not above its edge, or it hangs in the air.
    ...bird('uguisu', [[-80, 124.5, 1, 'pine-a'], [270, 103.5, -1, 'pine-b']]),
  ];
}
