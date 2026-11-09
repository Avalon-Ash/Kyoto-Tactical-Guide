import React, { useRef } from 'react';
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

  return <div ref={containerRef} onMouseDown={handleTagBarMouseDown}
    className={`tag-selector tag-selector-${variant}`} role="group" aria-label={lang === 'zh' ? '細分類' : '絞り込み'}>
    <button type="button" aria-pressed={!activeTag} onClick={() => onSelect(null)}>{lang === 'zh' ? '全部' : 'すべて'}</button>
    {tags.map(tagId => <button type="button" key={tagId} aria-pressed={activeTag === tagId}
      onClick={() => onSelect(activeTag === tagId ? null : tagId)}>{TAG_REGISTRY[tagId]?.label[lang] ?? tagId}</button>)}
  </div>;
};
