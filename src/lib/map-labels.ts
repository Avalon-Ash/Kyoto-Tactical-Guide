/** Screen-space label layout. Only icons move; geographical coordinates never do. */
export interface LabelItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorY: number;
}
export interface LabelPlacement { dx: number; dy: number; crowded: boolean }
type Box = { left: number; top: number; right: number; bottom: number };
const overlaps = (a: Box, b: Box) => a.left < b.right + 7 && a.right + 7 > b.left && a.top < b.bottom + 7 && a.bottom + 7 > b.top;

export function placeMapLabels(items: LabelItem[], width: number, height: number): Record<string, LabelPlacement> {
  const occupied: Box[] = [], result: Record<string, LabelPlacement> = {};
  for (const item of items) {
    // Only wholly invisible labels are skipped. A label whose anchor is just
    // outside the viewport can still overlap visible labels and must participate.
    if (item.x + item.width / 2 < 0 || item.x - item.width / 2 > width ||
        item.y - item.anchorY + item.height < 0 || item.y - item.anchorY > height) {
      result[item.id] = { dx: 0, dy: 0, crowded: false };
      continue;
    }
    const offsets: [number, number][] = [[0, 0]];
    for (let d = 54; d <= 270; d += 54) offsets.push([0,-d],[d,0],[-d,0],[0,d],[d,-d],[-d,-d],[d,d],[-d,d]);
    let best: { box: Box; dx: number; dy: number; conflicts: number } | undefined;
    for (const [dx, dy] of offsets) {
      const left = Math.max(6, Math.min(width - item.width - 6, item.x + dx - item.width / 2));
      const top = Math.max(6, Math.min(height - item.height - 6, item.y + dy - item.anchorY));
      const box = { left, top, right: left + item.width, bottom: top + item.height };
      const conflicts = occupied.filter(other => overlaps(box, other)).length;
      if (!best || conflicts < best.conflicts) best = { box, dx: left + item.width / 2 - item.x, dy: top + item.anchorY - item.y, conflicts };
      if (conflicts === 0) break;
    }
    if (best) {
      occupied.push(best.box);
      result[item.id] = { dx: best.dx, dy: best.dy, crowded: best.conflicts > 0 };
    }
  }
  return result;
}

export const mapLabelWidth = (text: string) => Math.min(240, Math.max(88, Array.from(text).length * 12 + 20));
export const escapeMapLabel = (text: string) => text.replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]!);
