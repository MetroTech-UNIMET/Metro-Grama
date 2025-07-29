import {
  calculateCustomHeight,
  calculateCustomTop,
  calculateUniformHeight,
  calculateUniformTop,
} from "./functions";
import { useWeeklyPlannerContext } from "../../context";

import { cn } from "@utils/className";

import type { Event } from "../../types";

interface Props {
  event: Event;
}

export function PlannerEvent({ event }: Props) {
  const { start_hour: planner_start_hour, ...props } =
    useWeeklyPlannerContext();

  const height =
    props.type === "uniform-interval"
      ? calculateUniformHeight(event.start_hour, event.end_hour, props.interval)
      : calculateCustomHeight(
          event.start_hour,
          event.end_hour,
          props.timeSlots
        );

  const top =
    props.type === "uniform-interval"
      ? calculateUniformTop(
          event.start_hour,
          planner_start_hour,
          props.interval
        )
      : calculateCustomTop(event.start_hour, props.timeSlots);

  // console.log(event.start_hour, event.end_hour, top);

  return (
    <>
      <li
        key={event.id}
        className="md:px-px"
        style={
          {
            "--w-schedule-event-top": `calc(3rem * ${top})`,
            "--w-schedule-event-height": `calc(3rem * ${height})`,
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "w-full block p-4 rounded-md shadow-sm hover:shadow-md transition-all border-l-4",
            "absolute h-[var(--w-schedule-event-height)] top-[var(--w-schedule-event-top)]",
            getEventColor(event.type)
          )}
        >
          <time className="text-sm opacity-70 block md:text-xs">
            {event.start_hour} - {event.end_hour}
          </time>
          <div className="text-base md:text-lg font-medium">{event.title}</div>
        </div>
      </li>
    </>
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
