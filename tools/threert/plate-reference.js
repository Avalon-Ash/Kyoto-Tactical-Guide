// ThreeRT reference scene for the Kyoto Bunko makie plate (docs/MAKIE_THREERT_REFERENCE.md).
// The plate comes from the site's dev export (?three=1&export=glb) as assets/kyoto-<ward>.glb; this file only adds a
// table, a window, a fill and the site's camera angle, so the path-traced frame can be laid beside the site's frame.
// Not part of the site: it runs in a ThreeRT project (`threert create`), and is plain JS so the site's tsc skips it.
import { Scene, PerspectiveCamera, Mesh, PlaneGeometry, MeshStandardMaterial, RectAreaLight, SkyColor, GLTFModel, Color } from "@threert/scene";

const WARD = "W_MINAMI";
const UNIT = 0.45 / 720;                              // the lid is 45 cm wide, about the Hatsune stationery box
const EYE = [430, 720, 920], TARGET = [0, 40, 0];     // the site's camera (three-renderer.js)
const KEY = [-0.5, 0.78, 0.22];                       // the site's key light direction
const BOTTOM = -94;                                   // the box's foot, plate units (renderer.js buildBox)

const normalize = v => { const l = Math.hypot(...v); return v.map(x => x / l); };

export default function build() {
  const scene = new Scene();
  // A dim warm room: polished lacquer mirrors its surroundings, so the room must not be a white sky.
  scene.environment = new SkyColor(0xfff1e0, 60);

  const plate = new GLTFModel(`assets/kyoto-${WARD}.glb`);
  plate.scale.set(UNIT, UNIT, UNIT);
  scene.add(plate);

  const table = new Mesh(new PlaneGeometry(4, 4), new MeshStandardMaterial({ name: "table", color: 0x2a1c14, roughness: 0.55 }));
  table.rotation.x = -Math.PI / 2;
  table.position.y = BOTTOM * UNIT;
  scene.add(table);

  // The window: a soft panel along the site's key direction, 1.2 m from the box.
  const k = normalize(KEY);
  const window_ = new RectAreaLight(new Color().setRGB(1.0, 0.95, 0.88), 6000, 0.9, 0.6);
  window_.name = "window";
  window_.position.set(k[0] * 1.2, k[1] * 1.2, k[2] * 1.2);
  window_.lookAt(0, 0, 0);
  window_.card = false;
  scene.add(window_);

  // A faint fill from the viewer's side, so the shaded faces are not black.
  const d = normalize(EYE.map((v, i) => v - TARGET[i]));
  const fill = new RectAreaLight(new Color().setRGB(0.9, 0.93, 1.0), 500, 1.4, 0.9);
  fill.name = "fill";
  fill.position.set(d[0] * 2, d[1] * 2, d[2] * 2);
  fill.lookAt(0, 0, 0);
  fill.card = false;
  scene.add(fill);

  // Far along the site's view direction with a narrow lens: close to the site's orthographic view.
  const dist = 4, centre = TARGET.map(v => v * UNIT);
  const camera = new PerspectiveCamera((2 * Math.atan(0.22 / dist) * 180) / Math.PI, 16 / 9, 0.5, 20);
  camera.name = "camera";
  camera.position.set(centre[0] + d[0] * dist, centre[1] + d[1] * dist, centre[2] + d[2] * dist);
  camera.lookAt(centre[0], centre[1], centre[2]);
  scene.add(camera);
  return { scene, camera, options: { name: `kyoto-${WARD}` } };
}
