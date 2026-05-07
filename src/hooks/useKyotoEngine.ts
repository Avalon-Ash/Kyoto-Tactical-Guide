import { useState, useMemo, useEffect } from 'react';
import { Lang, FlatSpot, WardKey } from '../types';
import { UI_DICT, loadSpotsByWard, WARD_BY_AREA } from '../data/index';

export function useKyotoEngine() {
  const [lang, setLang] = useState<Lang>('zh');
  const [mode, setMode] = useState<'ward' | 'area'>('ward');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>('T_ALL');
  const [search, setSearch] = useState('');
  
  // 核心：當前分區的景點資料 (Lazy Loaded)
  const [loadedSpots, setLoadedSpots] = useState<FlatSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 根據當前選擇的行政區或分區，動態加載資料
   */
  useEffect(() => {
    if (!activeId) {
      setLoadedSpots([]);
      return;
    }

    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      
      // 找出這筆資料屬於哪個行政區
      const wardId = mode === 'ward' 
        ? (activeId as WardKey) 
        : (WARD_BY_AREA[activeId] as WardKey);

      if (wardId) {
        const spots = await loadSpotsByWard(wardId, lang);
        if (isMounted) {
          setLoadedSpots(spots);
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
    return dict[key][lang] || dict[key]['ja'];
  };

  const toggleLang = () => setLang(prev => (prev === 'zh' ? 'ja' : 'zh'));

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
        spot.tags.toLowerCase().includes(q)
      );
    }

    const ord: Record<string, number> = { 'T_HUB': 1, 'T_TEMPLE': 2, 'T_SHOP': 3, 'T_MODERN': 4, 'T_NATURE': 5 };
    
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
    setMode,
    setActiveType,
    t,
    toggleLang,
    openDetail,
    closeDetail,
    filteredSpots
  };
}
