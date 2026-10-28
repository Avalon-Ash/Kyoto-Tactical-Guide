/**
 * ==============================================================================
 * 【系統架構: 動態地圖視覺層】 (Dynamic Spatial Map View)
 * 負責渲染 Leaflet / React-Leaflet 真實地圖與景點資訊叢集的 React 元件。
 *
 * 架構特徵與技術棧：
 * - 真實坐標映射：透過 `src/data/map-centers.ts` SSOT 獲取所有叢集站點/獨立景點的真實經緯度。
 * - 世界遺產與國寶標記 (Landmarks)：具備絕對經緯度（於 `SPOT_POSITIONS` 定義）的重要名勝，
 *   會特別渲染為「地標圖示加名稱 (Icon + Name)」 SVG 標記，而非一般的群集點。
 * - OSM GeoJSON 邊界：使用 src/data/geo/ward-boundaries.ts 靜態邊界（scripts/fetch-ward-geo.mjs 產生），並自動適應縮放。
 * - 響應式日夜主題：日輪使用 OSM 標準圖磚；夜巡同樣使用 OSM 圖磚，再以 CSS 濾鏡 (`.map-tiles-night`)
 *   轉為暗色漆黑調（CARTO dark_all 已要求 API key，故不再使用）。
 * - UX 體驗：自定義 Marker 繪製數量群集標籤，點擊 Marker 後從下方滑出該區景點詳細列表，
 *   並支援單一卡片快速導航與 Google Maps API 深度整合。
 * ==============================================================================
 */
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { getLatLng, SPOT_POSITIONS } from '../data/map-centers';
import { AREA_NAMES } from '../data/index';
import { WARD_BOUNDARIES } from '../data/geo/ward-boundaries';
import { MapPin, Navigation, Eye, Moon, Sun, X, ChevronDown } from 'lucide-react';
import { SpotCard, buildGoogleMapsUrl } from './SpotCard';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, GeoJSON, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { createOutsideMask } from '../lib/map-geometry';
import { placeMapLabels, mapLabelWidth, escapeMapLabel } from '../lib/map-labels';
import { toChineseNumerals } from '../lib/numerals';
import 'leaflet/dist/leaflet.css';

interface ClusterMapProps {
  engine: ReturnType<typeof useKyotoEngine>;
  width: number;
}

const MapController = ({ center, bounds }: { center: [number, number], bounds?: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { animate: !reducedMotion, padding: [40, 40] });
    } else {
      map.setView(center, map.getZoom(), { animate: !reducedMotion });
    }
  }, [bounds, center, map, reducedMotion]);

  return null;
};

const createClusterIcon = (count: number, label: string, selected: boolean, dx: number, dy: number) => {
  const width = mapLabelWidth(label);
  return L.divIcon({
    html: `<div class="map-cluster ${selected ? 'is-selected' : ''}"><span class="map-cluster-seal">${toChineseNumerals(count)}</span><span class="map-marker-caption">${escapeMapLabel(label)}</span></div>`,
    className: 'map-cluster-icon', iconSize: [width, 70], iconAnchor: [width / 2 - dx, 22 - dy],
  });
};

const createLandmarkIcon = (label: string, theme: 'light' | 'dark', dx: number, dy: number) => {
  const width = mapLabelWidth(label);
  return L.divIcon({
    html: `<div class="map-landmark ${theme === 'dark' ? 'is-night' : ''}" title="${escapeMapLabel(label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12,2L5,6V7H19V6L12,2M8,8V12H16V8H8M4,13V14H20V13H4M6,15V19H18V15H6M3,20V22H21V20H3Z" /></svg><span>${escapeMapLabel(label)}</span></div>`,
    className: 'map-landmark-icon', iconSize: [width, 44], iconAnchor: [width / 2 - dx, 22 - dy],
  });
};

type MapCluster = { key: string; label: string; pos: [number, number]; spots: { id: string }[] };
type MapLandmark = { id: string; name: string; pos: [number, number] };
function MapMarkers({ clusters, landmarks, selected, theme, onSelect }: {
  clusters: MapCluster[]; landmarks: MapLandmark[]; selected: string | null;
  theme: 'light' | 'dark'; onSelect: (key: string) => void;
}) {
  const [, setRevision] = useState(0);
  const map = useMapEvents({
    zoomend: () => setRevision(v => v + 1), moveend: () => setRevision(v => v + 1), resize: () => setRevision(v => v + 1),
  });
  const entries = [
    ...landmarks.map(spot => ({ id: `landmark-${spot.id}`, pos: spot.pos, label: spot.name, height: 44 })),
    ...clusters.map(cluster => ({ id: `cluster-${cluster.key}`, pos: cluster.pos, label: cluster.label, height: 70 })),
  ];
  const size = map.getSize();
  const placements = placeMapLabels(entries.map(entry => {
    const point = map.latLngToContainerPoint(entry.pos);
    return { id: entry.id, x: point.x, y: point.y, width: mapLabelWidth(entry.label), height: entry.height, anchorY: 22 };
  }), size.x, size.y);
  return <>
    {entries.map(entry => {
      const { dx, dy } = placements[entry.id];
      if (Math.abs(dx) + Math.abs(dy) < 2) return null;
      const anchor = map.latLngToContainerPoint(entry.pos);
      const target = map.containerPointToLatLng([anchor.x + dx, anchor.y + dy]);
      return <React.Fragment key={`leader-${entry.id}`}>
        <Polyline positions={[entry.pos, target]} interactive={false} pathOptions={{ color: theme === 'dark' ? '#e6c27a' : '#6d532b', weight: 1, opacity: 0.7, dashArray: '3, 4' }} />
        <CircleMarker center={entry.pos} radius={2.5} interactive={false} pathOptions={{ color: '#b1352b', weight: 1, fillOpacity: 1 }} />
      </React.Fragment>;
    })}
    {landmarks.map(spot => {
      const { dx, dy } = placements[`landmark-${spot.id}`];
      return <Marker key={`landmark-${spot.id}`} position={spot.pos} icon={createLandmarkIcon(spot.name, theme, dx, dy)} interactive={false} keyboard={false} />;
    })}
    {clusters.map(cluster => {
      const { dx, dy } = placements[`cluster-${cluster.key}`];
      return <Marker key={cluster.key} position={cluster.pos} title={`${cluster.label} (${cluster.spots.length})`}
        icon={createClusterIcon(cluster.spots.length, cluster.label, selected === cluster.key, dx, dy)}
        eventHandlers={{
          click: () => onSelect(cluster.key),
          keydown: event => {
            const key = event.originalEvent.key;
            if (key === 'Enter' || key === ' ') {
              event.originalEvent.preventDefault();
              onSelect(cluster.key);
            }
          },
        }} />;
    })}
  </>;
}

export const ClusterMap: React.FC<ClusterMapProps> = ({ engine, width }) => {
  const { lang, mode, activeId, filteredSpots, t } = engine;
  const reducedMotion = useReducedMotion();
  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(null);
  // 切換行政區／分區時關閉面板。
  useEffect(() => {
    setSelectedClusterKey(null);
  }, [activeId, mode]);

  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light');
  const geoJsonData = useMemo(
    () => mode === 'ward' && activeId ? WARD_BOUNDARIES[activeId] ?? null : null,
    [mode, activeId]
  );
  const outsideMask = useMemo(() => createOutsideMask(geoJsonData), [geoJsonData]);
  const dynamicBounds = useMemo<L.LatLngBoundsExpression | null>(() => {
    if (!geoJsonData) return null;
    const bounds = L.geoJSON(geoJsonData).getBounds();
    return bounds.isValid() ? bounds : null;
  }, [geoJsonData]);

  const clusters = useMemo(() => {
    // 統一所有模式皆以「微觀分區 (areaId)」為單位進行叢集。
    // 因為在缺乏全部精確坐標的情況下，散佈單一景點沒有意義。
    const groups: Record<string, typeof filteredSpots> = {};
    filteredSpots.forEach(spot => {
      if (!groups[spot.areaId]) groups[spot.areaId] = [];
      groups[spot.areaId].push(spot);
    });

    return Object.entries(groups).map(([areaId, spots]) => {
      const { lat, lng } = getLatLng(areaId, 'ward', activeId as string);
      return {
        key: areaId,
        label: t(areaId, AREA_NAMES),
        pos: [lat, lng] as [number, number],
        spots
      };
    });
  }, [mode, activeId, filteredSpots, lang, t]);

  // 篩選後叢集消失時清除選取，避免空面板殘留。
  useEffect(() => {
    if (selectedClusterKey && !clusters.some(cluster => cluster.key === selectedClusterKey)) {
      setSelectedClusterKey(null);
    }
  }, [clusters, selectedClusterKey]);

  const landmarks = useMemo(() => {
    return filteredSpots
      .filter(spot => SPOT_POSITIONS[spot.id])
      .map(spot => ({
        ...spot,
        pos: [SPOT_POSITIONS[spot.id].lat, SPOT_POSITIONS[spot.id].lng] as [number, number]
      }));
  }, [filteredSpots]);

  const selectedSpots = useMemo(() => {
    return clusters.find(c => c.key === selectedClusterKey)?.spots || [];
  }, [clusters, selectedClusterKey]);

  // Center map on average or default Kyoto
  const mapCenter = useMemo<[number, number]>(() => {
    if (clusters.length === 0) return [35.00, 135.74];
    const avgLat = clusters.reduce((s, c) => s + c.pos[0], 0) / clusters.length;
    const avgLng = clusters.reduce((s, c) => s + c.pos[1], 0) / clusters.length;
    return [avgLat, avgLng];
  }, [clusters]);

  const effectiveBounds = useMemo<L.LatLngBoundsExpression | null>(() => {
    if (dynamicBounds) return dynamicBounds;
    if (clusters.length > 0) {
      const lats = clusters.map(c => c.pos[0]);
      const lngs = clusters.map(c => c.pos[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      if (minLat !== maxLat && minLng !== maxLng) {
        return [[minLat, minLng], [maxLat, maxLng]];
      }
    }
    return null;
  }, [dynamicBounds, clusters]);

  // 日夜共用 OSM 圖磚；夜巡由 TileLayer className 套用 CSS 濾鏡轉暗
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] bg-[#0a0a0a] rounded-xl border border-gold/20 overflow-hidden flex flex-col shadow-2xl">
      <div className="absolute top-4 right-4 z-[400] flex gap-2">
        <button
          onClick={(e) => {
             e.preventDefault();
             setMapTheme(prev => prev === 'light' ? 'dark' : 'light');
          }}
          className="bg-black/70 backdrop-blur border border-gold/30 text-gold-light p-2 rounded tracking-widest font-serif text-xs px-3 hover:bg-gold/20 transition flex items-center gap-2 cursor-pointer pointer-events-auto shadow-lg"
        >
          {mapTheme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          {mapTheme === 'light' ? t('map_night') : t('map_day')}
        </button>
      </div>

      <div className="relative flex-1 z-0 bg-[#0a0a0a]">
        <MapContainer 
          center={mapCenter} 
          zoom={12.5} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', background: mapTheme === 'dark' ? '#0a0a0a' : '#f0f0f0' }}
        >
          <TileLayer
            key={mapTheme}
            url={tileUrl}
            attribution={attribution}
            className={mapTheme === 'dark' ? 'map-tiles-night' : 'map-tiles-day'}
          />
          <MapController center={mapCenter} bounds={effectiveBounds} />
          
          {outsideMask && (
            <GeoJSON key={`mask-${activeId}`} data={outsideMask} interactive={false}
              style={{ className: 'ward-outside-mask', stroke: false, fillColor: mapTheme === 'dark' ? '#000' : '#302c20', fillOpacity: mapTheme === 'dark' ? 0.6 : 0.35, fillRule: 'evenodd' }} />
          )}
          {geoJsonData && <>
            <GeoJSON key={`halo-${activeId}`} data={geoJsonData} interactive={false}
              style={{ className: 'ward-boundary-halo', color: '#c8a04a', weight: 7, opacity: 0.3, fill: false }} />
            <GeoJSON key={`line-${activeId}`} data={geoJsonData} interactive={false}
              style={{ className: 'ward-boundary-line', color: '#e6c27a', weight: 1.5, opacity: 0.95, fill: false }} />
          </>}

          <MapMarkers clusters={clusters} landmarks={landmarks} selected={selectedClusterKey}
            theme={mapTheme} onSelect={setSelectedClusterKey} />
        </MapContainer>

        {clusters.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
            <div className="bg-black/60 px-6 py-3 rounded-full backdrop-blur-sm border border-gold/20 text-gold-light">
              <span className="font-serif tracking-[0.3em] font-medium">{t('empty_msg') || '該區域尚無資料'}</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedClusterKey && (
          <motion.div 
            initial={reducedMotion ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 top-auto bg-[#0d0a07]/95 backdrop-blur-xl border-t border-gold/30 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] px-4 max-h-full flex flex-col z-[500] shadow-[0_-20px_50px_rgba(0,0,0,0.6)]"
          >
            <div className="flex justify-between items-start sm:items-center mb-4 shrink-0 px-2 gap-4">
               <div className="text-sm font-serif text-gold-light/60 tracking-widest uppercase flex items-center gap-2 flex-wrap">
                 <MapPin size={16} className="text-shuiro shrink-0" />
                 <span>{clusters.find(c => c.key === selectedClusterKey)?.label} ({selectedSpots.length})</span>
               </div>
               <button 
                 onClick={() => setSelectedClusterKey(null)}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 text-gold-light/70 hover:text-white hover:bg-shuiro/80 transition-all rounded-full border border-gold/20 hover:border-shuiro text-xs font-serif tracking-widest uppercase cursor-pointer shrink-0"
               >
                 {t('btn_back_map')} <ChevronDown size={14} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 px-2 pb-4 pointer-events-auto">
              {selectedSpots.map(spot => (
                <div key={spot.id} className="relative group/spot">
                  <SpotCard spot={spot} lang={lang} t={t} readOnly />
                  {/* Google Maps floating action over the card */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <a 
                      href={buildGoogleMapsUrl(spot)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 rounded-full border border-gold/40 bg-black/80 text-[#1A73E8] backdrop-blur shadow-lg hover:scale-110 hover:bg-[#1A73E8] hover:text-white transition-all group/nav"
                      onClick={e => e.stopPropagation()}
                      title="Google Maps"
                    >
                     <Navigation size={16} className="fill-current" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
