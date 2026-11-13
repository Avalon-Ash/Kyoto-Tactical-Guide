// A ceremonial enclosure around a white court: the broad hall is its head and low galleries its open arms.
// Blossom and citrus face across the court; the bare outer rim and open entrance keep the enclosure breathing.
import {MAT, gardenGround, hall, sandGarden, corridor, courtTree, petals, fruits, pine, bird, rock, suyari} from './vocab.js';

export function kamigyo() {
  return [
    ...gardenGround('court-surround', [[-315, -186], [315, -186], [309, 136], [260, 188], [-260, 188], [-309, 136]], {amp: .12}),
    ...sandGarden('nantei', -154, 154, -37, 142, {raked: false, mat: MAT.silver}),
    ...suyari('mist-west', -338, -185, -199, 12, 3),
    ...suyari('mist-east', 157, 337, -177, 13, 8),
    ...rock('west-stone', -320, 159, 18, 15, 6),
    ...rock('east-stone', 308, 162, 21, 16, 2, {mat: MAT.kirigin}),
    ...hall('shishinden', 0, -106, 153, 59, {wallH: 38, bays: 9}),
    ...corridor('west-gallery', -293, -181, 44, {height: 27}),
    ...corridor('east-gallery', 181, 293, 44, {height: 27}),
    ...corridor('south-west', -264, -57, 167, {height: 22}),
    ...corridor('south-east', 57, 264, 167, {height: 22}),
    ...petals('sakura-fall', -86, 96, 56, 26, 18, 4),
    ...fruits('tachibana-fall', 94, 92, 40, 16, 7, 9),
    ...courtTree('sakon-sakura', -91, 73, 89),
    ...courtTree('ukon-tachibana', 91, 73, 79, {citrus: true}),
    ...pine('west-pine', -292, -84, 99, 12, 2, {clusters: 3}),
    ...pine('east-pine', 285, -83, 99, -12, 6, {clusters: 3}),
    ...bird('uguisu', [[-278, -174, 1, 'west-pine', 22], [-94, 2, -1, 'sakon-sakura', 20]]),
  ];
}
