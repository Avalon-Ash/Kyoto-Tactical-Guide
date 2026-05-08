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
      className={`overflow-hidden relative ${variant === 'global' ? 'py-3' : 'py-2'}`}
    >
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.05}
        className="flex gap-2 px-4 w-max"
      >
        {tags.map(tagId => {
          const meta = TAG_REGISTRY[tagId];
          const label = meta ? meta.label[lang] : tagId;
          const isActive = activeTag === tagId;

          return (
            <button
              key={tagId}
              onClick={() => onSelect(isActive ? null : tagId)}
              className={`maki-e-tag shrink-0 px-4 py-2 text-[clamp(0.75rem,2vw,0.85rem)]
                font-serif tracking-[0.2em] min-h-[48px] flex items-center
                ${isActive ? 'active' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
