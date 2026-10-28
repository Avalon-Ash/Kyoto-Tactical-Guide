import React, { useId, useMemo, useState } from 'react';
import type { I18nText } from '../types';
import { toChineseNumerals } from '../lib/numerals';
import { WARD_BOUNDARIES } from '../data/geo/ward-boundaries';
import { WARD_NAMES, WARD_KEYS } from '../data/wards';
import { VIEW_W, VIEW_H, project, geometryToPath } from '../lib/geo-svg';

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

export const MapCanvas: React.FC<MapCanvasProps> = ({ onOpen, stats, t }) => {
  const uid = useId().replace(/:/g, '');
  const [highlight, setHighlight] = useState<string | null>(null);
  const wards = useMemo(() => WARD_KEYS.map(id => {
    const [x, y] = project(...WARD_LABELS[id]);
    return { id, d: geometryToPath(WARD_BOUNDARIES[id]), x, y };
  }), []);

  return (
    <section className="byobu-atlas" aria-label={t('tab_ward')}>
      <header className="atlas-heading">
        <div><span className="atlas-kicker">KYOTO · 794</span><h2>{t('byobu_title')}</h2></div>
        <span className="atlas-edition">{t('byobu_edition')}</span>
      </header>
      <div className="atlas-body">
        <div className="ward-map">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="ward-map-svg" role="group" aria-label={t('byobu_title')}>
            <defs>
              <clipPath id={`${uid}-clip`}><rect width={VIEW_W} height={VIEW_H} /></clipPath>
              <linearGradient id={`${uid}-ink`} x2="1" y2="1">
                <stop stopColor="#24271d" /><stop offset="1" stopColor="#14160f" />
              </linearGradient>
            </defs>
            <g clipPath={`url(#${uid}-clip)`}>
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
              <g className="ward-labels" pointerEvents="none" aria-hidden="true">
                {wards.map(w => <g key={w.id} data-active={highlight === w.id}>
                  <text className="ward-label" x={w.x} y={w.y} textAnchor="middle">{t(w.id, WARD_NAMES).replace(/[區区]$/, '')}</text>
                  <g className="ward-seal" transform={`translate(${w.x}, ${w.y + 14})`}>
                    <rect x={-35} width={70} height={23} rx={2} />
                    <text y={16} textAnchor="middle">{toChineseNumerals(stats[w.id] ?? 0)}</text>
                  </g>
                </g>)}
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
