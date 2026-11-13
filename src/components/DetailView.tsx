/**
 * The one reading view for a ward's volume (opened from its cabinet) and for a place in 名所目録.
 * Guidance is by tabs and cards only: type tabs → tag chips → cards, with a list/map switch below.
 * Filtering lives in useKyotoEngine; this component only narrows the tag chips to the groups a type
 * allows (TYPE_TAG_GROUP_MAP in src/data/type-tag-groups.ts) and drops a tag the new type cannot have.
 */
import React, { useRef, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, List, Filter, Map } from 'lucide-react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { TYPES, TYPE_NAMES, WARD_NAMES, AREA_NAMES, getWardStats, getAreaStats } from '../data/index';

const WARD_STATS = getWardStats(), AREA_STATS = getAreaStats();
import { SpotCard } from './SpotCard';
import { ScrollRoller } from './ScrollRoller';
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
  // Escape closes the scroll as it closes the cabinet; a panel that handles Escape itself stops it first.
  const onEscape = (event: React.KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || (event.target as HTMLElement).closest('input, textarea, select')) return;
    returnToIndex();
  };
  const title = activeId ? t(activeId, mode === 'ward' ? WARD_NAMES : AREA_NAMES) : '';
  return <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduceMotion ? {duration:0} : undefined} className="detail-view" onKeyDown={onEscape}>
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
    <ScrollRoller />
    <div ref={scrollRef} className={`detail-content volume-sheet ${viewMode === 'map' ? 'is-map' : ''}`}>
      {isLoading ? <div className="ui-status" role="status">{t('loading')}</div>
        : viewMode === 'map' ? <React.Suspense fallback={<div role="status" className="ui-status">{t('loading')}</div>}>
            <ClusterMap engine={engine} night={preferences.night} paused={preferences.paused} />
          </React.Suspense>
        : <main className="spot-grid" aria-label={title}>
          {filteredSpots.length ? filteredSpots.map(spot => <SpotCard key={spot.id} spot={spot} lang={lang} t={t} activeTag={activeTag} />)
            : <div className="ui-status" role="status"><Filter size={28} /><p>{t('empty_msg')}</p></div>}
          {filteredSpots.length > 0 && <p className="volume-note">{t('volume_note')}</p>}
        </main>}
    </div>
    <ScrollRoller />
    <nav className="view-switch" aria-label={t('view_mode')}>
      <button type="button" aria-pressed={viewMode === 'card'} onClick={() => setViewMode('card')}><List size={18} />{t('view_list')}</button>
      <button type="button" aria-pressed={viewMode === 'map'} onClick={() => setViewMode('map')}><Map size={18} />{t('view_map')}</button>
    </nav>
  </motion.div>;
};
