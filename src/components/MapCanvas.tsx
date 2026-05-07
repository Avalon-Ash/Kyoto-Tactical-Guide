import React from 'react';
import { toChineseNumerals } from '../lib/numerals';

interface MapCanvasProps {
  onOpen: (id: string, mode: 'ward' | 'area') => void;
  stats: Record<string, number>;
  t: (key: string, dict?: any) => string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ onOpen, stats, t }) => {
  return (
    <div className="map-canvas">
      <div className="ward-area pos-kita" onClick={() => onOpen('W_KITA', 'ward')}>
        <span className="ward-label-text">北</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_KITA || 0)}</span>
      </div>
      <div className="ward-area pos-sakyo" onClick={() => onOpen('W_SAKYO', 'ward')}>
        <span className="ward-label-text">左京</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_SAKYO || 0)}</span>
      </div>
      <div className="ward-area pos-ukyo" onClick={() => onOpen('W_UKYO', 'ward')}>
        <span className="ward-label-text">右京</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_UKYO || 0)}</span>
      </div>
      
      <div className="ward-area pos-kamigyo" onClick={() => onOpen('W_KAMIGYO', 'ward')}>
        <span className="ward-label-text">上京</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_KAMIGYO || 0)}</span>
      </div>
      <div className="ward-area pos-nakagyo" onClick={() => onOpen('W_NAKAGYO', 'ward')}>
        <span className="ward-label-text">中京</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_NAKAGYO || 0)}</span>
      </div>
      <div className="ward-area pos-shimogyo" onClick={() => onOpen('W_SHIMOGYO', 'ward')}>
        <span className="ward-label-text">下京</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_SHIMOGYO || 0)}</span>
      </div>
      
      <div className="ward-area pos-higashiyama" onClick={() => onOpen('W_HIGASHIYAMA', 'ward')}>
        <span className="ward-label-text">東山</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_HIGASHIYAMA || 0)}</span>
      </div>
      <div className="ward-area pos-yamashina" onClick={() => onOpen('W_YAMASHINA', 'ward')}>
        <span className="ward-label-text">山科</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_YAMASHINA || 0)}</span>
      </div>
      
      <div className="ward-area pos-nishikyo" onClick={() => onOpen('W_NISHIKYO', 'ward')}>
        <span className="ward-label-text">西京</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_NISHIKYO || 0)}</span>
      </div>
      <div className="ward-area pos-minami" onClick={() => onOpen('W_MINAMI', 'ward')}>
        <span className="ward-label-text" style={{ writingMode: 'horizontal-tb' }}>南</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_MINAMI || 0)}</span>
      </div>
      <div className="ward-area pos-fushimi" onClick={() => onOpen('W_FUSHIMI', 'ward')}>
        <span className="ward-label-text" style={{ writingMode: 'horizontal-tb' }}>伏見</span>
        <span className="ward-count-text">{toChineseNumerals(stats.W_FUSHIMI || 0)}</span>
      </div>
    </div>
  );
};
