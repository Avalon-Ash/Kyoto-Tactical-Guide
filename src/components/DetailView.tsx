/**
 * @layer UI / DetailView（任務列表主介面）
 * @module DetailView
 *
 * 本元件是「洛中洛外」與「名所目録」兩種模式的共用主介面，
 * 負責渲染主 Tab（A 層）、副標籤列（B 層）與景點卡片格（C 層）。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 雙層過濾器架構（A × B → C）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * A 層（主 Tab）：typeId 類型選擇，由 useKyotoEngine.setActiveType 驅動
 * B 層（副標籤）：tagId 精煉，由 useKyotoEngine.setActiveTag 驅動
 * C 層（卡片）  ：filteredSpots 渲染，由 useKyotoEngine.filteredSpots 提供
 *
 * B 層顯示規則（雙重過濾保護）：
 *   1. useKyotoEngine.localTags：只含當前 activeId + activeType 範圍內
 *      景點實際使用的 tagId（資料層保護，防止空結果）
 *   2. visibleLocalTags（本元件）：對 localTags 再套用 TYPE_TAG_GROUP_MAP
 *      白名單過濾（語意層保護，防止跨類型標籤出現）
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TYPE_TAG_GROUP_MAP — SSOT 位置
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 定義於 src/data/type-tag-groups.ts，是 typeId → 允許 tag group 的唯一對應表。
 * 新增 TYPES 時必須同步在該表新增對應白名單（validate_data.js 會檢查）。
 * 禁止在 useKyotoEngine、TagSelector、spots 資料層複製此映射。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SSOT 原則與禁則
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - 禁止在本元件直接操作 loadedSpots 或複製 filteredSpots 邏輯
 * - 禁止將 TYPE_TAG_GROUP_MAP 套用於御秘帖（Tag Mode）的標籤渲染
 * - 主 Tab 切換時若 activeTag 的 group 不在新白名單中，自動 setActiveTag(null)
 */
import React, { useRef, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, GripHorizontal, Filter, Map } from 'lucide-react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { TYPES, TYPE_NAMES, WARD_NAMES, AREA_NAMES, WARD_DESCS, getWardStats, getAreaStats } from '../data/index';
import { SpotCard } from './SpotCard';
import { TagSelector } from './TagSelector';
import { TAG_REGISTRY } from '../data/tags';
import { TYPE_TAG_GROUP_MAP, DEFAULT_TAG_GROUPS } from '../data/type-tag-groups';

const ClusterMap = React.lazy(() =>
  import('./ClusterMap').then(module => ({ default: module.ClusterMap }))
);

interface DetailViewProps {
  engine: ReturnType<typeof useKyotoEngine>;
  width: number;
}

export const DetailView: React.FC<DetailViewProps> = ({ engine, width }) => {
  const { 
    lang, mode, activeId, activeType, isLoading, activeTag, setActiveTag, localTags,
    t, toggleLang, closeDetail, filteredSpots, typeCounts 
  } = engine;
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to top when changing type filters or active tag
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }

    // 若當前選中的 tag 不屬於新主 Tab 的允許範圍，自動取消選取
    const allowedGroups = TYPE_TAG_GROUP_MAP[activeType] ?? DEFAULT_TAG_GROUPS;
    const tagStillValid = activeTag
      ? (() => {
          const meta = TAG_REGISTRY[activeTag];
          return meta ? allowedGroups.includes(meta.group) : false;
        })()
      : true;
    if (!tagStillValid) setActiveTag(null);
  }, [activeType, activeId, activeTag, localTags, setActiveTag]);

  // 根據當前 activeType，篩選出相關的 localTags 子集
  const visibleLocalTags = useMemo(() => {
    const allowedGroups = TYPE_TAG_GROUP_MAP[activeType] ?? DEFAULT_TAG_GROUPS;
    return localTags.filter(tagId => {
      const meta = TAG_REGISTRY[tagId];
      return meta ? allowedGroups.includes(meta.group) : false;
    });
    // 結果仍為 string[]，符合 TagSelector tags: string[] 介面
  }, [activeType, localTags]);

  const handleSpotListMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) return;
    const el = scrollRef.current;
    if (!el) return;
    const startYValue = e.pageY;
    const startTop = el.scrollTop;
    let moved = false;

    const onMove = (ev: MouseEvent) => {
      const dy = ev.pageY - startYValue;
      if (Math.abs(dy) > 4) {
        moved = true;
        el.scrollTop = startTop - dy;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }
    };

    const onUp = () => {
      el.style.cursor = '';
      el.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (moved) {
        const block = (ev: MouseEvent) => ev.stopPropagation();
        window.addEventListener('click', block, { once: true, capture: true });
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const clampSize = (min: number, max: number) => Math.min(Math.max(width / 40, min), max);

  return (
    <motion.div 
      key="detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-[#0a0a0a] relative z-40"
    >
      {/* Persistent HUD Control Bar */}
      <div className="urushi-panel border-b border-gold/40 shrink-0 z-50">
        <div className="px-4 sm:px-10 py-3 sm:py-6 flex items-center justify-between gap-4">
          <button 
            onClick={closeDetail}
            className="flex items-center gap-2 text-gold-light/60 hover:text-white transition-all group"
          >
            <ChevronLeft size={clampSize(18, 32)} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif text-[0.75rem] sm:text-[1rem] uppercase tracking-[0.4em] font-bold">{t('btn_back')}</span>
          </button>
          
          <div className="flex-1 flex justify-center overflow-hidden">
            <div className="flex flex-col items-center">
              <h2 className="maki-e-text text-[clamp(1rem,3vw,2rem)] font-bold tracking-[0.2em] truncate max-w-full text-center">{activeId ? t(activeId, mode === 'ward' ? WARD_NAMES : AREA_NAMES) : ''}</h2>
              {mode === 'ward' && activeId && (
                <div className="text-[clamp(0.75rem,1.2vw,0.85rem)] text-shuiro font-serif tracking-[0.2em] opacity-80 mt-1">
                  {t(activeId as string, WARD_DESCS)}
                </div>
              )}
              <div className="text-[clamp(0.75rem,1.1vw,0.7rem)] text-gold-light/30 tracking-[0.4em] uppercase font-bold mt-1">
                {activeId && (mode === 'ward' ? getWardStats()[activeId] : getAreaStats()[activeId])} {t('unit_spot')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
            <button 
              onClick={toggleLang}
              className="bg-transparent border border-gold/30 text-gold-light/70 rounded-none px-2 sm:px-4 py-1 sm:py-2 text-[0.55rem] sm:text-[0.75rem] font-serif cursor-pointer hover:bg-shuiro hover:text-white hover:border-shuiro transition-all shadow-md tracking-widest uppercase font-bold"
            >
              {t('btn_lang')}
            </button>
            <button 
              onClick={() => setViewMode(v => v === 'card' ? 'map' : 'card')}
              className="hanko-stamp flex flex-col items-center justify-center gap-0.5 text-[0.6rem] sm:text-xs w-8 sm:w-12 h-8 sm:h-12 shrink-0 cursor-pointer hover:bg-shuiro hover:text-white transition-all overflow-hidden relative group"
            >
              <div className="flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <span className="leading-none">{t(viewMode === 'card' ? 'view_map' : 'view_card')}</span>
                {width >= 400 && <span className="leading-none mt-0.5 opacity-80">{t('view_hint')}</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Inline Controls (Tabs & Search) */}
        <div className="border-t border-gold/10">
          <div ref={tabsContainerRef} className="overflow-hidden bg-black/40 scroll-fade-right relative cursor-grab active:cursor-grabbing group/tabs">
            {/* Drag Hint for Desktop */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gold-light/20 sm:group-hover/tabs:animate-pulse pointer-events-none z-10">
              <GripHorizontal size={14} />
            </div>
            
            <motion.div 
              drag="x"
              dragConstraints={tabsContainerRef}
              dragElastic={0.05}
              className="flex px-2 w-max"
            >
              {Object.keys(TYPES).map(tKey => {
                const displayCount = typeCounts[tKey] || 0;
                
                return (
                  <button 
                    key={tKey}
                    onClick={() => engine.setActiveType(tKey)}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking
                    className={`shrink-0 px-4 sm:px-8 py-3 sm:py-5 text-[0.75rem] sm:text-[1rem] cursor-pointer transition-all border-b-2 font-serif tracking-widest flex items-center gap-2 ${activeType === tKey ? 'text-gold-light border-shuiro bg-shuiro/5 font-bold' : 'text-[#f0ead6]/30 border-transparent hover:text-gold-light/40'}`}
                  >
                    <span className="opacity-80">{t(tKey, TYPE_NAMES)}</span>
                    <span className={`text-[0.5rem] sm:text-[0.75rem] min-w-[1.2rem] sm:min-w-[1.8rem] px-1 py-0.5 rounded-full text-center ${activeType === tKey ? 'bg-shuiro text-white shadow-lg' : 'bg-gold/5 text-gold-light/20'}`}>
                      {displayCount}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>

        <div className="bg-black/60 border-t border-gold/10">
          <TagSelector 
            tags={visibleLocalTags}
            activeTag={activeTag}
            onSelect={setActiveTag}
            lang={lang}
            variant="local"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        onMouseDown={handleSpotListMouseDown}
        style={{ cursor: 'grab', touchAction: 'pan-y' }}
        className="flex-1 overflow-y-auto no-scrollbar pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
            <div className="hanko-stamp text-4xl w-16 h-16 mb-6 flex items-center justify-center animate-spin-slow">京</div>
            <p className="font-serif tracking-[0.5em] text-gold-light/40">{t('loading') || '展卷中，稍候片刻…'}</p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="p-4 sm:p-6 lg:p-8">
            <React.Suspense fallback={
              <div role="status" className="h-[65vh] flex items-center justify-center font-serif tracking-[0.5em] text-gold-light/40">
                {t('loading')}
              </div>
            }>
              <ClusterMap engine={engine} width={width} />
            </React.Suspense>
          </div>
        ) : (
          <main className="p-2 sm:p-10 lg:p-16 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10 lg:gap-14">
            {filteredSpots.length > 0 ? (
              filteredSpots.map((spot, i) => (
                <div key={spot.id + i} className="relative">
                  <SpotCard spot={spot} lang={lang} t={t} activeTag={activeTag} />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-40">
                <Filter size={clampSize(40, 64)} className="text-gold-light/20 mb-8" />
                <p className="font-serif tracking-[0.4em] text-sm sm:text-lg text-gold-light/50">{t('empty_msg')}</p>
              </div>
            )}
            
            {/* Quick Map Floating Toggle */}
            {filteredSpots.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[100]"
              >
                <button
                  onClick={() => setViewMode('map')}
                  className="flex items-center gap-2 bg-shuiro text-white px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(225,81,65,0.4)] border border-white/20 active:scale-95 transition-all text-sm font-serif tracking-widest uppercase font-bold"
                >
                  <Map size={18} />{t('btn_to_map')}
                </button>
              </motion.div>
            )}
          </main>
        )}
      </div>
    </motion.div>
  );
};
