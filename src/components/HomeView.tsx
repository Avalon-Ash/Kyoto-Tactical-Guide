import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useKyotoEngine } from '../hooks/useKyotoEngine';
import { AREA_KEYS, AREA_NAMES, getAreaStats } from '../data/index';
import { TAG_REGISTRY, TAG_GROUP_LABELS } from '../data/tags';
import { BunkoEntrance, type BunkoPreferences } from './BunkoEntrance';
import { buildGoogleMapsUrl } from './SpotCard';
import { makieIcon, type MakieMotif } from '../lib/makie-icons';
const Ornament=({motif}:{motif:MakieMotif})=><span className="hira-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:makieIcon(motif)}}/>;
const groupMotifs:Record<string,MakieMotif>={food:'food',misc:'all',culture:'temple',nature:'nature',transport:'transport',acg:'acg'};

interface HomeViewProps {
  engine: ReturnType<typeof useKyotoEngine>;
  width: number;
  totalCount: number;
  cabinetWard: string;
  onCabinetWardChange: (ward: string) => void;
  cabinetPreferences: BunkoPreferences;
  onCabinetPreferencesChange: (value: BunkoPreferences) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ engine, width, totalCount, cabinetWard, onCabinetWardChange, cabinetPreferences, onCabinetPreferencesChange }) => {
  const { lang, mode, t, toggleLang, openDetail, activeTag, setActiveTag, filteredSpots, isGlobalLoading, tagCounts } = engine;
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlayScrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const tagOpener = useRef<HTMLButtonElement | null>(null);

  // Auto scroll to top when switching modes (Ward/Area)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [mode]);

  return (
    <motion.div 
      key="home"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`kyoto-home bunko-home ${cabinetPreferences.night?'bunko-night':''} flex flex-col h-full bg-transparent relative overflow-hidden`}
    >
      <header className="urushi-panel border-b border-gold/40 px-3 sm:px-8 py-3 sm:py-6 flex flex-wrap items-center justify-between gap-y-2 gap-x-1 sm:gap-4 shrink-0 relative z-30 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-6 flex-1">
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
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLang}
            className="bg-transparent border border-gold/30 text-gold-light/70 rounded-none px-2 sm:px-6 py-1 sm:py-2.5 text-[0.75rem] sm:text-[0.85rem] font-serif cursor-pointer hover:bg-shuiro hover:text-white hover:border-shuiro transition-all shadow-md tracking-widest uppercase font-bold shrink-0 min-w-[44px]"
          >
            {width < 400 ? (lang === 'zh' ? '日' : '中') : t('btn_lang')}
          </button>
        </div>
      </header>

      <nav className="flex border-b border-gold/20 shrink-0 bg-[#0a0a0a] relative z-20">
        <button 
           aria-pressed={mode === 'ward'} onClick={() => engine.switchMode('ward')}
           className={`flex-1 py-3 sm:py-6 text-[clamp(0.75rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold whitespace-nowrap ${mode === 'ward' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
        >
           <span className="whitespace-nowrap">京洛文庫</span>
        </button>
        <button 
           aria-pressed={mode === 'area'} onClick={() => engine.switchMode('area')}
           className={`flex-1 py-3 sm:py-6 text-[clamp(0.75rem,1.8vw,1.1rem)] cursor-pointer transition-all border-b-2 font-serif tracking-[0.4em] uppercase font-bold whitespace-nowrap ${mode === 'area' ? 'text-gold-light border-shuiro bg-shuiro/5' : 'text-[#f0ead6]/20 border-transparent hover:text-gold-light/30'}`}
        >
           <span className="whitespace-nowrap">{lang === 'zh' ? '名所目録' : '名所目録'}</span>
        </button>
        <button
          aria-pressed={mode === 'tag'} onClick={() => engine.switchMode('tag')}
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
          <div className="ward-home-section">

            
            <BunkoEntrance lang={lang} wardId={cabinetWard} preferences={cabinetPreferences}
              onLanguageChange={toggleLang} onWardChange={onCabinetWardChange}
              onPreferencesChange={onCabinetPreferencesChange}
              onExploreWard={ward=>openDetail(ward,'ward')} />
            

          </div>
        ) : mode === 'tag' ? (
          <div className="bunko-index tag-index">
            <p className="index-caption">{lang==='zh'?'以風物尋訪京都':'風物から京都を探す'}</p>
            {(['food','misc','culture','nature','transport','acg'] as const).map(group=>(
              <section className="index-group" key={group}>
                <h2><Ornament motif={groupMotifs[group]}/>{TAG_GROUP_LABELS[group]?.[lang]??group}</h2>
                <div className="index-tags">{Object.values(TAG_REGISTRY).filter(tag=>tag.group===group).map(tag=>(
                  <button key={tag.id} onClick={event=>{tagOpener.current=event.currentTarget;setActiveTag(tag.id);}} aria-pressed={activeTag===tag.id}>
                    <span>{tag.label[lang]}</span><small>{tagCounts[tag.id]??'—'}</small>
                  </button>
                ))}</div>
              </section>
            ))}
          </div>
        ) : (
          <div className="bunko-index area-index">
            <p className="index-caption">{lang==='zh'?'循地名，尋洛中洛外':'地名をたどり、洛中洛外へ'}</p>
            <div className="area-leaves">{AREA_KEYS.map((aId,index)=>(
              <button key={aId} onClick={()=>openDetail(aId,'area')}>
                <span className="leaf-number">{String(index+1).padStart(2,'0')}</span><Ornament motif="map"/>
                <span className="leaf-name">{t(aId,AREA_NAMES)}</span>
                <small>{getAreaStats()[aId]||0} {t('unit_spot')}</small><span aria-hidden="true">↗</span>
              </button>
            ))}</div>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {activeTag && (
          <motion.div
            key="tag-overlay"
            initial={{ y: reduceMotion ? 0 : '100%' }}
            animate={{ y: 0 }}
            exit={{ y: reduceMotion ? 0 : '100%' }}
            transition={reduceMotion ? {duration:0} : { type: 'spring', damping: 25, stiffness: 200 }}
            style={{ touchAction: 'pan-y' }}
            onKeyDown={(event:React.KeyboardEvent<HTMLDivElement>)=>{
              if(event.key==='Escape'){setActiveTag(null);tagOpener.current?.focus();}
              if(event.key==='Tab'){
                const container:HTMLDivElement=event.currentTarget;
                const nodes=Array.from(container.querySelectorAll<HTMLElement>('button,a[href]'));
                const first=nodes[0],last=nodes.at(-1);
                if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
                else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
              }
            }}
            className="catalog-overlay fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-labelledby="tag-result-title"
          >
            <header className="catalog-heading">
              <Ornament motif={groupMotifs[TAG_REGISTRY[activeTag]?.group]??'all'}/>
              <h2 id="tag-result-title">{TAG_REGISTRY[activeTag]?.label[lang]??activeTag}</h2>
              <small>{filteredSpots.length} {t('unit_spot')}</small>
              <button autoFocus onClick={()=>{setActiveTag(null);tagOpener.current?.focus();}}>{t('btn_close')}</button>
            </header>

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
                <div className="catalog-results">
                  {filteredSpots.map(s => (
                    <article key={s.id} className="catalog-entry">
                      <small>{t(s.areaId,AREA_NAMES)} · {s.id}</small><h3>{s.name}</h3>
                      <p>{s.desc}</p><p className="catalog-tags">{s.tags}</p>
                      {s.reservationRequired&&<p>{lang==='zh'?'需預約':'要予約'}</p>}
                      <a href={buildGoogleMapsUrl(s)} target="_blank" rel="noopener noreferrer"><Ornament motif="map"/>Google Maps ↗</a>
                    </article>
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
