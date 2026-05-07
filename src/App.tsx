import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, AlertCircle, GripHorizontal } from 'lucide-react';
import { useKyotoEngine } from './hooks/useKyotoEngine';
import { WARD_KEYS, AREA_KEYS, DB, TYPE_NAMES, TYPES, WARD_NAMES, AREA_NAMES, WARD_DESCS } from './data/index';
import { SpotCard } from './components/SpotCard';
import { toChineseNumerals } from './lib/numerals';

// Custom hook for safe window size access
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// No helper needed anymore.
export default function App() {
  const engine = useKyotoEngine();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const { lang, mode, activeId, activeType, search, t, toggleLang, openDetail, closeDetail, filteredSpots } = engine;
  const { width } = useWindowSize();

  // Helper for responsive icon sizing (now safe with useWindowSize)
  const responsiveScale = Math.max(1, width / 1200);
  const clampSize = (min: number, max: number) => Math.min(Math.max(width / 40, min), max);

  // Scroll to top when entering detail view
  useEffect(() => {
    if (activeId) {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [activeId]);

  return (
    <div className="flex justify-center h-full bg-[#050505]">
      <div className="w-full h-full bg-[#0c0b0a] text-[#f0ead6] relative overflow-hidden shadow-2xl urushi-panel border-x border-gold/20">
        
        {/* Home View */}
        <AnimatePresence mode="wait">
          {!activeId ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-transparent"
            >
              <header className="urushi-panel border-b border-gold/40 px-3 sm:px-8 py-3 sm:py-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0 relative z-30 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-6">
                  <div className="hanko-stamp text-base sm:text-2xl w-7 sm:w-12 h-7 sm:h-12 shadow-lg flex items-center justify-center">
                    京
                  </div>
                  <div className="flex flex-col">
                    <h1 className="maki-e-text font-serif text-[clamp(1.1rem,2.8vw,2.5rem)] font-bold tracking-[0.2em]">{t('app_title')}</h1>
                    <div className="hidden sm:flex items-center gap-2 mt-0 sm:mt-1">
                      <span className="w-4 sm:w-12 h-[1px] bg-gold/20"></span>
                      <p className="text-[clamp(0.45rem,1vw,0.75rem)] text-gold-light/40 tracking-[0.3em] font-serif uppercase font-bold">
                        {t('db_info').replace('{n}', DB.length.toString())}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={toggleLang}
                  className="bg-transparent border border-gold/30 text-gold-light/70 rounded-none px-2 sm:px-6 py-1 sm:py-2.5 text-[0.65rem] sm:text-[0.85rem] font-serif cursor-pointer hover:bg-shuiro hover:text-white hover:border-shuiro transition-all shadow-md tracking-widest uppercase font-bold shrink-0 min-w-[44px]"
                >
                  {width < 400 ? (lang === 'zh' ? '日' : '中') : t('btn_lang')}
                </button>
              </header>

              <nav className="flex border-b border-gold/20 shrink-0 bg-[#0a0a0a] relative z-20">
                <button 
                   onClick={() => engine.setMode('ward')}
                   className={`flex-1 py-3 sm:py-6 text-[clamp(0.65rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold ${mode === 'ward' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
                >
                   {t('tab_ward').split(' ')[0]}
                </button>
                <button 
                   onClick={() => engine.setMode('area')}
                   className={`flex-1 py-3 sm:py-6 text-[clamp(0.65rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold ${mode === 'area' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
                >
                   {t('tab_area').split(' ')[0]}
                </button>
              </nav>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {mode === 'ward' ? (
                  <div className="p-4 sm:p-12 flex flex-col items-center gap-4 sm:gap-10 pb-12">
                    <div className="font-serif text-[clamp(0.6rem,2vw,1rem)] text-gold-light tracking-[0.2em] opacity-40 uppercase">{t('map_hint')}</div>
                    
                    {/* Urushi Map Canvas */}
                    <div className="map-canvas">
                      <div className="ward-area pos-kita" onClick={() => openDetail('W_KITA', 'ward')}>
                        <span className="ward-label-text">北</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_KITA').length)}</span>
                      </div>
                      <div className="ward-area pos-sakyo" onClick={() => openDetail('W_SAKYO', 'ward')}>
                        <span className="ward-label-text">左京</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_SAKYO').length)}</span>
                      </div>
                      <div className="ward-area pos-ukyo" onClick={() => openDetail('W_UKYO', 'ward')}>
                        <span className="ward-label-text">右京</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_UKYO').length)}</span>
                      </div>
                      
                      <div className="ward-area pos-kamigyo" onClick={() => openDetail('W_KAMIGYO', 'ward')}>
                        <span className="ward-label-text">上京</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_KAMIGYO').length)}</span>
                      </div>
                      <div className="ward-area pos-nakagyo" onClick={() => openDetail('W_NAKAGYO', 'ward')}>
                        <span className="ward-label-text">中京</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_NAKAGYO').length)}</span>
                      </div>
                      <div className="ward-area pos-shimogyo" onClick={() => openDetail('W_SHIMOGYO', 'ward')}>
                        <span className="ward-label-text">下京</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_SHIMOGYO').length)}</span>
                      </div>
                      
                      <div className="ward-area pos-higashiyama" onClick={() => openDetail('W_HIGASHIYAMA', 'ward')}>
                        <span className="ward-label-text">東山</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_HIGASHIYAMA').length)}</span>
                      </div>
                      <div className="ward-area pos-yamashina" onClick={() => openDetail('W_YAMASHINA', 'ward')}>
                        <span className="ward-label-text">山科</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_YAMASHINA').length)}</span>
                      </div>
                      
                      <div className="ward-area pos-nishikyo" onClick={() => openDetail('W_NISHIKYO', 'ward')}>
                        <span className="ward-label-text">西京</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_NISHIKYO').length)}</span>
                      </div>
                      <div className="ward-area pos-minami" onClick={() => openDetail('W_MINAMI', 'ward')}>
                        <span className="ward-label-text" style={{ writingMode: 'horizontal-tb' }}>南</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_MINAMI').length)}</span>
                      </div>
                      <div className="ward-area pos-fushimi" onClick={() => openDetail('W_FUSHIMI', 'ward')}>
                        <span className="ward-label-text" style={{ writingMode: 'horizontal-tb' }}>伏見</span>
                        <span className="ward-count-text">{toChineseNumerals(DB.filter(d => d.wardId === 'W_FUSHIMI').length)}</span>
                      </div>
                    </div>
                    
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
                      const count = DB.filter(d => d.areaId === aId).length;
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
            </motion.div>
          ) : (
            /* Detail View */
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
                    <span className="font-serif text-[0.65rem] sm:text-[1rem] uppercase tracking-[0.4em] font-bold">{t('btn_back')}</span>
                  </button>
                  
                  <div className="flex-1 flex justify-center overflow-hidden">
                    <div className="flex flex-col items-center">
                      <h2 className="maki-e-text text-[clamp(1rem,3vw,2rem)] font-bold tracking-[0.2em] truncate max-w-full text-center">{activeId ? t(activeId, mode === 'ward' ? WARD_NAMES : AREA_NAMES) : ''}</h2>
                      {mode === 'ward' && activeId && (
                        <div className="text-[clamp(0.5rem,1.2vw,0.85rem)] text-shuiro font-serif tracking-[0.2em] animate-pulse">
                          // {t(activeId as string, WARD_DESCS)} //
                        </div>
                      )}
                      <div className="text-[clamp(0.45rem,1.1vw,0.7rem)] text-gold-light/30 tracking-[0.4em] uppercase font-bold mt-1">
                        {filteredSpots.length} {t('unit_spot')}
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
                        const territorySpots = DB.filter(s => mode === 'area' ? s.areaId === activeId : s.wardId === activeId);
                        const tCount = tKey === 'T_ALL' ? territorySpots.length : territorySpots.filter(s => s.typeId === tKey).length;
                        
                        return (
                          <button 
                            key={tKey}
                            onClick={() => engine.setActiveType(tKey)}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking
                            className={`shrink-0 px-4 sm:px-8 py-3 sm:py-5 text-[0.65rem] sm:text-[1rem] cursor-pointer transition-all border-b-2 font-serif tracking-widest flex items-center gap-2 ${activeType === tKey ? 'text-gold-light border-shuiro bg-shuiro/5 font-bold' : 'text-[#f0ead6]/30 border-transparent hover:text-gold-light/40'}`}
                          >
                            <span className="opacity-80">{t(tKey, TYPE_NAMES)}</span>
                            <span className={`text-[0.5rem] sm:text-[0.75rem] min-w-[1.2rem] sm:min-w-[1.8rem] px-1 py-0.5 rounded-full text-center ${activeType === tKey ? 'bg-shuiro text-white shadow-lg' : 'bg-gold/5 text-gold-light/20'}`}>{tCount}</span>
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
              <div className="flex-1 overflow-y-auto no-scrollbar pb-[max(6rem,env(safe-area-inset-bottom)+4rem)]">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// No helper needed anymore.