import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft } from 'lucide-react';
import { useKyotoEngine } from './hooks/useKyotoEngine';
import { WARD_KEYS, AREA_KEYS, DB, TYPE_NAMES, TYPES, WARD_NAMES, AREA_NAMES } from './data/index';
import { SpotCard } from './components/SpotCard';
import { toChineseNumerals } from './lib/numerals';

export default function App() {
  const engine = useKyotoEngine();
  const { lang, mode, activeId, activeType, search, t, toggleLang, openDetail, closeDetail, filteredSpots } = engine;

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
      <div className="w-full max-w-[480px] h-full bg-[#0c0b0a] text-[#f0ead6] relative overflow-hidden shadow-2xl urushi-panel border-x border-gold/20">
        
        {/* Home View */}
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
              <header className="urushi-panel border-b border-gold/40 p-5 flex items-center justify-between gap-4 shrink-0 relative z-30">
                <div className="flex items-center gap-5">
                  <div className="hanko-stamp text-2xl w-10 h-10 shadow-lg">
                    京
                  </div>
                  <div>
                    <h1 className="maki-e-text font-serif text-2xl font-bold tracking-[0.2em]">{t('app_title')}</h1>
                    <p className="text-[0.65rem] text-gold-light/60 tracking-widest mt-1">
                      {t('db_info').replace('{n}', DB.length.toString())}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={toggleLang}
                  className="bg-transparent border border-gold/40 text-gold-light rounded-none px-4 py-2 text-xs font-serif cursor-pointer hover:bg-shuiro hover:text-white transition-all shadow-md"
                >
                  {t('btn_lang')}
                </button>
              </header>

              <nav className="flex border-b border-gold/20 shrink-0 bg-[#0a0a0a]">
                <button 
                   onClick={() => engine.setMode('ward')}
                   className={`flex-1 py-4 text-[0.85rem] cursor-pointer transition-all border-b-2 font-serif tracking-[0.3em] ${mode === 'ward' ? 'text-gold-light border-shuiro bg-shuiro/10 font-bold' : 'text-[#f0ead6]/30 border-transparent hover:text-[#f0ead6]/60'}`}
                >
                   {t('tab_ward').split(' ')[0]}
                </button>
                <button 
                   onClick={() => engine.setMode('area')}
                   className={`flex-1 py-4 text-[0.85rem] cursor-pointer transition-all border-b-2 font-serif tracking-[0.3em] ${mode === 'area' ? 'text-gold-light border-shuiro bg-shuiro/10 font-bold' : 'text-[#f0ead6]/30 border-transparent hover:text-[#f0ead6]/60'}`}
                >
                   {t('tab_area').split(' ')[0]}
                </button>
              </nav>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {mode === 'ward' ? (
                  <div className="p-6 flex flex-col items-center gap-6 pb-12">
                    <div className="font-serif text-[0.8rem] text-gold-light tracking-[0.2em] opacity-40 uppercase">{t('map_hint')}</div>
                    
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
                    
                    <div className="flex flex-wrap justify-center gap-4 text-[0.7rem] text-gold-light/40 pt-6 font-serif uppercase tracking-widest">
                      {['T_HUB', 'T_SHOP', 'T_TEMPLE', 'T_MODERN', 'T_NATURE'].map(k => (
                        <div key={k} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{
                            backgroundColor: k === 'T_HUB' ? '#7aa5d4' : k === 'T_SHOP' ? '#d4a74a' : k === 'T_TEMPLE' ? '#b1352b' : k === 'T_MODERN' ? '#6aab82' : '#7ab89a',
                            boxShadow: `0 0 5px ${k === 'T_HUB' ? '#7aa5d4' : k === 'T_SHOP' ? '#d4a74a' : k === 'T_TEMPLE' ? '#b1352b' : k === 'T_MODERN' ? '#6aab82' : '#7ab89a'}`
                          }}></span>
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
              <header className="urushi-panel border-b border-gold/40 p-6 flex flex-col items-center shrink-0">
                <div className="flex w-full items-center justify-between mb-4">
                  <button 
                    onClick={closeDetail}
                    className="text-gold-light/50 flex items-center gap-1 cursor-pointer p-1 font-serif hover:text-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                    <span className="text-xs uppercase tracking-widest">{t('btn_back')}</span>
                  </button>
                  <div className="hanko-stamp text-lg w-8 h-8">
                    京
                  </div>
                </div>
                <div className="text-center font-serif">
                   <h2 className="maki-e-text text-3xl font-bold tracking-[0.4em] mb-1">
                     {activeId ? t(activeId, mode === 'ward' ? WARD_NAMES : AREA_NAMES) : ''}
                   </h2>
                   <div className="flex items-center justify-center gap-4">
                     <span className="h-[1px] w-8 bg-gold/20"></span>
                     <span className="text-[0.7rem] text-gold-light/60 font-bold tracking-[0.5em] uppercase">
                       {filteredSpots.length} {t('unit_spot')}
                     </span>
                     <span className="h-[1px] w-8 bg-gold/20"></span>
                   </div>
                </div>
              </header>

              <div className="bg-[#0c0b0a] border-b border-gold/20 shrink-0 z-10">
                <div className="flex overflow-x-auto no-scrollbar px-2 border-b border-gold/10">
                  {Object.keys(TYPES).map(tKey => {
                    const territorySpots = DB.filter(s => mode === 'area' ? s.areaId === activeId : s.wardId === activeId);
                    const tCount = tKey === 'T_ALL' ? territorySpots.length : territorySpots.filter(s => s.typeId === tKey).length;
                    
                    return (
                      <button 
                        key={tKey}
                        onClick={() => engine.setActiveType(tKey)}
                        className={`shrink-0 px-5 py-4 text-[0.8rem] cursor-pointer transition-all border-b-2 font-serif tracking-widest flex items-center gap-2 ${activeType === tKey ? 'text-gold-light border-shuiro font-bold' : 'text-[#f0ead6]/40 border-transparent hover:text-[#f0ead6]/70'}`}
                      >
                        <span>{t(tKey, TYPE_NAMES)}</span>
                        <span className={`text-[0.6rem] px-2 py-0.5 rounded-full ${activeType === tKey ? 'bg-shuiro text-white' : 'bg-gold/10'}`}>{tCount}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="p-4 bg-black/20">
                  <div className="flex items-center gap-3 bg-white/5 border border-gold/20 rounded-none px-4 py-2.5 focus-within:border-gold/50 transition-colors">
                    <Search size={18} className="text-gold-light/30" />
                    <input 
                      type="text" 
                      value={search}
                      onChange={(e) => engine.setSearch(e.target.value)}
                      placeholder={t('search_ph')}
                      className="bg-transparent border-none outline-none text-[#f0ead6] text-[0.95rem] w-full font-serif placeholder:text-[#f0ead6]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col gap-6">
                {filteredSpots.length > 0 ? (
                  filteredSpots.map((spot, i) => (
                    <SpotCard key={spot.id + i} spot={spot} lang={lang} t={t} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 opacity-40">
                    <Search size={48} className="text-gold-light/30 mb-6" />
                    <p className="font-serif tracking-[0.4em] text-lg text-gold-light/60">{t('empty_msg')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// No helper needed anymore.