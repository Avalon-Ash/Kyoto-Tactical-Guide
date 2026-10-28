import type { FeatureCollection, Polygon } from 'geojson';
import type { WardGeometry } from '../data/geo/ward-boundaries';

/** Complement for validated, disjoint ward polygons. Interior holes remain masked. */
export function createOutsideMask(geometry: WardGeometry | null): FeatureCollection<Polygon> | null {
  if (!geometry) return null;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [world, ...polygons.map(rings => rings[0])] } },
      ...polygons.flatMap(rings => rings.slice(1).map(hole => ({
        type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [hole] },
      }))),
    ],
  };
}
