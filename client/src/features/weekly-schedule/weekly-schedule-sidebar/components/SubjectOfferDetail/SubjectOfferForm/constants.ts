import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

import { getTimeDate } from '@utils/time';

const locale = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? es : enUS;
const weekdayDates = Array.from({ length: 7 }).map((_, i) => new Date(1970, 0, 4 + i));
export const weekDayOptions = weekdayDates.map((date, idx) => ({
  value: idx,
  label: format(date, 'EEEE', { locale }),
}));

export const default8Hour = getTimeDate({ hours: 8, minutes: 45 });
export const default10Hour = getTimeDate({ hours: 10, minutes: 30 });

/** 2 academics hours (45min) + 15min of recess */
export const correctIntervalBetweenHours = 90 + 15;

export const defaultSchedule = {
  starting_time: default8Hour,
  ending_time: default10Hour,
  day_of_week: null as any,
}