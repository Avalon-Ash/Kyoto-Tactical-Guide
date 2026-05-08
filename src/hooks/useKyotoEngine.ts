import { useState, useMemo, useEffect, useRef } from 'react';
import { Lang, FlatSpot, WardKey } from '../types';
import { UI_DICT, loadSpotsByWard, WARD_BY_AREA } from '../data/index';
import { TYPES } from '../data/types';

export function useKyotoEngine() {
  const [lang, setLang] = useState<Lang>('zh');
  const [mode, setMode] = useState<'ward' | 'area'>('ward');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>('T_ALL');
  const [search, setSearch] = useState('');
  
  // 核心：當前分區的景點資料 (Lazy Loaded)
  const [loadedSpots, setLoadedSpots] = useState<FlatSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 用於保留切換時的計數，防止閃爍為 0
  const previousTypeCounts = useRef<Record<string, number>>({});

  /**
   * 根據當前選擇的行政區或分區，動態加載資料
   */
  useEffect(() => {
    if (!activeId) {
      setLoadedSpots([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      
      // 找出這筆資料屬於哪個行政區 (一區可能跨多個 Ward)
      const wardIds = mode === 'ward' 
        ? [activeId as WardKey] 
        : (WARD_BY_AREA[activeId] as WardKey[] || []);

      if (wardIds.length > 0) {
        // 並行載入所有相關行政區資料
        const results = await Promise.all(
          wardIds.map(wardId => loadSpotsByWard(wardId, lang))
        );
        
        if (isMounted) {
          setLoadedSpots(results.flat());
        }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadData();

    return () => { isMounted = false; };
  }, [activeId, mode, lang]);

  const t = (key: string, dict: any = UI_DICT) => {
    if (!dict[key]) return key;
    return dict[key][lang] ?? dict[key]['zh'] ?? Object.values(dict[key])[0] ?? key;
  };

  const toggleLang = () => setLang(prev => (prev === 'zh' ? 'ja' : 'zh'));

  const switchMode = (newMode: 'ward' | 'area') => {
    setActiveId(null);
    setSearch('');
    setActiveType('T_ALL');
    setMode(newMode);
  };

  const typeCounts = useMemo(() => {
    // 取得當前基準景點（尚未套用類型過濾，但套用了區域/行政區過濾）
    const baseSpots = loadedSpots.filter(spot => 
      mode === 'area' ? spot.areaId === activeId : spot.wardId === activeId
    );

    if (isLoading || baseSpots.length === 0) {
      return previousTypeCounts.current;
    }

    const counts: Record<string, number> = { T_ALL: baseSpots.length };
    baseSpots.forEach(spot => {
      counts[spot.typeId] = (counts[spot.typeId] || 0) + 1;
    });

    previousTypeCounts.current = counts;
    return counts;
  }, [loadedSpots, isLoading, activeId, mode]);

  const filteredSpots = useMemo(() => {
    if (!activeId) return [];

    // 使用動態載入的資料進行過濾
    let result = loadedSpots.filter(spot => 
      mode === 'area' ? spot.areaId === activeId : spot.wardId === activeId
    );

    if (activeType !== 'T_ALL') {
      result = result.filter(spot => spot.typeId === activeType);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(spot => 
        spot.name.toLowerCase().includes(q) ||
        spot.desc.toLowerCase().includes(q) ||
        spot.tags.toLowerCase().includes(q) ||
        (spot.jaName ? spot.jaName.toLowerCase().includes(q) : false)
      );
    }

    const ord = Object.fromEntries(Object.values(TYPES).map(t => [t.id, t.sortOrder]));
    
    result.sort((a, b) => {
      const orderA = ord[a.typeId] || 9;
      const orderB = ord[b.typeId] || 9;
      if (orderA !== orderB) return orderA - orderB;
      
      return a.name.localeCompare(b.name, lang === 'zh' ? 'zh-TW' : 'ja-JP');
    });

    return result;
  }, [activeId, mode, activeType, search, lang, loadedSpots]);

  const openDetail = (id: string, viewMode: 'ward' | 'area') => {
    setActiveId(id);
    setMode(viewMode);
    setActiveType('T_ALL');
    setSearch('');
  };

  const closeDetail = () => {
    setActiveId(null);
    setSearch('');
  };

  return {
    lang,
    mode,
    activeId,
    activeType,
    search,
    isLoading,
    setSearch,
    switchMode,
    setActiveType,
    t,
    toggleLang,
    openDetail,
    closeDetail,
    filteredSpots,
    typeCounts
  };
}
