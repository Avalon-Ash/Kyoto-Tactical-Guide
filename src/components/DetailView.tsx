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
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, List, Filter, Map } from 'lucide-react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { TYPES, TYPE_NAMES, WARD_NAMES, AREA_NAMES, getWardStats, getAreaStats } from '../data/index';

const WARD_STATS = getWardStats(), AREA_STATS = getAreaStats();
import { SpotCard } from './SpotCard';
import { BunkoTools } from './BunkoTools';
import { MakieIcon } from './MakieIcon';
import { typeMotifs } from '../lib/makie-icons';
import type { BunkoPreferences } from './BunkoEntrance';
import { TagSelector } from './TagSelector';
import { TAG_REGISTRY } from '../data/tags';
import { TYPE_TAG_GROUP_MAP, DEFAULT_TAG_GROUPS } from '../data/type-tag-groups';

const ClusterMap = React.lazy(() =>
  import('./ClusterMap').then(module => ({ default: module.ClusterMap }))
);

interface DetailViewProps {
  engine: ReturnType<typeof useKyotoEngine>;
  preferences: BunkoPreferences;
  onPreferencesChange: (value: BunkoPreferences) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ engine, preferences, onPreferencesChange }) => {
  const { 
    lang, mode, activeId, activeType, isLoading, activeTag, setActiveTag, localTags,
    t, toggleLang, closeDetail, filteredSpots, typeCounts 
  } = engine;
  const systemReducedMotion = useReducedMotion();
  const reduceMotion = preferences.paused || systemReducedMotion;
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');
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

  const titleRef = useRef<HTMLHeadingElement>(null);
  React.useEffect(() => { titleRef.current?.focus(); }, []);
  const returnToIndex = () => { closeDetail(); engine.switchMode(mode); };
  const title = activeId ? t(activeId, mode === 'ward' ? WARD_NAMES : AREA_NAMES) : '';
  return <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduceMotion ? {duration:0} : undefined} className="detail-view">
    <header className="detail-header">
      <div className="detail-topline">
        <button type="button" className="ui-button back-button" onClick={returnToIndex}><ChevronLeft size={18} />{t('btn_back')}</button>
        <BunkoTools lang={lang} preferences={preferences} onChange={onPreferencesChange} onLanguage={toggleLang} />
      </div>
      <div className="detail-heading">
        <div><p className="ui-kicker">{mode === 'ward' ? 'KYOTO / BUNKO' : 'KYOTO / PLACES'}</p>
          <h2 ref={titleRef} tabIndex={-1}>{title}</h2></div>
        <small>{filteredSpots.length} / {activeId && (mode === 'ward' ? WARD_STATS[activeId] : AREA_STATS[activeId])} {t('unit_spot')}</small>
      </div>
      <div className="type-selector" role="group" aria-label={t('type_filter')}>
        {Object.keys(TYPES).map(type => <button key={type} type="button" aria-pressed={activeType === type}
          onClick={() => engine.setActiveType(type)}>
          <MakieIcon motif={typeMotifs[type] ?? 'all'} />
          <span>{t(type, TYPE_NAMES)}</span><small>{typeCounts[type] || 0}</small>
        </button>)}
      </div>
      <TagSelector tags={visibleLocalTags} activeTag={activeTag} onSelect={setActiveTag} lang={lang} />
    </header>
    <div ref={scrollRef} className={`detail-content ${viewMode === 'map' ? 'is-map' : ''}`}>
      {isLoading ? <div className="ui-status" role="status">{t('loading')}</div>
        : viewMode === 'map' ? <React.Suspense fallback={<div role="status" className="ui-status">{t('loading')}</div>}>
            <ClusterMap engine={engine} night={preferences.night} paused={preferences.paused} />
          </React.Suspense>
        : <main className="spot-grid" aria-label={title}>
          {filteredSpots.length ? filteredSpots.map(spot => <SpotCard key={spot.id} spot={spot} lang={lang} t={t} activeTag={activeTag} />)
            : <div className="ui-status" role="status"><Filter size={28} /><p>{t('empty_msg')}</p></div>}
        </main>}
    </div>
    <nav className="view-switch" aria-label={t('view_mode')}>
      <button type="button" aria-pressed={viewMode === 'card'} onClick={() => setViewMode('card')}><List size={18} />{t('view_list')}</button>
      <button type="button" aria-pressed={viewMode === 'map'} onClick={() => setViewMode('map')}><Map size={18} />{t('view_map')}</button>
    </nav>
  </motion.div>;
};
