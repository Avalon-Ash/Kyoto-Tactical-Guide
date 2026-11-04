import type { FlatSpot } from '../types';
import { getLatLng, SPOT_POSITIONS } from '../data/map-centers';
import { getSpotLocation } from '../data/municipalities';

/** Nearby municipalities never inherit a Kyoto area-center position. */
export function buildMapClusters(spots: FlatSpot[], activeId: string, areaLabel: (id: string) => string) {
  const groups = new Map<string, FlatSpot[]>();
  for (const spot of spots) {
    const key = getSpotLocation(spot).isNearby ? `spot:${spot.id}` : spot.areaId;
    groups.set(key, [...(groups.get(key) ?? []), spot]);
  }
  return [...groups].map(([key, entries]) => {
    const first = entries[0];
    const nearby = getSpotLocation(first).isNearby;
    const position = nearby ? SPOT_POSITIONS[first.id] : getLatLng(first.areaId, 'ward', activeId);
    if (!position) throw new Error(`Nearby spot requires verified coordinates: ${first.id}`);
    return { key, spots: entries, label: nearby ? first.name : areaLabel(first.areaId),
      pos: [position.lat, position.lng] as [number, number], nearby };
  });
}
