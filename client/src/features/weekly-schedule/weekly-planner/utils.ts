import type { Event } from './types';
import { findConcurrentOffenders } from '@utils/time-overlapping';

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
  return findConcurrentOffenders(maxEventsOverlapping, events);
}
