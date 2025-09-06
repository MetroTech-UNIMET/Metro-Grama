import { BaseEvent } from './BaseEvent';
import type { Event } from '../../types';

interface Props {
  event: Event;
  isOverlapping?: boolean;
}
export function MobileEvent({ event, isOverlapping }: Props) {
  return (
    <li className="relative">
      {isOverlapping && (
        <span
          className="absolute -top-2 -right-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase shadow-sm"
          title="This event overlaps with another at the same time"
          aria-label="Overlapping event"
        >
          ⇄ Solapamiento
        </span>
      )}
      <BaseEvent event={event} />
    </li>
  );
}
