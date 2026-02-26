import { intervalToDuration } from "date-fns";
import { getHourMinutes } from "../../utils";

export function calculateUniformHeight(
  start: string,
  end: string,
  planner_interval: number
) {
  const { hours: startHour, minutes: startMinute } = getHourMinutes(start);
  const { hours: endHour, minutes: endMinute } = getHourMinutes(end);

  const { hours, minutes } = intervalToDuration({
    start: new Date(0, 0, 0, startHour, startMinute),
    end: new Date(0, 0, 0, endHour, endMinute),
  });

  const durationInMinutes = (hours ?? 0) * 60 + (minutes ?? 0);
  return durationInMinutes / planner_interval;
}

export function calculateUniformTop(
  start: string,
  planner_start_hour: string,
  planner_interval: number
) {
  const [hour, minute] = start.split(":").map(Number);
  const [plannerStartHour, plannerStartMinute] = planner_start_hour
    .split(":")
    .map(Number);
  const totalMinutes = hour * 60 + minute;
  const plannerStartTotal = plannerStartHour * 60 + plannerStartMinute;
 
  return (totalMinutes - plannerStartTotal) / planner_interval;
}

export function calculateCustomHeight(
  start: string,
  end: string,
  timeSlots: string[]
) {
  const { hours: startHour, minutes: startMinute } = getHourMinutes(start);
  const { hours: endHour, minutes: endMinute } = getHourMinutes(end);

  let height = 0;
  let isWithinInterval = false;

  for (let i = 0; i < timeSlots.length - 1; i++) {
    const { hours: slotHour, minutes: slotMinute } = getHourMinutes(
      timeSlots[i]
    );
    const { hours: nextSlotHour, minutes: nextSlotMinute } = getHourMinutes(
      timeSlots[i + 1]
    );

    const slotTime = slotHour * 60 + slotMinute;
    const nextSlotTime = nextSlotHour * 60 + nextSlotMinute;

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime >= slotTime && startTime < nextSlotTime) {
      height += (nextSlotTime - startTime) / (nextSlotTime - slotTime);
      isWithinInterval = true;
    } else if (
      isWithinInterval &&
      endTime >= slotTime &&
      endTime < nextSlotTime
    ) {
      height += (endTime - slotTime) / (nextSlotTime - slotTime);
      break;
    } else if (isWithinInterval) {
      height += 1; // Full interval
    }
  }

  return height;
}

export function calculateCustomTop(start: string, timeSlots: string[]) {
  const { hours: startHour, minutes: startMinute } = getHourMinutes(start);

  for (let i = 0; i < timeSlots.length - 1; i++) {
    const { hours: slotHour, minutes: slotMinute } = getHourMinutes(
      timeSlots[i]
    );

    const { hours: nextSlotHour, minutes: nextSlotMinute } = getHourMinutes(
      timeSlots[i + 1]
    );

    const slotTime = slotHour * 60 + slotMinute;
    const nextSlotTime = nextSlotHour * 60 + nextSlotMinute;
    const startTime = startHour * 60 + startMinute;

    if (startTime === slotTime) {
      return i;
    } else if (startTime > slotTime && startTime < nextSlotTime) {
      return i + (startTime - slotTime) / (nextSlotTime - slotTime);
    }
  }

  return 0; // Invalid start time
}
