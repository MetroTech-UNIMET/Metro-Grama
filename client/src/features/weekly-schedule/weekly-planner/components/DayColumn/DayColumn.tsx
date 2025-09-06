import { format } from 'date-fns';

import { computeEventLayouts } from './functions';

import { useWeeklyPlannerContext } from '../../context';
import { PlannerEvent } from '../Event';

import type { Day, DaySchedule, Event } from '../../types';

interface Props {
  day: Day;
  events: Event[];
}

export function DaysColumns({ schedules }: { schedules: DaySchedule[] }) {
  const { timeSlots, locale } = useWeeklyPlannerContext();
  return (
    <section
      style={
        {
          '--height': `calc(var(--height-row) * ${timeSlots.length + 1})`,
        } as React.CSSProperties
      }
      className={`relative z-20 ml-[60px] flex h-(--height)`}
    >
      {schedules.map((day) => (
        <DayColumns
          key={day.day.toISOString()}
          day={{
            name: format(day.day, 'EEEE', { locale }),
          }}
          events={day.events}
        />
      ))}
    </section>
  );
}

function DayColumns({ day, events }: Props) {
  // NOTE: We assume there can be at most two overlapping events at any given time.
  const layouts = computeEventLayouts(events);

  return (
    <section className="relative block! grow basis-0 border-l border-gray-200 pt-0 last:border-r" role="tabpanel">
      <div className="hidden h-(--height-row) items-center justify-center border-b border-gray-200 py-2 text-sm font-medium capitalize md:flex">
        {day.name}
      </div>
      <ul className="relative md:h-full">
        {layouts.map(({ event, overlapped, column }) => (
          <PlannerEvent key={event.id} event={event} layout={{ overlapped, column }} />
        ))}
      </ul>
    </section>
  );
}
