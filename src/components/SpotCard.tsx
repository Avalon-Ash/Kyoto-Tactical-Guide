import { motion } from 'motion/react';
import { JoinedSpot, Lang } from '../types';
import { WARD_NAMES, AREA_NAMES, TYPE_NAMES } from '../data/index';

interface SpotCardProps {
  key?: number | string;
  spot: JoinedSpot;
  lang: Lang;
  t: (key: string, dict?: any) => string;
}

export function SpotCard({ spot, lang, t }: SpotCardProps) {
  const typeId = spot.typeId;
  const typeName = t(typeId, TYPE_NAMES);
  const name = spot.name[lang as keyof typeof spot.name] || spot.name['zh'] || '';
  const desc = spot.desc[lang as keyof typeof spot.desc] || spot.desc['zh'] || '';
  const tagsStr = spot.tags[lang as keyof typeof spot.tags] || spot.tags['zh'] || '';
  const tags = tagsStr.split(',').filter(Boolean);
  const areaName = t(spot.areaId, AREA_NAMES);
  const wardName = t(spot.wardId, WARD_NAMES);

  const typeColor = typeId === 'T_HUB' ? '#7aa5d4' : typeId === 'T_SHOP' ? '#d4a74a' : typeId === 'T_TEMPLE' ? '#b1352b' : typeId === 'T_MODERN' ? '#6aab82' : '#7ab89a';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="urushi-card p-[clamp(1rem,2.5vw,2.5rem)] flex flex-col gap-[clamp(1rem,2vw,2rem)] shadow-2xl relative overflow-hidden group border-t border-gold/30"
    >
      <div className="absolute -top-4 -right-4 w-[clamp(6rem,12vw,12rem)] h-[clamp(6rem,12vw,12rem)] opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-700" style={{ color: typeColor }}>
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2,2" />
          <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" fill="currentColor" opacity="0.5" />
          <text x="50" y="55" fontSize="20" textAnchor="middle" fontFamily="serif" fontWeight="bold" fill="currentColor">{typeName[0]}</text>
        </svg>
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
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.mapQuery || (name + ' 京都'))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center no-underline p-[clamp(0.75rem,2vw,2rem)] border border-gold/20 text-gold-light text-[clamp(0.7rem,1vw,1rem)] font-bold tracking-[0.6em] font-serif mt-[clamp(0.5rem,1.5vw,2rem)] transition-all hover:bg-shuiro hover:text-white hover:border-shuiro bg-black/40 relative z-10 shadow-xl overflow-hidden active:scale-95"
      >
        <span className="relative z-10">{t('btn_map')}</span>
        <div className="absolute inset-0 bg-gold/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
      </a>
    </motion.div>
  );
}
