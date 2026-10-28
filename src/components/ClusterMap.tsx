/**
 * ==============================================================================
 * 【系統架構: 動態地圖視覺層】 (Dynamic Spatial Map View)
 * 負責渲染 Leaflet / React-Leaflet 真實地圖與景點資訊叢集的 React 元件。
 *
 * 架構特徵與技術棧：
 * - 真實坐標映射：透過 `src/data/map-centers.ts` SSOT 獲取所有叢集站點/獨立景點的真實經緯度。
 * - 世界遺產與國寶標記 (Landmarks)：具備絕對經緯度（於 `SPOT_POSITIONS` 定義）的重要名勝，
 *   會特別渲染為「地標圖示加名稱 (Icon + Name)」 SVG 標記，而非一般的群集點。
 * - OSM GeoJSON 邊界：若在行政區模式下，會呼叫 Nominatim API 動態繪製該區虛線邊界，並自動適應縮放 (fitBounds)。
 * - 響應式日夜主題：日輪使用 OSM 標準圖磚；夜巡同樣使用 OSM 圖磚，再以 CSS 濾鏡 (`.map-tiles-night`)
 *   轉為暗色漆黑調（CARTO dark_all 已要求 API key，故不再使用）。
 * - UX 體驗：自定義 Marker 繪製數量群集標籤，點擊 Marker 後從下方滑出該區景點詳細列表，
 *   並支援單一卡片快速導航與 Google Maps API 深度整合。
 * ==============================================================================
 */
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { getLatLng, SPOT_POSITIONS } from '../data/map-centers';
import { AREA_NAMES, WARD_NAMES } from '../data/index';
import { MapPin, Navigation, Eye, Moon, Sun, X, ChevronDown } from 'lucide-react';
import { SpotCard, buildGoogleMapsUrl } from './SpotCard';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ClusterMapProps {
  engine: ReturnType<typeof useKyotoEngine>;
  width: number;
}

const MapController = ({ center, bounds }: { center: [number, number], bounds?: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { animate: true, padding: [40, 40] });
    } else {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [bounds, center, map]);

  return null;
};

const createClusterIcon = (count: number, label: string, isSelected: boolean) => {
  const html = `
    <div class="flex flex-col items-center group w-max" style="transform: translate(-50%, -16px); position: absolute; pointer-events: none;">
      <div class="w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all pointer-events-auto ${
        isSelected 
          ? 'bg-shuiro border-shuiro text-white scale-110 shadow-[0_0_15px_rgba(225,81,65,0.5)]' 
          : 'bg-[#151515] border-gold/40 text-gold-light opacity-90'
      }">
        <span class="font-serif text-xs font-bold leading-none">${count}</span>
      </div>
      <div class="mt-1 font-serif text-[0.7rem] px-2 py-0.5 rounded backdrop-blur-sm whitespace-nowrap tracking-widest transition-all pointer-events-auto ${
        isSelected ? 'bg-shuiro/90 text-white' : 'bg-black/80 text-gold-light opacity-90'
      }">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: '', 
    iconSize: [0, 0], 
    iconAnchor: [0, 0]
  });
};

const createLandmarkIcon = (label: string, theme: 'light' | 'dark') => {
  // 夜巡模式下改用金色字 + 黑色描邊，避免灰字白邊在暗底上不可讀
  const ink = theme === 'light' ? '#4a4a4a' : '#e6c27a';
  const halo = theme === 'light' ? '#fff' : '#000';

  // A temple svg looking like the google maps one (multi-tier roof)
  const templeSvg = `
    <svg viewBox="0 0 24 24" fill="${ink}" class="w-7 h-7 drop-shadow-sm">
      <path d="M12,2L5,6V7H19V6L12,2M8,8V12H16V8H8M4,13V14H20V13H4M6,15V19H18V15H6M3,20V22H21V20H3Z" />
    </svg>
  `;

  const html = `
    <div class="flex flex-col items-center group w-max" style="transform: translate(-50%, -50%); position: absolute; pointer-events: none;">
      <div class="mb-0.5">
        ${templeSvg}
      </div>
      <div class="font-sans text-[0.7rem] font-bold tracking-wider" style="color: ${ink}; text-shadow: 1px 1px 0 ${halo}, -1px -1px 0 ${halo}, 1px -1px 0 ${halo}, -1px 1px 0 ${halo}, 0 1px 0 ${halo}, 0 -1px 0 ${halo}, -1px 0 0 ${halo}, 1px 0 0 ${halo};">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: '',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const ClusterMap: React.FC<ClusterMapProps> = ({ engine, width }) => {
  const { lang, mode, activeId, filteredSpots, t } = engine;
  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(null);
  // 切換行政區／分區時關閉面板。
  useEffect(() => {
    setSelectedClusterKey(null);
  }, [activeId, mode]);

  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light');
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [dynamicBounds, setDynamicBounds] = useState<L.LatLngBoundsExpression | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (mode === 'ward' && activeId) {
      const wardName = WARD_NAMES[activeId as keyof typeof WARD_NAMES]?.ja;
      if (wardName) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(wardName + ', 京都市')}&format=json&polygon_geojson=1`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
             if (!isMounted) return;
             const boundary = data.find((d: any) => d.osm_type === 'relation' && d.class === 'boundary') || data[0];
             if (boundary && boundary.geojson) {
                setGeoJsonData(boundary.geojson);
                const b = boundary.boundingbox;
                if (b) {
                  setDynamicBounds([
                    [parseFloat(b[0]), parseFloat(b[2])], // South-West
                    [parseFloat(b[1]), parseFloat(b[3])]  // North-East
                  ]);
                }
             } else {
               setGeoJsonData(null);
               setDynamicBounds(null);
             }
          }).catch(() => {
             if (isMounted) {
               setGeoJsonData(null); setDynamicBounds(null);
             }
          });
      }
    } else if (mode === 'area') {
      // In Area mode, GeoJSON isn't needed, but we can compute bounds from the spots
      setGeoJsonData(null);
      setDynamicBounds(null); // will fallback to center or we can calc here
    } else {
      setGeoJsonData(null);
      setDynamicBounds(null);
    }
    return () => { isMounted = false; };
  }, [mode, activeId]);

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
             setMapTheme(t => t === 'light' ? 'dark' : 'light');
          }}
          className="bg-black/70 backdrop-blur border border-gold/30 text-gold-light p-2 rounded tracking-widest font-serif text-xs px-3 hover:bg-gold/20 transition flex items-center gap-2 cursor-pointer pointer-events-auto shadow-lg"
        >
          {mapTheme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          {mapTheme === 'light' ? '夜巡' : '日輪'}
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
            className={mapTheme === 'dark' ? 'map-tiles-night' : ''}
          />
          <MapController center={mapCenter} bounds={effectiveBounds} />
          
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              style={{
                color: '#e15141',
                weight: 2,
                opacity: 0.8,
                dashArray: '5, 8',
                fillColor: '#e15141',
                fillOpacity: 0.05
              }}
            />
          )}

          {landmarks.map(spot => (
            <Marker
              key={`landmark-${spot.id}`}
              position={spot.pos}
              icon={createLandmarkIcon(spot.name, mapTheme)}
              interactive={false}
            />
          ))}
          
          {clusters.map((cluster) => {
            const isSelected = selectedClusterKey === cluster.key;
            return (
              <Marker 
                key={cluster.key} 
                position={cluster.pos}
                icon={createClusterIcon(cluster.spots.length, cluster.label, isSelected)}
                eventHandlers={{
                  click: () => setSelectedClusterKey(cluster.key)
                }}
              />
            );
          })}
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
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
                 返回地圖 <ChevronDown size={14} />
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
