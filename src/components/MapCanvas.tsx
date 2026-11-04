import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { I18nText } from '../types';
import { WARD_NAMES, WARD_KEYS } from '../data/wards';
import { MAKIE_LANDMARKS, landmarkPosition, pickMakieWard } from '../lib/makie-scene';
import { createMakieRenderer, type MakieRenderer } from '../lib/makie-renderer';

interface MapCanvasProps {
  onOpen: (id: string, mode: 'ward' | 'area') => void;
  stats: Record<string, number>;
  t: (key: string, dict?: Record<string, I18nText>) => string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ onOpen, stats, t }: MapCanvasProps) => {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [night, setNight] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState('loading');
  const [contextVersion, setContextVersion] = useState(0);
  const [touchWard, setTouchWard] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<MakieRenderer | null>(null);
  const pointer = useRef<[number,number]>([.5,.5]);
  const still = Boolean(reduced || paused);
  const selected = MAKIE_LANDMARKS.find(l => l.wardId === highlight);
  const tr = (value: I18nText) => t('value', { value });
  const update = (id: string | null) => {
    const landmark = MAKIE_LANDMARKS.find(l => l.wardId === id);
    renderer.current?.update({ selected: id ? (WARD_KEYS.indexOf(id)+1)*20/255 : 0,
      pointer: pointer.current, anchor: landmark ? landmarkPosition(landmark) : [.5,.5], still, night });
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRenderMode('loading');
    try { renderer.current = createMakieRenderer(canvas, () => setRenderMode('webgl'), () => setRenderMode('fallback')); }
    catch { setRenderMode('fallback'); }
    const lost = (event: Event) => { event.preventDefault(); renderer.current?.dispose(); renderer.current=null; setRenderMode('fallback'); };
    const restored = () => setContextVersion(v=>v+1);
    canvas.addEventListener('webglcontextlost',lost); canvas.addEventListener('webglcontextrestored',restored);
    return () => { renderer.current?.dispose(); renderer.current=null; canvas.removeEventListener('webglcontextlost',lost); canvas.removeEventListener('webglcontextrestored',restored); };
  }, [contextVersion]);
  useEffect(() => { update(highlight); }, [highlight, night, still, contextVersion]);
  const activate = (id:string) => { setHighlight(id); update(id); };
  const openOrPreview = (id:string, pointerType:string) => {
    if (pointerType === 'touch' && touchWard !== id) {setTouchWard(id);activate(id);return;}
    onOpen(id,'ward');
  };
  return <section className={`byobu-atlas${still ? ' is-still' : ''}${night ? ' atlas-night' : ''}`} aria-label={t('tab_ward')}>
    <header className="atlas-heading">
      <div><span className="atlas-kicker">KYOTO / THE MAKI-E COLLECTION</span><h2>{t('byobu_title')}<span className="atlas-title-dot">。</span></h2></div>
      <div className="atlas-heading-tools"><span className="atlas-edition">{t('byobu_edition')}</span>
        <button type="button" className="atlas-theme-toggle" aria-pressed={night} onClick={() => setNight(v=>!v)}>{t(night ? 'makie_warm' : 'makie_moon')}</button>
        <button type="button" className="atlas-motion-toggle" aria-pressed={still} disabled={Boolean(reduced)} onClick={() => setPaused(v=>!v)}>{t(still ? 'byobu_resume' : 'byobu_pause')}</button>
      </div>
    </header>
    <div className="makie-scene" data-renderer={renderMode} data-active-ward={highlight ?? ''} data-still={still}
      onPointerLeave={() => { if(!touchWard) setHighlight(null); }}>
      <img className="makie-fallback" src="/art/kyoto-makie-relief.jpg" width="1292" height="1218" fetchPriority="high" alt={t('makie_art_alt')} />
      <canvas ref={canvasRef} className="makie-canvas" aria-hidden="true"
        onPointerMove={e=>{
          if(e.pointerType==='touch') return;
          const bounds=e.currentTarget.getBoundingClientRect();
          pointer.current=[(e.clientX-bounds.left)/bounds.width,(e.clientY-bounds.top)/bounds.height];
          const id=pickMakieWard(pointer.current[0],pointer.current[1]);setHighlight(id);update(id);
        }}
        onClick={e=>{
          const bounds=e.currentTarget.getBoundingClientRect();
          const id=pickMakieWard((e.clientX-bounds.left)/bounds.width,(e.clientY-bounds.top)/bounds.height);
          if(id) openOrPreview(id,e.nativeEvent.pointerType);
        }} />
      <div className="makie-signature" aria-hidden="true"><span>京洛</span><small>山河蒔繪</small></div>
      <p className="makie-instruction">{t('makie_interact')}</p>
      <div className="makie-landmarks" role="group" aria-label={t('ward_directory')}>
        {MAKIE_LANDMARKS.map(l=>{
          const [x,y]=landmarkPosition(l);
          return <button type="button" key={l.wardId} className="makie-landmark" data-ward={l.wardId} data-active={highlight===l.wardId}
            style={{left:`${x*100}%`,top:`${y*100}%`}}
            aria-label={`${tr(l.title)} · ${t(l.wardId,WARD_NAMES)} · ${stats[l.wardId] ?? 0} ${t('unit_spot')}`}
            onPointerEnter={e=>{if(e.pointerType!=='touch') activate(l.wardId);}}
            onFocus={()=>activate(l.wardId)} onBlur={()=>{if(!touchWard)setHighlight(null);}}
            onClick={e=>openOrPreview(l.wardId,e.nativeEvent.pointerType)}>
            <span className="makie-place-name">{tr(l.oldName)}</span><span className="makie-ward-name">{t(l.wardId,WARD_NAMES)}</span>
          </button>;
        })}
      </div>
      <div className="makie-selection" data-active={Boolean(selected)} aria-live="polite" aria-atomic="true">
        {selected ? <><span className="makie-selection-ward">{t(selected.wardId,WARD_NAMES)}</span><strong>{tr(selected.title)}</strong><span>{stats[selected.wardId] ?? 0} {t('unit_spot')}<span aria-hidden="true">　↗</span></span><small>{t(touchWard ? 'makie_touch_enter' : 'makie_click_enter')}</small></>
          : <><strong>{t('makie_caption')}</strong><small>{t('makie_material')}</small></>}
      </div>
    </div>
    <div className="atlas-map-footer"><span>{t('makie_art_note')}{renderMode==='fallback' ? ` · ${t('makie_fallback')}` : ''}</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a></div>
  </section>;
};
