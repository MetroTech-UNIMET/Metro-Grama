import { cn } from '@utils/className';
import type { Event } from '../../types';

interface Props {
  containerClassName?: string;
  event: Event;
}
export function BaseEvent({ event, containerClassName }: Props) {
  return (
    <div
      className={cn(
        'block w-full rounded-md border-l-4 p-4 shadow-xs transition-all hover:shadow-md',
        containerClassName,
        getEventColor(event.type),
      )}
    >
      <time className="block text-sm opacity-70 md:text-xs">
        {event.start_hour} - {event.end_hour}
      </time>
      <div className="text-base font-medium md:text-lg">{event.title}</div>
    </div>
  );
}

const getEventColor = (type: Event['type']) => {
  switch (type) {
    case 'abs':
      return 'bg-amber-200  border-amber-400';
    case 'rowing':
      return 'bg-teal-800 text-white  border-teal-900';
    case 'yoga1':
      return 'bg-pink-200  border-pink-300';
    case 'restorative':
      return 'bg-green-200  border-green-300';
    default:
      return 'bg-gray-200  border-gray-400';
  }
};
