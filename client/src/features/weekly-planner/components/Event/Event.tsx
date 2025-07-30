import { calculateCustomHeight, calculateCustomTop, calculateUniformHeight, calculateUniformTop } from './functions';
import { BaseEvent } from './BaseEvent';
import { useWeeklyPlannerContext } from '../../context';

import type { Event } from '../../types';

interface Props {
  event: Event;
}

export function PlannerEvent({ event }: Props) {
  const { start_hour: planner_start_hour, ...props } = useWeeklyPlannerContext();

  const height =
    props.type === 'uniform-interval'
      ? calculateUniformHeight(event.start_hour, event.end_hour, props.interval)
      : calculateCustomHeight(event.start_hour, event.end_hour, props.timeSlots);

  const top =
    props.type === 'uniform-interval'
      ? calculateUniformTop(event.start_hour, planner_start_hour, props.interval)
      : calculateCustomTop(event.start_hour, props.timeSlots);

  return (
    <>
      <li
        key={event.id}
        className="md:px-px"
        style={
          {
            '--w-schedule-event-top': `calc(var(--height-row) * ${top})`,
            '--w-schedule-event-height': `calc(var(--height-row) * ${height})`,
          } as React.CSSProperties
        }
      >
        <BaseEvent
          event={event}
          containerClassName="absolute top-(--w-schedule-event-top) h-(--w-schedule-event-height)"
        />
      </li>
    </>
  );
}
