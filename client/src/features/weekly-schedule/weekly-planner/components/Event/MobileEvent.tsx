import { BaseEvent } from './BaseEvent';
import type { Event } from '../../types';

interface Props {
  event: Event;
}
export function MobileEvent({ event }: Props) {
  return (
    <li>
      <BaseEvent event={event} />
    </li>
  );
}
