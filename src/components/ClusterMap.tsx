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
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { SPOT_POSITIONS } from '../data/map-centers';
import { AREA_NAMES } from '../data/index';
import { WARD_BOUNDARIES } from '../data/geo/ward-boundaries';
import { MapPin, ChevronDown, Plus, Minus, LocateFixed } from 'lucide-react';
import { SpotCard } from './SpotCard';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, GeoJSON, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { createOutsideMask } from '../lib/map-geometry';
import { placeMapLabels, mapLabelWidth, escapeMapLabel } from '../lib/map-labels';
import { toChineseNumerals } from '../lib/numerals';
import { buildMapClusters } from '../lib/map-clusters';
import 'leaflet/dist/leaflet.css';

interface ClusterMapProps {
  engine: ReturnType<typeof useKyotoEngine>;
  night: boolean;
  paused: boolean;
}

/** Leaflet paints with literal colours; these mirror the --hira-gold / --entry-accent tokens in theme.css. */
const MAP_PALETTE = {
  light: { line: '#80602e', halo: '#a98545', leader: '#6d532b', anchor: '#94482d', mask: '#302c20', maskOpacity: .35, ground: '#eee8db' },
  dark: { line: '#d2bb89', halo: '#a98545', leader: '#d2bb89', anchor: '#e0a28a', mask: '#000', maskOpacity: .6, ground: '#1b2228' },
} as const;

/** Stable identity for a view target, so re-renders (selection, theme) never snap the reader's pan and zoom back. */
function viewKey(center: [number, number], bounds: L.LatLngBoundsExpression | null) {
  return bounds ? (bounds instanceof L.LatLngBounds ? bounds : L.latLngBounds(bounds as L.LatLngBoundsLiteral)).toBBoxString() : center.join(',');
}

const MapController = ({ center, bounds, reduced }: { center: [number, number], bounds: L.LatLngBoundsExpression | null, reduced: boolean }) => {
  const map = useMap();
  const latest = useRef({ center, bounds, reduced });
  latest.current = { center, bounds, reduced };
  const key = viewKey(center, bounds);
  useEffect(() => {
    const { center, bounds, reduced } = latest.current;
    if (bounds) map.fitBounds(bounds, { animate: !reduced, padding: [40, 40] });
    else map.setView(center, map.getZoom(), { animate: !reduced });
  }, [key, map]);
  return null;
};

function MapControls({center,bounds,reduced,t}: {center:[number,number];bounds:L.LatLngBoundsExpression|null;reduced:boolean;t:(key:string)=>string}) {
  const map=useMap();
  const controls=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(controls.current){L.DomEvent.disableClickPropagation(controls.current);L.DomEvent.disableScrollPropagation(controls.current);}},[]);
  return <div className="map-controls" ref={controls}>
    <button type="button" className="ui-button icon-button" aria-label={t('map_zoom_in')} title={t('map_zoom_in')} onClick={()=>map.zoomIn(undefined,{animate:!reduced})}><Plus size={18}/></button>
    <button type="button" className="ui-button icon-button" aria-label={t('map_zoom_out')} title={t('map_zoom_out')} onClick={()=>map.zoomOut(undefined,{animate:!reduced})}><Minus size={18}/></button>
    <button type="button" className="ui-button icon-button" aria-label={t('map_fit')} title={t('map_fit')} onClick={()=>bounds?map.fitBounds(bounds,{padding:[40,40],animate:!reduced}):map.setView(center,12,{animate:!reduced})}><LocateFixed size={18}/></button>
  </div>;
}

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
        <Polyline positions={[entry.pos, target]} interactive={false} pathOptions={{ color: MAP_PALETTE[theme].leader, weight: 1, opacity: 0.7, dashArray: '3, 4' }} />
        <CircleMarker center={entry.pos} radius={2.5} interactive={false} pathOptions={{ color: MAP_PALETTE[theme].anchor, weight: 1, fillOpacity: 1 }} />
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

export const ClusterMap: React.FC<ClusterMapProps> = ({ engine, night, paused }) => {
  const { lang, mode, activeId, filteredSpots, t } = engine;
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = systemReducedMotion || paused;
  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(null);
  // 切換行政區／分區時關閉面板。
  useEffect(() => {
    setSelectedClusterKey(null);
  }, [activeId, mode]);

  const mapTheme = night ? 'dark' : 'light';
  const palette = MAP_PALETTE[mapTheme];
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const selectCluster = (key: string) => { openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setSelectedClusterKey(key); };
  const closePanel = () => { setSelectedClusterKey(null); };
  useEffect(() => {
    if(selectedClusterKey) panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    else openerRef.current?.focus();
  }, [selectedClusterKey]);
  const geoJsonData = useMemo(
    () => mode === 'ward' && activeId ? WARD_BOUNDARIES[activeId] ?? null : null,
    [mode, activeId]
  );
  const dynamicBounds = useMemo<L.LatLngBoundsExpression | null>(() => {
    if (!geoJsonData) return null;
    const bounds = L.geoJSON(geoJsonData).getBounds();
    return bounds.isValid() ? bounds : null;
  }, [geoJsonData]);

  const clusters = useMemo(() => buildMapClusters(filteredSpots, activeId ?? '', id => t(id, AREA_NAMES)), [activeId, filteredSpots, t]);
  const nearbyClusters = useMemo(() => clusters.filter(cluster => cluster.nearby), [clusters]);
  // Keep the Kyoto boundary, but do not dim legitimate nearby-city destinations.
  const outsideMask = useMemo(() => nearbyClusters.length ? null : createOutsideMask(geoJsonData), [geoJsonData, nearbyClusters.length]);

  // 篩選後叢集消失時清除選取，避免空面板殘留。
  useEffect(() => {
    if (selectedClusterKey && !clusters.some(cluster => cluster.key === selectedClusterKey)) {
      setSelectedClusterKey(null);
    }
  }, [clusters, selectedClusterKey]);

  const landmarks = useMemo(() => {
    return filteredSpots
      .filter(spot => SPOT_POSITIONS[spot.id] && !nearbyClusters.some(cluster => cluster.key === `spot:${spot.id}`))
      .map(spot => ({
        ...spot,
        pos: [SPOT_POSITIONS[spot.id].lat, SPOT_POSITIONS[spot.id].lng] as [number, number]
      }));
  }, [filteredSpots, nearbyClusters]);

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
    if (dynamicBounds) {
      const bounds = L.latLngBounds(dynamicBounds);
      nearbyClusters.forEach(cluster => bounds.extend(cluster.pos));
      return bounds;
    }
    if (clusters.length > 0) {
      const positions = [...clusters, ...landmarks];
      const lats = positions.map(c => c.pos[0]);
      const lngs = positions.map(c => c.pos[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      return [[minLat - 0.003, minLng - 0.003], [maxLat + 0.003, maxLng + 0.003]];
    }
    return null;
  }, [dynamicBounds, clusters, landmarks, nearbyClusters]);

  // 日夜共用 OSM 圖磚；夜巡由 TileLayer className 套用 CSS 濾鏡轉暗
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="cluster-map" data-theme={mapTheme}>
      <div className="map-viewport" inert={selectedClusterKey ? true : undefined}>
        <MapContainer 
          center={mapCenter} 
          zoom={12.5} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', background: palette.ground }}
        >
          <TileLayer
            key={mapTheme}
            url={tileUrl}
            attribution={attribution}
            className={mapTheme === 'dark' ? 'map-tiles-night' : 'map-tiles-day'}
          />
          <MapController center={mapCenter} bounds={effectiveBounds} reduced={reducedMotion} />
          <MapControls center={mapCenter} bounds={effectiveBounds} reduced={reducedMotion} t={t} />
          
          {outsideMask && (
            <GeoJSON key={`mask-${activeId}`} data={outsideMask} interactive={false}
              style={{ className: 'ward-outside-mask', stroke: false, fillColor: palette.mask, fillOpacity: palette.maskOpacity, fillRule: 'evenodd' }} />
          )}
          {geoJsonData && <>
            <GeoJSON key={`halo-${activeId}`} data={geoJsonData} interactive={false}
              style={{ className: 'ward-boundary-halo', color: palette.halo, weight: 7, opacity: 0.3, fill: false }} />
            <GeoJSON key={`line-${activeId}`} data={geoJsonData} interactive={false}
              style={{ className: 'ward-boundary-line', color: palette.line, weight: 1.5, opacity: 0.95, fill: false }} />
          </>}

          <MapMarkers clusters={clusters} landmarks={landmarks} selected={selectedClusterKey}
            theme={mapTheme} onSelect={selectCluster} />
        </MapContainer>

        {nearbyClusters.length > 0 && <div className="nearby-map-note" role="note">{t('nearby_map_note')}</div>}
        {clusters.length === 0 && (
          <div className="map-empty-layer">
            <div className="map-empty ui-muted">{t('empty_msg')}</div>
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
            ref={panelRef} className="map-sheet" role="dialog" aria-modal="false" aria-labelledby="map-sheet-title"
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
              if(event.key === 'Escape'){event.stopPropagation();closePanel();}
            }}
          >
            <div className="map-sheet-heading">
               <div className="map-sheet-title">
                 <MapPin size={18} />
                 <h3 id="map-sheet-title">{clusters.find(c => c.key === selectedClusterKey)?.label} <small>({selectedSpots.length})</small></h3>
               </div>
               <button type="button" onClick={closePanel} className="ui-button">
                 {t('btn_back_map')} <ChevronDown size={14} />
               </button>
            </div>
            
            <div className="map-sheet-body">
              {selectedSpots.map(spot => <SpotCard key={spot.id} spot={spot} lang={lang} t={t} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
