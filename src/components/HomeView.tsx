import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { AREA_KEYS, AREA_NAMES, getAreaStats } from '../data/index';
import { TAG_REGISTRY, TAG_GROUP_LABELS } from '../data/tags';
import { BunkoEntrance, type BunkoPreferences } from './BunkoEntrance';
import { SpotCard } from './SpotCard';
import { BunkoTools } from './BunkoTools';
import { MakieIcon } from './MakieIcon';
import type { MakieMotif } from '../lib/makie-icons';

const GROUPS = ['food', 'misc', 'culture', 'nature', 'transport', 'acg'] as const;
const GROUP_MOTIFS: Record<string, MakieMotif> = { food: 'food', misc: 'all', culture: 'temple', nature: 'nature', transport: 'transport', acg: 'acg' };
const MODES = [['ward', 'mode_bunko'], ['area', 'mode_area'], ['tag', 'mode_tag']] as const;
const AREA_STATS = getAreaStats();

interface HomeViewProps {
  engine: ReturnType<typeof useKyotoEngine>;
  cabinetWard: string;
  onCabinetWardChange: (ward: string) => void;
  cabinetPreferences: BunkoPreferences;
  onCabinetPreferencesChange: (value: BunkoPreferences) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ engine, cabinetWard, onCabinetWardChange, cabinetPreferences, onCabinetPreferencesChange }) => {
  const { lang, mode, t, toggleLang, openDetail, activeTag, setActiveTag, filteredSpots, isGlobalLoading, tagCounts, totalCount, returnFocusId } = engine;
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() || cabinetPreferences.paused;
  const tagOpener = useRef<HTMLButtonElement | null>(null);
  const overlayOpen = activeTag ? true : undefined;

  // Coming back from a place: focus the entry the reader opened (or the cabinet) instead of losing it to <body>.
  useEffect(() => {
    if (!returnFocusId) return;
    const target = mode === 'area'
      ? scrollRef.current?.querySelector<HTMLElement>(`[data-area-id="${returnFocusId}"]`)
      : scrollRef.current?.querySelector<HTMLElement>('#scene');
    target?.focus({ preventScroll: mode !== 'area' });
    if (mode === 'area') target?.scrollIntoView({ block: 'nearest' });
    // Only on mount: later mode switches start at the top of their index.
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' }); }, [mode]);

  // Focus the chip that opened the sheet only after the re-render lifts `inert` from the index.
  useEffect(() => { if (!activeTag) tagOpener.current?.focus(); }, [activeTag]);
  const closeTag = () => setActiveTag(null);

  return (
    <motion.div key="home" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={reduceMotion ? { duration: 0 } : undefined} className="kyoto-home">
      <header inert={overlayOpen} className="app-header">
        <div className="app-brand">
          <span className="app-seal" aria-hidden="true">京</span>
          <div>
            <h1>{t('app_title')}</h1>
            <p>{t('db_info').replace('{n}', totalCount.toString())}</p>
          </div>
        </div>
        <BunkoTools lang={lang} preferences={cabinetPreferences} onChange={onCabinetPreferencesChange} onLanguage={toggleLang} />
      </header>

      <nav inert={overlayOpen} className="mode-tabs" aria-label={t('mode_label')}>
        {MODES.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={mode === id} onClick={() => engine.switchMode(id)}>{t(label)}</button>
        ))}
      </nav>

      <div inert={overlayOpen} ref={scrollRef} className="home-body">
        {mode === 'ward' ? (
          <BunkoEntrance lang={lang} wardId={cabinetWard} preferences={cabinetPreferences}
            onLanguageChange={toggleLang} onWardChange={onCabinetWardChange}
            onPreferencesChange={onCabinetPreferencesChange}
            onExploreWard={ward => openDetail(ward, 'ward')} />
        ) : mode === 'tag' ? (
          <div className="bunko-index">
            <p className="index-caption">{t('caption_tag')}</p>
            {GROUPS.map(group => (
              <section className="index-group" key={group}>
                <h2><MakieIcon motif={GROUP_MOTIFS[group]} />{TAG_GROUP_LABELS[group]?.[lang] ?? group}</h2>
                <div className="index-tags">{Object.values(TAG_REGISTRY).filter(tag => tag.group === group).map(tag => (
                  <button key={tag.id} type="button" aria-pressed={activeTag === tag.id}
                    onClick={event => { tagOpener.current = event.currentTarget; setActiveTag(tag.id); }}>
                    <span>{tag.label[lang]}</span><small>{tagCounts[tag.id] ?? '—'}</small>
                  </button>
                ))}</div>
              </section>
            ))}
          </div>
        ) : (
          <div className="bunko-index">
            <p className="index-caption">{t('caption_area')}</p>
            <div className="area-leaves">{AREA_KEYS.map((areaId, index) => (
              <button key={areaId} type="button" data-area-id={areaId} onClick={() => openDetail(areaId, 'area')}>
                <span className="leaf-number">{String(index + 1).padStart(2, '0')}</span><MakieIcon motif="map" />
                <span className="leaf-name">{t(areaId, AREA_NAMES)}</span>
                <small>{AREA_STATS[areaId] || 0} {t('unit_spot')}</small><span aria-hidden="true">↗</span>
              </button>
            ))}</div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTag && (
          <motion.div key="tag-overlay"
            initial={{ y: reduceMotion ? 0 : '100%' }} animate={{ y: 0 }} exit={{ y: reduceMotion ? 0 : '100%' }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Escape') closeTag();
              if (event.key === 'Tab') {
                const container: HTMLDivElement = event.currentTarget;
                const nodes = Array.from(container.querySelectorAll<HTMLElement>('button,a[href]'));
                const first = nodes[0], last = nodes.at(-1);
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
              }
            }}
            className="catalog-overlay" role="dialog" aria-modal="true" aria-labelledby="tag-result-title">
            <header className="catalog-heading">
              <MakieIcon motif={GROUP_MOTIFS[TAG_REGISTRY[activeTag]?.group] ?? 'all'} />
              <h2 id="tag-result-title">{TAG_REGISTRY[activeTag]?.label[lang] ?? activeTag}</h2>
              <small>{filteredSpots.length} {t('unit_spot')}</small>
              <button type="button" className="ui-button" autoFocus onClick={closeTag}>{t('btn_close')}</button>
            </header>
            <div className="catalog-body">
              {isGlobalLoading ? <div className="ui-status" role="status">{t('loading')}</div>
                : filteredSpots.length > 0 ? (
                  <div className="catalog-results">
                    {filteredSpots.map(s => <SpotCard key={s.id} spot={s} lang={lang} t={t} activeTag={activeTag} />)}
                  </div>
                ) : <div className="ui-status" role="status">{t('no_results')}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
