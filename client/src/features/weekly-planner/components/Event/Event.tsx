import { calculateCustomHeight, calculateCustomTop, calculateUniformHeight, calculateUniformTop } from './functions';
import { useWeeklyPlannerContext } from '../../context';

import { cn } from '@utils/className';

import type { Event } from '../../types';
import { BaseEvent } from './BaseEvent';

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

  // console.log(event.start_hour, event.end_hour, top);

  return (
    <>
      <li
        key={event.id}
        className="md:px-px"
        style={
          {
            '--w-schedule-event-top': `calc(3rem * ${top})`,
            '--w-schedule-event-height': `calc(3rem * ${height})`,
          } as React.CSSProperties
        }
      >
        <BaseEvent
          event={event}
          containerClassName="absolute top-[var(--w-schedule-event-top)] h-[var(--w-schedule-event-height)]"
        />
      </li>
    </>
  );
}
