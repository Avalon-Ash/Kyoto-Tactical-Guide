import React, { useId, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { I18nText } from '../types';
import { toChineseNumerals } from '../lib/numerals';
import { WARD_BOUNDARIES } from '../data/geo/ward-boundaries';
import { WARD_NAMES, WARD_KEYS } from '../data/wards';
import { VIEW_W, VIEW_H, project, geometryToPath, mulberry32, ridgePath, smoothLinePath, cloudBandPath } from '../lib/geo-svg';

interface MapCanvasProps {
  onOpen: (id: string, mode: 'ward' | 'area') => void;
  stats: Record<string, number>;
  t: (key: string, dict?: Record<string, I18nText>) => string;
}

/** Presentation anchors only; actual boundaries and spot coordinates stay unchanged. */
export const WARD_LABELS: Record<string, [number, number]> = {
  W_KITA: [35.075, 135.735], W_KAMIGYO: [35.030, 135.755],
  W_SAKYO: [35.075, 135.810], W_NAKAGYO: [35.008, 135.748],
  W_HIGASHIYAMA: [34.993, 135.783], W_SHIMOGYO: [34.990, 135.753],
  W_MINAMI: [34.970, 135.735], W_UKYO: [35.050, 135.665],
  W_NISHIKYO: [34.965, 135.670], W_YAMASHINA: [34.975, 135.815],
  W_FUSHIMI: [34.930, 135.775],
};

/** Stylized river courses for the artwork, not navigation geometry. [lat, lng]. */
const RIVERS: [number, number][][] = [
  [[35.060,135.756],[35.048,135.764],[35.040,135.769],[35.0305,135.772],[35.020,135.7715],[35.009,135.7712],[35,135.771],[34.988,135.7695],[34.975,135.766],[34.960,135.760],[34.945,135.752],[34.933,135.740]],
  [[35.070,135.795],[35.055,135.788],[35.042,135.779],[35.0305,135.772]],
  [[35.020,135.645],[35.016,135.665],[35.0128,135.6778],[35,135.688],[34.985,135.700],[34.970,135.708],[34.955,135.715],[34.940,135.725],[34.925,135.735],[34.910,135.740]],
  [[34.895,135.805],[34.905,135.780],[34.915,135.760],[34.910,135.740]],
];
const makeArt = () => {
  const rand = mulberry32(794);
  return {
    ridges: [ridgePath('top',145,rand),ridgePath('top',95,rand),ridgePath('top',55,rand),ridgePath('right',110,rand),ridgePath('right',65,rand),ridgePath('left',120,rand),ridgePath('left',70,rand)],
    rivers: RIVERS.map(smoothLinePath),
    cloudsTop: [0,1,2].map(i => cloudBandPath(-80+i*60, VIEW_W*(0.55+rand()*0.35), 8+i*44, 28,rand)),
    cloudsBottom: [0,1].map(i => cloudBandPath(VIEW_W*(0.12+rand()*0.2), VIEW_W+80, VIEW_H-55+i*30, 24,rand)),
    flecks: Array.from({length:14},()=>({x:rand()*28,y:rand()*28,s:1+rand()*2,o:0.15+rand()*0.4})),
  };
};

export const MapCanvas: React.FC<MapCanvasProps> = ({ onOpen, stats, t }) => {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const art = useMemo(makeArt, []);
  const still = prefersReducedMotion || paused;
  const [highlight, setHighlight] = useState<string | null>(null);
  const wards = useMemo(() => WARD_KEYS.map(id => {
    const [x, y] = project(...WARD_LABELS[id]);
    return { id, d: geometryToPath(WARD_BOUNDARIES[id]), x, y };
  }), []);

  return (
    <section className={`byobu-atlas${still ? ' is-still' : ''}`} aria-label={t('tab_ward')}>
      <header className="atlas-heading">
        <div><span className="atlas-kicker">KYOTO · 794</span><h2>{t('byobu_title')}</h2></div>
        <div className="atlas-heading-tools"><span className="atlas-edition">{t('byobu_edition')}</span>
          <button type="button" className="atlas-motion-toggle" aria-pressed={Boolean(still)} disabled={Boolean(prefersReducedMotion)}
            onClick={() => setPaused(value => !value)}>{t(still ? 'byobu_resume' : 'byobu_pause')}</button></div>
      </header>
      <div className="atlas-body">
        <div className="ward-map">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="ward-map-svg" role="group" aria-label={t('byobu_title')}>
            <defs>
              <clipPath id={`${uid}-clip`}><rect width={VIEW_W} height={VIEW_H} /></clipPath>
              <linearGradient id={`${uid}-ink`} x2="1" y2="1">
                <stop stopColor="#24271d" /><stop offset="1" stopColor="#14160f" />
              </linearGradient>
              <filter id={`${uid}-washi`} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={1} seed={794} stitchTiles="stitch" />
                <feColorMatrix values="0 0 0 0 0.78 0 0 0 0 0.63 0 0 0 0 0.29 0 0 0 .06 0" />
              </filter>
              <filter id={`${uid}-bleed`} x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={1} seed={3} result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={2} />
              </filter>
              <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#fff0c0" /><stop offset=".3" stopColor="#dabe78" />
                <stop offset=".65" stopColor="#b89246" /><stop offset="1" stopColor="#78612f" />
              </linearGradient>
              <pattern id={`${uid}-flecks`} width={28} height={28} patternUnits="userSpaceOnUse">
                {art.flecks.map((f,i) => <rect key={i} x={f.x} y={f.y} width={f.s} height={f.s} fill="#fff1bf" opacity={f.o} transform={`rotate(45 ${f.x} ${f.y})`} />)}
              </pattern>
            </defs>
            <g clipPath={`url(#${uid}-clip)`}>
              <g className="atlas-art" pointerEvents="none" aria-hidden="true">
                <rect width={VIEW_W} height={VIEW_H} filter={`url(#${uid}-washi)`} />
                {art.ridges.map((d,i)=><path key={i} d={d} className={`ridge ridge-${i%3}`} />)}
              </g>
              {wards.map(w => (
                <g key={w.id} className="ward" data-ward={w.id} data-active={highlight === w.id}
                  role="button" tabIndex={0} aria-label={`${t(w.id, WARD_NAMES)} ${stats[w.id] ?? 0} ${t('unit_spot')}`}
                  onMouseEnter={() => setHighlight(w.id)} onMouseLeave={() => setHighlight(null)}
                  onFocus={() => setHighlight(w.id)} onBlur={() => setHighlight(null)}
                  onClick={() => onOpen(w.id, 'ward')}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(w.id, 'ward'); }
                  }}>
                  <path className="ward-fill" d={w.d} fill={`url(#${uid}-ink)`} fillRule="evenodd" />
                  <path className="ward-outline" d={w.d} fillRule="evenodd" pathLength={1} />
                </g>
              ))}
              <g className="atlas-rivers" filter={`url(#${uid}-bleed)`} pointerEvents="none" aria-hidden="true">
                {art.rivers.map((d,i)=><g key={i}><path className="river-body" d={d} /><path className="river-glint" d={d} /></g>)}
              </g>
              <g className="ward-labels" pointerEvents="none" aria-hidden="true">
                {wards.map(w => <g key={w.id} data-active={highlight === w.id}>
                  <text className="ward-label" x={w.x} y={w.y} textAnchor="middle">{t(w.id, WARD_NAMES).replace(/[區区]$/, '')}</text>
                  <g className="ward-seal" transform={`translate(${w.x}, ${w.y + 14})`}>
                    <rect x={-35} width={70} height={23} rx={2} />
                    <text y={16} textAnchor="middle">{toChineseNumerals(stats[w.id] ?? 0)}</text>
                  </g>
                </g>)}
              </g>
              <g className="clouds clouds-drift-a" pointerEvents="none" aria-hidden="true">
                {art.cloudsTop.map((d,i)=><g key={i}><path d={d} fill={`url(#${uid}-gold)`} /><path d={d} fill={`url(#${uid}-flecks)`} /></g>)}
              </g>
              <g className="clouds clouds-drift-b" pointerEvents="none" aria-hidden="true">
                {art.cloudsBottom.map((d,i)=><g key={i}><path d={d} fill={`url(#${uid}-gold)`} /><path d={d} fill={`url(#${uid}-flecks)`} /></g>)}
              </g>
              <g className="atlas-compass" transform="translate(810 170)" pointerEvents="none" aria-hidden="true">
                <path d="M0,-44 L-8,-12 L0,-20 L8,-12 Z M0,-20 V15 M-15,0 H15" />
                <text y={-54} textAnchor="middle">北</text>
              </g>
            </g>
          </svg>
          <div className="ward-map-attribution"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></div>
        </div>
        <aside className="atlas-directory" aria-label={t('ward_directory')}>
          <div className="directory-heading"><span>{t('ward_directory')}</span><span>01—11</span></div>
          <div className="ward-directory-grid">
            {wards.map((w, i) => <button key={w.id} type="button" className="ward-entry" data-active={highlight === w.id}
              onFocus={() => setHighlight(w.id)} onBlur={() => setHighlight(null)}
              onMouseEnter={() => setHighlight(w.id)} onMouseLeave={() => setHighlight(null)}
              onClick={() => onOpen(w.id, 'ward')}>
              <span className="ward-entry-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span>{t(w.id, WARD_NAMES)}</span><span className="ward-entry-count">{stats[w.id] ?? 0}</span>
            </button>)}
          </div>
          <p className="atlas-caption">{t('byobu_note')}</p>
        </aside>
      </div>
    </section>
  );
};
