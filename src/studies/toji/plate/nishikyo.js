// A low shoreline of separate rooms, with an open bamboo deck reaching into the pond like a comma.
// A loose arc of inlaid stones approaches from the left; the upper-right sky and near centre remain empty.
import {MAT, gardenGround, pond, hall, moonDeck, steppingStones, lantern, pine, bird, rock, suyari} from './vocab.js';

export function nishikyo() {
  return [
    ...gardenGround('garden-bank', [[-340, -195], [35, -195], [222, -75], [328, -126], [342, -10], [220, 126], [-215, 172], [-340, 120]], {mat: MAT.gyobu, amp: .18}),
    ...pond('garden-pond', 15, 81, 217, 71, 7),
    ...suyari('mist-sky', -300, -72, -201, 13, 9),
    ...suyari('mist-bank', 102, 321, 24, 12, 3),
    ...rock('east-stone', 312, 182, 22, 17, 7, {mat: MAT.kirikane}),
    ...hall('old-shoin', -205, -99, 80, 33, {wallH: 27, group: 'old-shoin'}),
    ...hall('middle-shoin', -18, -65, 75, 31, {wallH: 25}),
    ...hall('new-shoin', 144, -29, 62, 29, {wallH: 24}),
    ...moonDeck('tsukimi', -277, -115, -74, -44, {group: 'old-shoin', order: 2}),
    ...steppingStones('approach', [[-210, 114, 11], [-178, 129, 12], [-145, 140, 11], [-110, 146, 12], [-74, 148, 11]]),
    ...lantern('shore-lantern', 246, 171, .9),
    ...pine('near-pine', -291, 183, 99, 12, 2, {clusters: 3}),
    ...pine('far-pine', 286, -60, 112, -12, 6, {clusters: 3}),
    ...bird('uguisu', [[-277, 93, 1, 'near-pine', 22], [271, -157, -1, 'far-pine', 22]]),
  ];
}
