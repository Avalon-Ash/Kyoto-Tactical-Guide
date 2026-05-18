/**
 * @layer System / Kyoto Tactical Engine（戰術引擎層）
 * @module useKyotoEngine
 *
 * 本模組是應用程式的核心狀態管理大腦，所有導航狀態、
 * 過濾邏輯、資料載入皆在此集中協調。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 管理的核心狀態
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - lang          : 當前語系（'zh' | 'ja'），影響 locale 載入與排序
 * - mode          : 導航模式（'ward' | 'area' | 'tag'），三條互斥路徑
 * - activeId      : 當前選中的 wardId 或 areaId（null 表示在首頁）
 * - activeType    : 主 Tab 類型篩選（'T_ALL' 或具體 typeId）
 * - activeTag     : 副標籤篩選（null 表示未篩選）
 * - loadedSpots   : 當前分區的 FlatSpot[]（Lazy Loaded，切換 activeId 觸發）
 * - allLoadedSpots: 御秘帖模式的全域 FlatSpot[]（有 activeTag 且無 activeId 觸發）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 回傳的派生計算值
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - filteredSpots : 依 activeType + activeTag 過濾並排序後的景點陣列
 * - typeCounts    : 各 typeId 在當前 activeId 下的景點計數（附防閃爍快取）
 * - localTags     : 當前 activeId + activeType 範圍內景點實際使用的 tagId 集合
 *                   ⚠️ useMemo 依賴陣列必須包含 activeType，缺少會導致 B 層不重算
 * - tagCounts     : 全域靜態 tagId 計數（loadAllSchemasSync，只計算一次）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 三條導航路徑說明
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Ward Mode  : openDetail(wardId, 'ward') → 載入單一行政區資料
 * Area Mode  : openDetail(areaId, 'area') → 依 WARD_BY_AREA 找出跨 ward 並行載入
 * Tag Mode   : setActiveTag(tagId) 且 activeId === null → 全域 11 ward 並行載入
 *              ⚠️ Tag Mode 不得與 activeId 同時成立，否則觸發兩條路徑衝突
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SSOT 原則與禁則
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - 禁止在 UI 元件層（DetailView / SpotCard）直接操作 loadedSpots
 * - 禁止在 UI 元件層複製 filteredSpots 的排序邏輯（sortOrder）
 * - 禁止在 UI 元件層複製 localTags 的 tagId 統計邏輯
 * - TYPE_TAG_GROUP_MAP 定義於 DetailView.tsx，本 hook 不持有此映射
 * - tagCounts 使用 loadAllSchemasSync()，依賴陣列為 []，禁止改為動態依賴
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import { Lang, FlatSpot, WardKey } from '../types';
import { UI_DICT, loadSpotsByWard, WARD_BY_AREA, getTagCounts } from '../data/index';
import { loadAllSchemasSync, computeWardStats } from '../data/spots-loader';
import { TYPES } from '../data/types';

const ALL_WARD_KEYS: WardKey[] = [
  'W_KITA','W_KAMIGYO','W_SAKYO','W_NAKAGYO','W_HIGASHIYAMA',
  'W_SHIMOGYO','W_MINAMI','W_UKYO','W_NISHIKYO','W_YAMASHINA','W_FUSHIMI'
];

export function useKyotoEngine() {
  const [lang, setLang] = useState<Lang>('zh');
  const [mode, setMode] = useState<'ward' | 'area' | 'tag'>('ward');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>('T_ALL');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allLoadedSpots, setAllLoadedSpots] = useState<FlatSpot[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  
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

  useEffect(() => {
    if (!activeTag || activeId !== null) {
      setAllLoadedSpots([]);
      return;
    }
    let isMounted = true;
    setIsGlobalLoading(true);
    Promise.all(ALL_WARD_KEYS.map(w => loadSpotsByWard(w, lang)))
      .then(results => {
        if (isMounted) setAllLoadedSpots(results.flat());
      })
      .finally(() => {
        if (isMounted) setIsGlobalLoading(false);
      });
    return () => { isMounted = false; };
  }, [activeTag, activeId, lang]);

  const t = (key: string, dict: any = UI_DICT) => {
    if (!dict[key]) return key;
    return dict[key][lang] ?? dict[key]['zh'] ?? Object.values(dict[key])[0] ?? key;
  };

  const toggleLang = () => setLang(prev => (prev === 'zh' ? 'ja' : 'zh'));

  const switchMode = (newMode: 'ward' | 'area' | 'tag') => {
    setActiveId(null);
    setActiveType('T_ALL');
    setActiveTag(null);
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
    // Global Tag View：無 activeId，有 activeTag → 全屏蓋板資料來源
    if (!activeId && activeTag) {
      const ord = Object.fromEntries(Object.values(TYPES).map(t => [t.id, t.sortOrder]));
      return allLoadedSpots
        .filter(s => s.tagIds?.includes(activeTag))
        .sort((a, b) => {
          const orderA = ord[a.typeId] || 9;
          const orderB = ord[b.typeId] || 9;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name, lang === 'zh' ? 'zh-TW' : 'ja-JP');
        });
    }

    if (!activeId) return [];

    // 使用動態載入的資料進行過濾
    let result = loadedSpots.filter(spot => 
      mode === 'area' ? spot.areaId === activeId : spot.wardId === activeId
    );

    if (activeType !== 'T_ALL') {
      result = result.filter(spot => spot.typeId === activeType);
    }

    if (activeTag) {
      result = result.filter(spot => spot.tagIds?.includes(activeTag));
    }

    const ord = Object.fromEntries(Object.values(TYPES).map(t => [t.id, t.sortOrder]));
    
    result.sort((a, b) => {
      const orderA = ord[a.typeId] || 9;
      const orderB = ord[b.typeId] || 9;
      if (orderA !== orderB) return orderA - orderB;
      
      return a.name.localeCompare(b.name, lang === 'zh' ? 'zh-TW' : 'ja-JP');
    });

    return result;
  }, [activeId, mode, activeType, activeTag, lang, loadedSpots, allLoadedSpots]);

  const localTags = useMemo(() => {
    const tagSet = new Set<string>();
    loadedSpots
      .filter(s => {
        // Step 1: 確認屬於當前行政區/分區
        const inScope = mode === 'area' ? s.areaId === activeId : s.wardId === activeId;
        if (!inScope) return false;
        // Step 2: 若 A 有選擇特定類型（非全選），只收集該類型的 spots
        if (activeType !== 'T_ALL') return s.typeId === activeType;
        return true;
      })
      .forEach(s => s.tagIds?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [loadedSpots, activeId, mode, activeType]);

  const tagCounts = useMemo<Record<string, number>>(() => getTagCounts(), []);

  const clearTag = () => setActiveTag(null);

  const openDetail = (id: string, viewMode: 'ward' | 'area') => {
    setActiveId(id);
    setMode(viewMode);
    setActiveType('T_ALL');
    setActiveTag(null);
  };

  const closeDetail = () => {
    setActiveId(null);
    setActiveTag(null);
    // 防護性修改：返回 HomeView 時，若 mode 為 'tag' 則重置為 'ward'
    if (mode === 'tag') {
      setMode('ward');
    }
  };

  return {
    lang,
    mode,
    activeId,
    activeType,
    isLoading,
    switchMode,
    setActiveType,
    t,
    toggleLang,
    openDetail,
    closeDetail,
    filteredSpots,
    typeCounts,
    activeTag,
    setActiveTag,
    clearTag,
    isGlobalLoading,
    localTags,
    tagCounts,
    totalCount: useMemo(() =>
      Object.values(computeWardStats()).reduce((a, b) => a + b, 0), []
    ),
  };
}
