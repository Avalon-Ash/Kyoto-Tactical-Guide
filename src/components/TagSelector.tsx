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

  if (tags.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden relative touch-pan-x ${variant === 'global' ? 'py-4' : 'py-2'}`}
    >
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.1}
        className="flex gap-3 px-6 w-max"
      >
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
      </motion.div>
    </div>
  );
};
