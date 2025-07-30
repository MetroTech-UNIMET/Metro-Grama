import { useWeeklyPlannerContext } from "../context";

export interface PlannerGridProps {
  extraDecoration?: (time: string, index: number) => React.ReactNode;
  shouldRenderTime?: (time: string, index: number) => boolean;
}

export function PlannerGrid({
  extraDecoration,
  shouldRenderTime,
}: PlannerGridProps) {
  const { timeSlots } = useWeeklyPlannerContext();

  return (
    <div
      className="block absolute z-10 top-(--height-row) left-0 w-full"
      aria-hidden="true"
    >
      {timeSlots.map((time, index) => (
        <div key={time} className="h-(--height-row) relative">
          {extraDecoration?.(time, index)}

          {(shouldRenderTime?.(time, index) ?? true) && (
            <time className="inline-block leading-none absolute top-0 left-0 transform -translate-y-1/2">
              {time}
            </time>
          )}

          {index < timeSlots.length - 1 && (
            <div className="absolute bottom-0 left-15 right-0 h-px bg-gray-200"></div>
          )}
        </div>
      ))}
    </div>
  );
}
