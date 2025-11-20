/** Generic interval overlap detection for items with a day and start/end (in minutes) */
export function findOverlappingIndicesByDay<T>(
  items: T[],
  getDay: (item: T) => number,
  getStart: (item: T) => number,
  getEnd: (item: T) => number,
): Set<number> {
  const overlapping = new Set<number>();
  if (!items || items.length < 2) return overlapping;

  const grouped: Record<number, { start: number; end: number; index: number }[]> = {};
  items.forEach((item, index) => {
    const day = getDay(item);
    if (typeof day !== 'number') return;
    const start = getStart(item);
    const end = getEnd(item);
    (grouped[day] ||= []).push({ start, end, index });
  });

  for (const dayKey in grouped) {
    const arr = grouped[dayKey];
    if (arr.length < 2) continue;
    arr.sort((a, b) => a.start - b.start || a.end - b.end);
    let prev = arr[0];
    for (let i = 1; i < arr.length; i++) {
      const curr = arr[i];
      if (curr.start < prev.end) {
        overlapping.add(prev.index);
        overlapping.add(curr.index);
        if (curr.end > prev.end) prev = curr;
      } else {
        prev = curr;
      }
    }
  }
  return overlapping;
}

/** Specialized for subject schedules after transform in zod schema. */
export function getOverlappingScheduleIndices(
  schedules: {
    day_of_week: number;
    starting_time: { hours: number; minutes: number };
    ending_time: { hours: number; minutes: number };
  }[],
): Set<number> {
  return findOverlappingIndicesByDay(
    schedules,
    (s) => s.day_of_week,
    (s) => s.starting_time.hours * 60 + s.starting_time.minutes,
    (s) => s.ending_time.hours * 60 + s.ending_time.minutes,
  );
}

/** Concurrency offending events beyond max allowed simultaneously. */
export function findConcurrentOffenders<
  T extends { id: string; dayIndex: number; start_hour: string; end_hour: string },
>(maxEventsOverlapping: number, events: T[]): Set<string> {
  if (maxEventsOverlapping < 1) return new Set();
  if (!events || events.length === 0) return new Set();

  const offending = new Set<string>();
  const grouped = events.reduce<Record<number, T[]>>((acc, ev) => {
    (acc[ev.dayIndex] ||= []).push(ev);
    return acc;
  }, {});

  type Point = { time: number; type: 'start' | 'end'; id: string };

  for (const key in grouped) {
    const dayEvents = grouped[key];
    if (dayEvents.length <= maxEventsOverlapping) continue;

    const points: Point[] = [];
    for (const ev of dayEvents) {
      points.push({ time: toMinutes(ev.start_hour), type: 'start', id: ev.id });
      points.push({ time: toMinutes(ev.end_hour), type: 'end', id: ev.id });
    }
    points.sort((a, b) => a.time - b.time || (a.type === b.type ? 0 : a.type === 'end' ? -1 : 1));

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

// Helper to convert HH:MM into total minutes.
export function toMinutes(hour: string): number {
  const [h, m] = hour.split(':').map(Number);
  return h * 60 + m;
}
