import type { Event } from '../../types';

interface EventLayout {
  event: Event;
  overlapped: boolean;
  column: 0 | 1; // 0 = left, 1 = right
}

export function computeEventLayouts(events: Event[]): EventLayout[] {
  if (!events || events.length === 0) return [];

  const parse = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };

  const sorted = [...events].sort((a, b) => parse(a.start_hour) - parse(b.start_hour));
  const result: EventLayout[] = [];
  let last: EventLayout | null = null;

  for (const ev of sorted) {
    if (last) {
      const overlap =
        parse(ev.start_hour) < parse(last.event.end_hour) && parse(last.event.start_hour) < parse(ev.end_hour);
      if (overlap && !last.overlapped) {
        // First time we detect an overlap pair
        last.overlapped = true;
        last.column = 0;
        const current: EventLayout = { event: ev, overlapped: true, column: 1 };
        result.push(current);
        last = current; // keep last reference for potential (unexpected) triple overlap
        continue;
      } else if (overlap && last.overlapped) {
        // Unexpected third overlap (should not happen per constraints). We'll just place full width below.
        const current: EventLayout = { event: ev, overlapped: false, column: 0 };
        result.push(current);
        last = current;
        continue;
      }
    }
    const layout: EventLayout = { event: ev, overlapped: false, column: 0 };
    result.push(layout);
    last = layout;
  }

  // Return in original order (top-based order not critical because absolute positioning uses time), but keep sorted for consistent stacking.
  return result;
}
