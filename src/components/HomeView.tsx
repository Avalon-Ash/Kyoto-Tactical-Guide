import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { AREA_KEYS, TYPES, TYPE_NAMES, AREA_NAMES, getWardStats, getAreaStats } from '../data/index';
import { TAG_REGISTRY, TAG_GROUP_LABELS } from '../data/tags';
import { MapCanvas } from './MapCanvas';
import { SpotCard } from './SpotCard';

interface HomeViewProps {
  engine: ReturnType<typeof useKyotoEngine>;
  width: number;
  totalCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ engine, width, totalCount }) => {
  const { lang, mode, t, toggleLang, openDetail, activeTag, setActiveTag, filteredSpots, isGlobalLoading, tagCounts } = engine;
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlayScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to top when switching modes (Ward/Area)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [mode]);

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-transparent relative overflow-hidden"
    >
      <header className="urushi-panel border-b border-gold/40 px-3 sm:px-8 py-3 sm:py-6 flex flex-wrap items-center justify-between gap-y-2 gap-x-1 sm:gap-4 shrink-0 relative z-30 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hanko-stamp text-base sm:text-2xl w-7 sm:w-12 h-7 sm:h-12 shadow-lg flex items-center justify-center">
            京
          </div>
          <div className="flex flex-col">
            <h1 className="maki-e-text font-serif text-[clamp(1.1rem,2.8vw,2.5rem)] font-bold tracking-[0.2em]">{t('app_title')}</h1>
            <div className="hidden sm:flex items-center gap-2 mt-0 sm:mt-1">
              <span className="w-4 sm:w-12 h-[1px] bg-gold/20"></span>
              <p className="text-[clamp(0.75rem,1vw,0.75rem)] text-gold-light/40 tracking-[0.3em] font-serif uppercase font-bold">
                {t('db_info').replace('{n}', totalCount.toString())}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={toggleLang}
          className="bg-transparent border border-gold/30 text-gold-light/70 rounded-none px-2 sm:px-6 py-1 sm:py-2.5 text-[0.75rem] sm:text-[0.85rem] font-serif cursor-pointer hover:bg-shuiro hover:text-white hover:border-shuiro transition-all shadow-md tracking-widest uppercase font-bold shrink-0 min-w-[44px]"
        >
          {width < 400 ? (lang === 'zh' ? '日' : '中') : t('btn_lang')}
        </button>
      </header>

      <nav className="flex border-b border-gold/20 shrink-0 bg-[#0a0a0a] relative z-20">
        <button 
           onClick={() => engine.switchMode('ward')}
           className={`flex-1 py-3 sm:py-6 text-[clamp(0.75rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold whitespace-nowrap ${mode === 'ward' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
        >
           <span className="whitespace-nowrap">{lang === 'zh' ? '洛中洛外' : '洛中洛外'}</span>
        </button>
        <button 
           onClick={() => engine.switchMode('area')}
           className={`flex-1 py-3 sm:py-6 text-[clamp(0.75rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold whitespace-nowrap ${mode === 'area' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
        >
           <span className="whitespace-nowrap">{lang === 'zh' ? '名所目録' : '名所目録'}</span>
        </button>
        <button
          onClick={() => engine.switchMode('tag')}
          className={`flex-1 py-3 sm:py-6 text-[clamp(0.75rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold whitespace-nowrap
            ${mode === 'tag'
              ? 'text-gold-light border-shuiro bg-shuiro/5'
              : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
        >
          <span className="whitespace-nowrap">御秘帖</span>
        </button>
      </nav>

      <div 
        ref={scrollRef} 
        style={{ touchAction: 'pan-y' }}
        className="flex-1 overflow-y-auto no-scrollbar"
      >
        {mode === 'ward' ? (
          <div className="p-4 sm:p-12 flex flex-col items-center gap-4 sm:gap-10 pb-12">
            <div className="font-serif text-[clamp(0.75rem,2vw,1rem)] text-gold-light tracking-[0.2em] opacity-40 uppercase">{t('map_hint')}</div>
            
            <MapCanvas onOpen={openDetail} stats={getWardStats()} t={t} />
            

          </div>
        ) : mode === 'tag' ? (
          <div className="py-4 sm:py-8 px-4 sm:px-8 flex flex-col gap-6">
            {/* 頁面副題 */}
            <div className="flex flex-col items-center gap-2 pt-2 pb-4 border-b border-gold/10">
              <p className="font-serif text-[clamp(0.7rem,1.2vw,0.8rem)] text-gold-light/30
                            tracking-[0.5em] uppercase">
                {lang === 'zh' ? '以風物筆記索驥全洛' : '洛中洛外・風物索引'}
              </p>
            </div>

            {/* 各 group 分組渲染 */}
            {(['food', 'misc', 'culture', 'nature', 'transport', 'acg'] as const).map(group => {
              const groupTags = Object.values(TAG_REGISTRY).filter(t => t.group === group);
              if (groupTags.length === 0) return null;

              return (
                <div key={group} className="flex flex-col gap-3">
                  {/* Group 標題 */}
                  <div className="flex items-center gap-3">
                    <span className="w-4 sm:w-8 h-[1px] bg-gold/20" />
                    <h3 className="font-serif text-[clamp(0.7rem,1.2vw,0.85rem)]
                                   text-gold-light/40 tracking-[0.4em] uppercase font-bold">
                      {TAG_GROUP_LABELS[group]?.[lang] ?? group}
                    </h3>
                    <span className="flex-1 h-[1px] bg-gold/10" />
                  </div>

                  {/* Tag chips 網格 */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {groupTags.map(tagMeta => {
                      const isActive = activeTag === tagMeta.id;
                      return (
                        <button
                          key={tagMeta.id}
                          onClick={() => {
                            setActiveTag(isActive ? null : tagMeta.id);
                          }}
                          className={`maki-e-tag min-h-[48px] px-4 sm:px-5 py-2 font-serif
                                      text-[clamp(0.8rem,1.4vw,0.95rem)] tracking-[0.2em]
                                      flex items-center gap-2 transition-all
                                      ${isActive
                                        ? 'active border-gold/70 bg-shuiro/80 text-white'
                                        : ''}`}
                        >
                          {tagMeta.emoji && (
                            <span className="text-base leading-none">{tagMeta.emoji}</span>
                          )}
                          <span className="flex-1">{lang === 'zh' ? tagMeta.label.zh : tagMeta.label.ja}</span>

                          {/* 數量 badge */}
                          {tagCounts[tagMeta.id] != null && tagCounts[tagMeta.id] > 0 && (
                            <span className={`
                              text-[0.6rem] leading-none px-1.5 py-0.5 rounded-full font-bold
                              min-w-[1.4rem] text-center tabular-nums
                              ${isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-gold/10 text-gold-light/40'}
                            `}>
                              {tagCounts[tagMeta.id]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-2">
            {AREA_KEYS.map(aId => {
              const count = getAreaStats()[aId] || 0;
              return (
                <div 
                  key={aId}
                  onClick={() => openDetail(aId, 'area')}
                  className="px-8 py-5 border-b border-gold/5 cursor-pointer flex justify-between items-center transition-all hover:bg-shuiro/10 group"
                >
                  <span className="text-[1.05rem] font-serif tracking-[0.2em] text-[#f0ead6]/90 group-hover:text-gold-light transition-colors">{t(aId, AREA_NAMES)}</span>
                  <span className="text-[0.8rem] font-serif text-gold-light/40">
                     {count} {t('unit_spot')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {activeTag && (
          <motion.div
            key="tag-overlay"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ touchAction: 'pan-y', backgroundColor: '#0d0a07' }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#0d0a07] border-b border-gold/40 px-6 py-4 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <span className="text-shuiro font-bold font-serif">●</span>
                <h2 className="maki-e-text font-serif text-xl tracking-widest font-bold">
                  {activeTag ? (TAG_REGISTRY[activeTag]?.label[lang] ?? activeTag) : ''}
                </h2>
                <span className="text-gold-light/40 font-serif text-sm ml-2">
                  ({filteredSpots.length})
                </span>
              </div>
              <button
                onClick={() => setActiveTag(null)}
                className="bg-shuiro/10 border border-shuiro/30 text-shuiro rounded-full px-5 py-2 text-sm font-bold font-serif hover:bg-shuiro hover:text-white transition-all min-h-[44px]"
              >
                {t('btn_close')}
              </button>
            </div>

            {/* Scroll Body */}
            <div
              ref={overlayScrollRef}
              className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8 no-scrollbar bg-transparent"
              style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
            >
              {isGlobalLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="maki-e-text animate-pulse font-serif tracking-[0.5em]">{t('loading')}...</div>
                </div>
              ) : filteredSpots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {filteredSpots.map(s => (
                    <SpotCard key={s.id} spot={s} lang={lang} t={t} readOnly={false} activeTag={activeTag} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gold-light/40 font-serif tracking-widest">{t('no_results')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
