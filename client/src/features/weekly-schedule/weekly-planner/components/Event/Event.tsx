import { calculateCustomHeight, calculateCustomTop, calculateUniformHeight, calculateUniformTop } from './functions';
import { BaseEvent } from './BaseEvent';
import { useWeeklyPlannerContext } from '../../context';

import type { Event } from '../../types';

interface Props {
  event: Event;
  layout?: { overlapped: boolean; column: 0 | 1 };
}

export function PlannerEvent({ event, layout }: Props) {
  const { start_hour: planner_start_hour, ...props } = useWeeklyPlannerContext();

  const height =
    props.type === 'uniform-interval'
      ? calculateUniformHeight(event.start_hour, event.end_hour, props.interval)
      : calculateCustomHeight(event.start_hour, event.end_hour, props.timeSlots);

  const top =
    props.type === 'uniform-interval'
      ? calculateUniformTop(event.start_hour, planner_start_hour, props.interval)
      : calculateCustomTop(event.start_hour, props.timeSlots);

  const widthClass = layout?.overlapped ? 'w-1/2' : 'w-full';
  const leftClass = layout?.overlapped ? (layout.column === 0 ? 'left-0' : 'left-1/2') : 'left-0';

  return (
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
        containerClassName={`absolute top-(--w-schedule-event-top) h-(--w-schedule-event-height) ${widthClass} ${leftClass}`}
      />
    </li>
  );
}
