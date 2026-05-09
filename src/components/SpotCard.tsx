import { motion } from 'motion/react';
import { FlatSpot, Lang } from '../types';
import { WARD_NAMES, AREA_NAMES, TYPE_NAMES, TYPES } from '../data/index';
import { TAG_REGISTRY } from '../data/tags';

interface SpotCardProps {
  key?: number | string;
  spot: FlatSpot;
  lang: Lang;
  t: (key: string, dict?: any) => string;
  readOnly?: boolean;
  activeTag?: string | null;
}

const STATIC_NOISE = ['京都府', '京都市'];

export function SpotCard({ spot, lang, t, readOnly = false, activeTag }: SpotCardProps) {
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
  const typeEmoji = TYPES[typeId]?.emoji;

  // 優先顯示 activeTag 的 emoji（語義更精確）
  const tagEmoji = activeTag
    ? TAG_REGISTRY[activeTag]?.emoji
    : undefined;

  // 次選：spot 自身第一個有 emoji 的 tagId
  const spotFirstTagEmoji = !tagEmoji
    ? spot.tagIds
        ?.map(tid => TAG_REGISTRY[tid]?.emoji)
        .find(Boolean)
    : undefined;

  // 最終顯示：tag > spot 首tag > typeEmoji
  const displayEmoji = tagEmoji ?? spotFirstTagEmoji ?? typeEmoji;

  const wardJa = WARD_NAMES[spot.wardId].ja;
  const wardZh = WARD_NAMES[spot.wardId].zh;

  // 1. 清理 mapQuery 中所有冗餘地理前綴
  //    移除：京都府、京都市、行政區名（ja/zh）、多餘空白
  const NOISE_PATTERNS = [...STATIC_NOISE, wardJa, wardZh];
  const cleanQuery = NOISE_PATTERNS
    .reduce((q, p) => q.replace(new RegExp(p, 'g'), ''), spot.mapQuery)
    .replace(/京都(?=\s|$|[^府市御苑駅城大路通院])/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 2. 判斷是否為「固有名詞型」查詢（已含地點性質，不需前綴強化）
  //    條件：cleanQuery >= 3 字元且含日文，或以常見地名後綴結尾
  const isProperNoun = 
    (cleanQuery.length >= 3 && /[\u3040-\u9FFF]/.test(cleanQuery)) ||
    /[駅寺院社宮堂公園橋通町]$/.test(cleanQuery);

  // 3. 組裝最終查詢字串
  //    - 固有名詞型：直接以「京都 + cleanQuery」查詢，不加行政區
  //    - 短關鍵字型：加上行政區前綴提高精度
  const preciseQuery = isProperNoun
    ? `京都 ${cleanQuery}`
    : `京都府京都市${wardJa} ${cleanQuery}`;

  // 4. jaName 輔助：若 cleanQuery 為英文/羅馬拼音內容（ACG 景點等），
  //    附加日文名提高 Google Maps 識別率
  const finalQuery = (spot.jaName && /[a-zA-Z]/.test(cleanQuery))
    ? `${preciseQuery} ${spot.jaName}`
    : preciseQuery;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalQuery)}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, root: undefined }}
      style={{ touchAction: 'pan-y' }}
      className="urushi-card p-[clamp(1rem,2.5vw,2.5rem)] flex flex-col gap-[clamp(1rem,2vw,2rem)] shadow-2xl relative group border-t border-gold/30"
    >
      <div className="flex flex-col gap-[clamp(0.25rem,0.8vw,0.8rem)] relative z-10">
        <div className="flex items-center gap-[clamp(0.5rem,1.2vw,1.2rem)] min-w-0">
          <span className="w-[clamp(0.2rem,0.4vw,0.4rem)] h-[clamp(1.5rem,3vw,3.5rem)] shrink-0" style={{ backgroundColor: typeColor, boxShadow: `0 0 15px ${typeColor}60` }}></span>
          <h3 className="maki-e-text font-serif text-[clamp(1rem,2.5vw,1.8rem)] font-bold leading-snug flex-1 tracking-tight break-words overflow-wrap-anywhere">{name}</h3>
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
        {spot.tagIds && spot.tagIds.length > 0 ? (
          spot.tagIds.slice(0, 4).map((tid) => {
            const tagMeta = TAG_REGISTRY[tid];
            if (!tagMeta) return null;
            return (
              <span key={tid} className="text-[clamp(0.55rem,0.8vw,0.8rem)] px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.2rem,0.5vw,0.6rem)] bg-white/5 text-[#f0ead6]/40 font-serif border border-white/5 tracking-wider">
                #{lang === 'zh' ? tagMeta.label.zh : tagMeta.label.ja}
              </span>
            );
          })
        ) : (
          tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="text-[clamp(0.55rem,0.8vw,0.8rem)] px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.2rem,0.5vw,0.6rem)] bg-white/5 text-[#f0ead6]/40 font-serif border border-white/5 tracking-wider">
              #{tag.trim()}
            </span>
          ))
        )}
      </div>
      
      {!readOnly && (
        <div className="relative inline-block w-full">
          <a 
            href={googleMapsUrl}
            target="_top"
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

          {/* 印章移到這裡，壓在按鈕右上角出血 */}
          <div
            style={{
              position: 'absolute',
              top: '-0.75rem',
              right: '-0.75rem',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              lineHeight: 1,
              transform: 'rotate(-6deg)',
              background: 'rgba(10,8,5,0.85)',
              border: '1px solid rgba(230,194,122,0.35)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(230,194,122,0.08)',
              zIndex: 20,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            role="img"
            aria-label={typeName}
          >
            {displayEmoji}
          </div>
        </div>
      )}
    </motion.div>
  );
}
