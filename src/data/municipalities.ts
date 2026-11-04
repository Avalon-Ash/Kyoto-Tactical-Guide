import type { I18nText, SpotSchema } from '../types';
import { WARD_NAMES } from './wards';

/** Physical municipalities. wardId/areaId remain travel-directory keys. */
export const MUNICIPALITIES: Record<string, { prefecture: I18nText; city: I18nText }> = {
  M_KYOTO: { prefecture: { zh: '京都府', ja: '京都府' }, city: { zh: '京都市', ja: '京都市' } },
  // Verified 2026-11-04: https://otsu-mice.jp/facilities/hieizan-enryaku-ji-temple/
  M_OTSU: { prefecture: { zh: '滋賀縣', ja: '滋賀県' }, city: { zh: '大津市', ja: '大津市' } },
};
export const DEFAULT_MUNICIPALITY = 'M_KYOTO';

export function getSpotLocation(spot: Pick<SpotSchema, 'wardId' | 'municipalityId'>) {
  const id = spot.municipalityId ?? DEFAULT_MUNICIPALITY;
  if (!Object.hasOwn(MUNICIPALITIES, id)) throw new Error(`Unknown municipality: ${id}`);
  const isNearby = id !== DEFAULT_MUNICIPALITY;
  return { id, ...MUNICIPALITIES[id], isNearby,
    ward: isNearby ? undefined : WARD_NAMES[spot.wardId] };
}
