import { type DateValues, set } from 'date-fns';

export function formatTimeHour(hours: number, minutes: number) {
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}` as const;
}

export function getTimeDate(values: DateValues) {
  return set(new Date(), { seconds: 0, milliseconds: 0, ...values });
}
