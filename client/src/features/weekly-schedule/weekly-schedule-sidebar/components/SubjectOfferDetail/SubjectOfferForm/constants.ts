import { getTimeDate } from '@utils/time';

export const default8Hour = getTimeDate({ hours: 8, minutes: 45 });
export const default10Hour = getTimeDate({ hours: 10, minutes: 30 });

/** 2 academics hours (45min) + 15min of recess */
export const correctIntervalBetweenHours = 90 + 15;

export const defaultSchedule = {
  starting_time: default8Hour,
  ending_time: default10Hour,
  day_of_week: null as any,
};
