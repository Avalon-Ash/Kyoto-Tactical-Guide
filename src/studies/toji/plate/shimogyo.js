// Unequal twin roofs share a long baseline and a small connecting gallery, answered by a great fan-leaved tree.
// The foreground between ginkgo and pine is an unpainted court; the back wall supplies a quiet horizontal limit.
import {MAT, gardenGround, hall, corridor, ginkgo, pine, bird, rock, suyari} from './vocab.js';

export function shimogyo() {
  return [
    ...gardenGround('temple-court', [[-310, -212], [310, -212], [327, 60], [168, 95], [-108, 98], [-318, 62]], {amp: .12}),
    ...suyari('mist-west', -338, -171, -127, 12, 4),
    ...suyari('mist-east', 122, 329, 93, 15, 8),
    ...corridor('back-wall', -290, 290, -181, {open: false, height: 16}),
    ...hall('amidado', -154, -65, 101, 43, {wallH: 26, group: 'twin-halls'}),
    ...hall('goeido', 128, -80, 135, 59, {wallH: 41, bays: 9, group: 'twin-halls'}),
    ...corridor('watari', -62, 32, -39, {height: 17, group: 'twin-halls'}),
    ...ginkgo('great-ginkgo', -224, 198, 139),
    ...pine('east-pine', 284, 201, 112, -12, 6, {clusters: 3}),
    ...rock('ginkgo-stone', -104, 206, 21, 17, 4),
    ...rock('east-stone', 173, 178, 23, 16, 7, {mat: MAT.kirigin}),
    ...bird('uguisu', [[269, 104, -1, 'east-pine', 22], [-222, 66, 1, 'great-ginkgo', 22]]),
  ];
}
