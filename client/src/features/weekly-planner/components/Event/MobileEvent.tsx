import { cn } from "@utils/className";
import type { Event } from "../../types";

interface Props {
  event: Event;
}
export function MobileEvent({ event }: Props) {
  return (
    <li key={event.id}>
      <div
        className={cn(
          "w-full block p-4 rounded-md shadow-sm hover:shadow-md transition-all border-l-4",
          getEventColor(event.type)
        )}
      >
        <time className="text-sm opacity-70 block md:text-xs">
          {event.start_hour} - {event.end_hour}
        </time>
        <div className="text-base md:text-lg font-medium">{event.title}</div>
      </div>
    </li>
  );
}

const getEventColor = (type: Event["type"]) => {
  switch (type) {
    case "abs":
      return "bg-amber-200  border-amber-400";
    case "rowing":
      return "bg-teal-800 text-white  border-teal-900";
    case "yoga1":
      return "bg-pink-200  border-pink-300";
    case "restorative":
      return "bg-green-200  border-green-300";
    default:
      return "bg-gray-200  border-gray-400";
  }
};
