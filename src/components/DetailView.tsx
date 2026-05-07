import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronLeft, GripHorizontal, AlertCircle } from 'lucide-react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { TYPES, TYPE_NAMES, WARD_NAMES, AREA_NAMES, WARD_DESCS, WARD_STATS, AREA_STATS } from '../data/index';
import { SpotCard } from './SpotCard';

interface DetailViewProps {
  engine: ReturnType<typeof useKyotoEngine>;
  width: number;
}

export const DetailView: React.FC<DetailViewProps> = ({ engine, width }) => {
  const { 
    lang, mode, activeId, activeType, search, isLoading,
    t, toggleLang, closeDetail, filteredSpots 
  } = engine;
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const responsiveScale = Math.max(1, width / 1200);
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
                {activeId && (mode === 'ward' ? WARD_STATS[activeId] : AREA_STATS[activeId])} {t('unit_spot')}
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
            <div className="hanko-stamp text-xs sm:text-xl w-6 sm:w-10 h-6 sm:h-10 shrink-0 flex items-center justify-center">
              京
            </div>
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
                const territoryCount = activeId ? (mode === 'ward' ? WARD_STATS[activeId] : AREA_STATS[activeId]) : 0;
                const displayCount = (tKey === 'T_ALL' || isLoading) ? (territoryCount || 0) : filteredSpots.filter(s => s.typeId === tKey).length;
                
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

        <div className="p-[clamp(0.5rem,1.5vw,1.5rem)] bg-black/60">
          <div className="flex items-center gap-3 bg-white/5 border border-gold/20 px-[clamp(0.8rem,1.2vw,1.2rem)] py-[clamp(0.5rem,1vw,1.2rem)] focus-within:border-gold/50 transition-colors">
            <Search size={16} className="text-gold-light/30 transition-transform" style={{ transform: `scale(${responsiveScale})` }} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => engine.setSearch(e.target.value)}
              placeholder={t('search_ph')}
              style={{ fontSize: 'max(16px, clamp(0.8rem, 1.2vw, 1.2rem))' }}
              className="bg-transparent border-none outline-none text-[#f0ead6] w-full font-serif placeholder:text-[#f0ead6]/20"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
            <div className="hanko-stamp text-4xl w-16 h-16 mb-6 flex items-center justify-center animate-spin-slow">京</div>
            <p className="font-serif tracking-[0.5em] text-gold-light/40">{t('loading') || '展卷中，稍候片刻…'}</p>
          </div>
        ) : (
          <main className="p-2 sm:p-10 lg:p-16 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10 lg:gap-14">
            {filteredSpots.length > 0 ? (
              filteredSpots.map((spot, i) => (
                <SpotCard key={spot.id + i} spot={spot} lang={lang} t={t} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-40">
                <Search size={clampSize(40, 64)} className="text-gold-light/20 mb-8" />
                <p className="font-serif tracking-[0.4em] text-sm sm:text-lg text-gold-light/50">{t('empty_msg')}</p>
              </div>
            )}
          </main>
        )}
      </div>
    </motion.div>
  );
};
