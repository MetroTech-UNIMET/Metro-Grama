import type { Day, Event } from "../../types";
import { PlannerEvent } from "../Event";

interface Props {
  day: Day;
  events: Event[];
}

export function DayColumn({ day, events }: Props) {
  return (
    <section
      className="relative !block grow basis-0 pt-0 border-l last:border-r border-gray-200"
      role="tabpanel"
    >
      <div className="h-12 text-sm font-medium py-2 border-b border-gray-200 hidden md:flex justify-center items-center capitalize">
        {day.name}
      </div>
      <ul className="relative md:h-full">
        {events.map((event) => (
          <PlannerEvent key={event.id} event={event} />
        ))}
      </ul>
    </section>
  );
}
