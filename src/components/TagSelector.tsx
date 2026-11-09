import React from 'react';
import { Lang } from '../types';
import { TAG_REGISTRY } from '../data/tags';
import { translate } from '../data/i18n';

interface TagSelectorProps {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
  lang: Lang;
}

/** Desktop mice can drag the chip row sideways; touch keeps native horizontal scrolling. */
function dragScroll(e: React.MouseEvent<HTMLDivElement>) {
  if (e.button !== 0) return;
  const el = e.currentTarget, startX = e.pageX, startLeft = el.scrollLeft;
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
    // A drag must not also select the chip it ended on.
    if (moved) window.addEventListener('click', ev => ev.stopPropagation(), { once: true, capture: true });
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

export const TagSelector: React.FC<TagSelectorProps> = ({ tags, activeTag, onSelect, lang }) => {
  if (tags.length === 0) return null;
  return <div onMouseDown={dragScroll} className="tag-selector" role="group" aria-label={translate('tag_filter', lang)}>
    <button type="button" aria-pressed={!activeTag} onClick={() => onSelect(null)}>{translate('filter_all', lang)}</button>
    {tags.map(tagId => <button type="button" key={tagId} aria-pressed={activeTag === tagId}
      onClick={() => onSelect(activeTag === tagId ? null : tagId)}>{TAG_REGISTRY[tagId]?.label[lang] ?? tagId}</button>)}
  </div>;
};
