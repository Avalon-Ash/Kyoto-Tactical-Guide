/** Flat gold/silver ornament silhouettes; trusted, local SVG only. */
const motifs = {
  all: '<path d="M16 3 20 12 29 16 20 20 16 29 12 20 3 16 12 12Z" fill="currentColor"/><circle cx="16" cy="16" r="4" fill="var(--hira-silver,currentColor)"/>',
  temple: '<path d="M3 14Q11 12 16 5Q21 12 29 14L26 17H6Z" fill="currentColor"/><path d="M8 18V26M16 18V26M24 18V26M5 27H27"/>',
  transport: '<rect x="8" y="4" width="16" height="21" rx="4"/><path d="M9 10H23V17H9ZM11 26 7 30M21 26 25 30"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>',
  shop: '<path d="M7 7H25L29 15H3Z" fill="currentColor"/><path d="M7 17V27H25V17M13 27V20H19V27M8 4H24"/>',
  modern: '<path d="M6 28V6H20V28M20 14H27V28M3 28H30M10 11H16M10 16H16M10 21H16"/>',
  nature: '<path d="M3 26 13 8 24 26Z" fill="currentColor"/><path d="M17 15 21 9 30 26H25M7 29Q16 24 26 29" stroke="var(--hira-silver,currentColor)"/>',
  food: '<path d="M4 17H28Q26 27 16 27Q6 27 4 17Z" fill="currentColor"/><path d="M9 30H23M8 5 25 12M9 2 26 9M11 11Q8 13 11 15"/>',
  acg: '<path d="M16 28 3 11Q16 1 29 11Z" fill="currentColor"/><path d="M16 26 10 9M16 26V7M16 26 22 9" stroke="var(--hira-silver,currentColor)"/>',
  map: '<path d="M3 7 11 4 21 8 29 5V25L21 28 11 24 3 27ZM11 4V24M21 8V28"/>',
  search: '<circle cx="13" cy="13" r="8"/><path d="M19 19 28 28"/>',
  reset: '<path d="M7 10A11 11 0 1 1 5 21M7 3V11H15"/>',
};
export type MakieMotif = keyof typeof motifs;
export function makieIcon(motif: MakieMotif) {
  return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${motifs[motif]}</svg>`;
}
export const typeMotifs: Record<string, MakieMotif> = {T_HUB:'transport',T_TEMPLE:'temple',T_SHOP:'shop',T_MODERN:'modern',T_NATURE:'nature',T_FOOD:'food',T_ACG:'acg'};
