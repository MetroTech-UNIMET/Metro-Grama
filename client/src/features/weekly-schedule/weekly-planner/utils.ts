import type { Event } from './types';

export function getHourMinutes(hour: string) {
  const [h, m] = hour.split(':').map(Number);
  return { hours: h, minutes: m };
}

export function getTotalMinutes(hour: string) {
  const { hours, minutes } = getHourMinutes(hour);
  return hours * 60 + minutes;
}

/**
 * Returns the ids of events that participate in a time overlap exceeding the allowed max concurrent events.
 * If at any moment the number of simultaneously active events is greater than maxEventsOverlapping, all
 * involved event ids at that moment are marked as overlapping.
 */
export function checkEventsOverlapping<T = any>(maxEventsOverlapping: number, events: Event<T>[]) {
  if (maxEventsOverlapping < 1) return new Set<string>();
  if (!events || events.length === 0) return new Set<string>();

  const offending = new Set<string>();
  // Group by dayIndex to evaluate overlaps only within the same day
  const grouped = events.reduce<Record<number, Event<T>[]>>((acc, ev) => {
    (acc[ev.dayIndex] ||= []).push(ev);
    return acc;
  }, {});

  type Point = { time: number; type: 'start' | 'end'; id: string };

  for (const key in grouped) {
    const dayEvents = grouped[key as any];
    if (dayEvents.length <= maxEventsOverlapping) continue; // cannot overflow threshold

    const points: Point[] = [];
    for (const ev of dayEvents) {
      points.push({ time: getTotalMinutes(ev.start_hour), type: 'start', id: ev.id });
      points.push({ time: getTotalMinutes(ev.end_hour), type: 'end', id: ev.id });
    }
    points.sort((a, b) => a.time - b.time || (a.type === b.type ? 0 : (a.type === 'end' ? -1 : 1)));

    const active = new Set<string>();
    for (const p of points) {
      if (p.type === 'start') {
        active.add(p.id);
        if (active.size > maxEventsOverlapping) {
          for (const id of active) offending.add(id);
        }
      } else {
        active.delete(p.id);
      }
    }
  }

  return offending;
}
