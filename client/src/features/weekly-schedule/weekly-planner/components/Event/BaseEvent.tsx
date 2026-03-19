import { cn } from '@utils/className';
import type { Event } from '../../types';

interface Props<T> {
  containerClassName?: string;
  event: Event<T>;
  getEventColorId?: (event: Event<T>) => string;
}
export function BaseEvent<T>({ event, containerClassName, getEventColorId }: Props<T>) {
  console.log(event);
  
  const colorId = getEventColorId ? getEventColorId(event) : event.id;

  return (
    <div
      className={cn(
        'block w-full rounded-md border-l-4 p-4 shadow-xs transition-all hover:shadow-md',
        containerClassName,
        getEventColor(colorId),
      )}
    >
      <time className="block text-sm opacity-70 md:text-xs">
        {event.start_hour} - {event.end_hour}
      </time>
      <div className="overflow-hidden text-base font-medium text-ellipsis md:text-lg">{event.title}</div>
    </div>
  );
}

const EVENT_COLORS = [
  'bg-blue-800 text-white border-blue-900',
  'bg-red-800 text-white border-red-900',
  'bg-green-800 text-white border-green-900',
  'bg-amber-800 text-white border-amber-900',
  'bg-purple-800 text-white border-purple-900',
  'bg-pink-800 text-white border-pink-900',
  'bg-indigo-800 text-white border-indigo-900',
  'bg-teal-800 text-white border-teal-900',
  'bg-orange-800 text-white border-orange-900',
  'bg-cyan-800 text-white border-cyan-900',
  'bg-emerald-800 text-white border-emerald-900',
  'bg-fuchsia-800 text-white border-fuchsia-900',
  'bg-violet-800 text-white border-violet-900',
  'bg-rose-800 text-white border-rose-900',
];

const getEventColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % EVENT_COLORS.length);
  return EVENT_COLORS[index ];
};
