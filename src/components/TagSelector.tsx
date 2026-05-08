import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Lang } from '../types';
import { TAG_REGISTRY } from '../data/tags';

interface TagSelectorProps {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
  lang: Lang;
  variant: 'global' | 'local';
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags, activeTag, onSelect, lang, variant
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTagBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    const startX = e.pageX;
    const startLeft = el.scrollLeft;
    let moved = false;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.pageX - startX;
      if (Math.abs(dx) > 3) {
        moved = true;
        el.scrollLeft = startLeft - dx;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }
    };

    const onUp = () => {
      el.style.cursor = '';
      el.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (moved) {
        const block = (ev: MouseEvent) => ev.stopPropagation();
        window.addEventListener('click', block, { once: true, capture: true });
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (tags.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleTagBarMouseDown}
      style={{ cursor: 'grab' }}
      className={`overflow-x-auto no-scrollbar relative touch-pan-x ${variant === 'global' ? 'py-4' : 'py-2'}`}
    >
      <div className="flex gap-3 px-6 w-max">
        {tags.map(tagId => {
          const meta = TAG_REGISTRY[tagId];
          const label = meta ? meta.label[lang] : tagId;
          const isActive = activeTag === tagId;

          return (
            <motion.button
              key={tagId}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(isActive ? null : tagId)}
              className={`shrink-0 px-6 py-2.5 text-[0.95rem]
                font-serif tracking-[0.15em] min-h-[48px] flex items-center justify-center
                rounded-sm border transition-all duration-300
                ${isActive 
                  ? 'maki-e-tag active bg-shuiro text-white border-shuiro shadow-lg' 
                  : 'maki-e-tag bg-white/5 text-gold-light border-gold-light/30'}`}
            >
              {label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
