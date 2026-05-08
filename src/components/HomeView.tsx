import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { AREA_KEYS, TYPES, TYPE_NAMES, AREA_NAMES, getWardStats, getAreaStats } from '../data/index';
import { PINNED_GLOBAL_TAGS } from '../data/tags';
import { MapCanvas } from './MapCanvas';
import { TagSelector } from './TagSelector';
import { SpotCard } from './SpotCard';

interface HomeViewProps {
  engine: ReturnType<typeof useKyotoEngine>;
  width: number;
  totalCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ engine, width, totalCount }) => {
  const { lang, mode, t, toggleLang, openDetail, activeTag, setActiveTag, filteredSpots, isGlobalLoading } = engine;
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlayScrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTopStart = useRef(0);

  const onMouseDown = (ref: React.RefObject<HTMLDivElement>) => (e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    startY.current = e.pageY;
    scrollTopStart.current = ref.current.scrollTop;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !ref.current) return;
      const dy = moveEvent.pageY - startY.current;
      if (Math.abs(dy) > 5) {
        ref.current.scrollTop = scrollTopStart.current - dy;
        ref.current.style.userSelect = 'none';
        ref.current.style.cursor = 'grabbing';
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      if (ref.current) {
        ref.current.style.userSelect = '';
        ref.current.style.cursor = '';
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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

      <section className="bg-[#050505] border-b border-gold/10 z-20">
        <TagSelector 
          tags={PINNED_GLOBAL_TAGS} 
          activeTag={activeTag} 
          onSelect={setActiveTag} 
          lang={lang} 
          variant="global"
        />
      </section>

      <nav className="flex border-b border-gold/20 shrink-0 bg-[#0a0a0a] relative z-20">
        <button 
           onClick={() => engine.switchMode('ward')}
           className={`flex-1 py-3 sm:py-6 text-[clamp(0.75rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold ${mode === 'ward' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
        >
           {t('tab_ward')}
        </button>
        <button 
           onClick={() => engine.switchMode('area')}
           className={`flex-1 py-3 sm:py-6 text-[clamp(0.75rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold ${mode === 'area' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
        >
           {t('tab_area')}
        </button>
      </nav>

      <div 
        ref={scrollRef} 
        onMouseDown={onMouseDown(scrollRef)}
        style={{ touchAction: 'pan-y' }}
        className="flex-1 overflow-y-auto no-scrollbar active:cursor-grabbing"
      >
        {mode === 'ward' ? (
          <div className="p-4 sm:p-12 flex flex-col items-center gap-4 sm:gap-10 pb-12">
            <div className="font-serif text-[clamp(0.75rem,2vw,1rem)] text-gold-light tracking-[0.2em] opacity-40 uppercase">{t('map_hint')}</div>
            
            <MapCanvas onOpen={openDetail} stats={getWardStats()} t={t} />
            
            <div className="flex flex-wrap justify-center gap-4 text-[0.7rem] text-gold-light/40 pt-6 font-serif uppercase tracking-[0.3em] font-medium">
              {Object.keys(TYPES).filter(k => k !== 'T_ALL').map(k => (
                <div key={k} className="flex items-center gap-2">
                  <span 
                    className="inline-block w-3 h-3 border border-current/30"
                    style={{ 
                      backgroundColor: TYPES[k].color,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' 
                    }}
                  />
                  <span>{t(k, TYPE_NAMES)}</span>
                </div>
              ))}
            </div>
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
            dragPropagation={false}
            style={{ touchAction: 'pan-y' }}
            className="fixed inset-0 z-50 urushi-panel flex flex-col p-0 sm:p-0"
          >
            <div className="urushi-panel border-b border-gold/40 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-shuiro font-bold font-serif">●</span>
                <h2 className="maki-e-text font-serif text-xl tracking-widest font-bold">
                  {activeTag}
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

            <div 
              ref={overlayScrollRef}
              onMouseDown={onMouseDown(overlayScrollRef)}
              style={{ touchAction: 'pan-y' }}
              className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar bg-black/60 overscroll-contain active:cursor-grabbing"
            >
              {isGlobalLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="maki-e-text animate-pulse font-serif tracking-[0.5em]">{t('loading')}...</div>
                </div>
              ) : filteredSpots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {filteredSpots.map(s => (
                    <SpotCard 
                      key={s.id} 
                      spot={s} 
                      lang={lang} 
                      t={t} 
                      readOnly={true} // Global overlay is read-only as per specs
                    />
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
