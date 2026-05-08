import { motion } from 'motion/react';
import { FlatSpot, Lang } from '../types';
import { WARD_NAMES, AREA_NAMES, TYPE_NAMES, TYPES } from '../data/index';

interface SpotCardProps {
  key?: number | string;
  spot: FlatSpot;
  lang: Lang;
  t: (key: string, dict?: any) => string;
}

export function SpotCard({ spot, lang, t }: SpotCardProps) {
  const typeId = spot.typeId;
  const typeName = t(typeId, TYPE_NAMES);
  const name = spot.name;
  const desc = spot.desc;
  const tagsStr = spot.tags;
  const tags = tagsStr.split(',').filter(Boolean);
  const areaName = t(spot.areaId, AREA_NAMES);
  const wardName = t(spot.wardId, WARD_NAMES);

  const typeColor = TYPES[typeId]?.color || '#c8a04a';
  const typeFirstChar = typeName.charAt(0);

  const baseQuery = spot.mapQuery || name;
  // Remove redundant city/ward names if already present (suffix or prefix)
  const cleanedQuery = baseQuery
    .replace(/^京都府\s*京都市\s*/, '')
    .replace(/^京都市\s*/, '')
    .replace(new RegExp(`^${WARD_NAMES[spot.wardId].ja}\\s*`), '')
    .replace(new RegExp(`\\s*${WARD_NAMES[spot.wardId].ja}$`), '')
    .replace(/\s*京都$/, '');

  const mapSearchQuery = `京都府 京都市 ${WARD_NAMES[spot.wardId].ja} ${cleanedQuery}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="urushi-card p-[clamp(1rem,2.5vw,2.5rem)] flex flex-col gap-[clamp(1rem,2vw,2rem)] shadow-2xl relative group border-t border-gold/30"
    >
      {/* Type Seal / Hanko */}
      <div 
        className="absolute top-3 right-3 w-8 h-8 border border-white/20 flex items-center justify-center shadow-lg z-20 group-hover:scale-110 transition-transform"
        style={{ 
          backgroundColor: typeColor,
          transform: 'rotate(-3deg)',
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3), 2px 2px 5px rgba(0,0,0,0.5)'
        }}
      >
        <span className="text-white font-serif font-black text-sm leading-none flex items-center justify-center">
          {typeFirstChar}
        </span>
      </div>

      <div className="flex flex-col gap-[clamp(0.25rem,0.8vw,0.8rem)] relative z-10">
        <div className="flex items-center gap-[clamp(0.5rem,1.2vw,1.2rem)]">
          <span className="w-[clamp(0.2rem,0.4vw,0.4rem)] h-[clamp(1.5rem,3vw,3.5rem)] shrink-0" style={{ backgroundColor: typeColor, boxShadow: `0 0 15px ${typeColor}60` }}></span>
          <h3 className="maki-e-text font-serif text-[clamp(1.2rem,4vw,2.8rem)] font-bold leading-tight flex-1 tracking-tight">{name}</h3>
        </div>
        <div className="flex items-center gap-[clamp(0.5rem,1vw,1.5rem)] ml-[clamp(0.7rem,1.8vw,2.2rem)]">
          <span className="text-[clamp(0.6rem,1vw,0.9rem)] text-gold-light/80 font-bold tracking-[0.3em] uppercase">{areaName}</span>
          <span className="text-gold/20 text-[clamp(0.5rem,0.8vw,0.8rem)]">•</span>
          <span className="text-[clamp(0.6rem,1vw,0.9rem)] text-gold-light/40 font-medium tracking-[0.2em]">{wardName}</span>
        </div>
      </div>

      <p className="text-[clamp(0.85rem,1.2vw,1.2rem)] text-[#f0ead6]/80 leading-relaxed font-serif ml-[clamp(0.7rem,1.8vw,2.2rem)] pl-[clamp(0.8rem,1.5vw,2rem)] border-l border-gold/10 relative z-10 italic-serif">
        {desc}
      </p>
      
      <div className="flex flex-wrap gap-[clamp(0.4rem,0.8vw,1rem)] ml-[clamp(0.7rem,1.8vw,2.2rem)] relative z-10">
        <span className="text-[clamp(0.6rem,0.9vw,0.85rem)] px-[clamp(0.5rem,1.2vw,1.5rem)] py-[clamp(0.25rem,0.6vw,0.8rem)] bg-shuiro/20 text-[#fff] font-serif font-bold border border-shuiro/30 shadow-inner">
          {typeName}
        </span>
        {tags.map((tag, i) => (
          <span key={i} className="text-[clamp(0.55rem,0.8vw,0.8rem)] px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.2rem,0.5vw,0.6rem)] bg-white/5 text-[#f0ead6]/40 font-serif border border-white/5 tracking-wider">
            #{tag.trim()}
          </span>
        ))}
      </div>
      
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'linear-gradient(135deg, #2a1f10 0%, #1a1208 50%, #2c1f0e 100%)',
          border: '1px solid rgba(200,160,74,0.4)',
          boxShadow: `
            inset 0 1px 0 rgba(255,240,180,0.10),
            inset 0 -1px 0 rgba(0,0,0,0.7),
            inset 1px 0 0 rgba(200,160,74,0.06),
            0 3px 12px rgba(0,0,0,0.7)
          `
        }}
        className="nikuai-btn block text-center no-underline p-[clamp(0.75rem,2vw,2rem)] text-gold-light text-[clamp(0.7rem,1vw,1rem)] font-bold tracking-[0.3em] sm:tracking-[0.6em] font-serif mt-[clamp(0.5rem,1.5vw,2rem)] transition-all relative z-10 shadow-xl overflow-hidden active:scale-95"
      >
        <span className="relative z-10">{t('btn_map')}</span>
        <div className="absolute inset-0 bg-gold/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
      </a>
    </motion.div>
  );
}
