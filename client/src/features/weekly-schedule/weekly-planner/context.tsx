import { createContext, use, useMemo } from 'react';

import { getTotalMinutes, checkEventsOverlapping } from './utils';

import { defaultLocale } from '@/lib/constants/date';

import type { WeeklyPlannerProps } from './WeeklyPlanner';
import type { Locale } from 'date-fns/locale';

type WeeklyPlannerContextProps<T> = (WeeklyPlannerContexUniform | WeeklyPlannerContexCustom) & {
  locale: Locale;
  type: WeeklyPlannerProps<T>['type'];
  events: WeeklyPlannerProps<T>['events'];
  overlapping: boolean;
  overlappingEventIds: Set<string>;

  start_hour: string;
  end_hour: string;
  timeSlots: string[];
};

interface WeeklyPlannerContexUniform {
  type: 'uniform-interval';
  interval: number;
}

interface WeeklyPlannerContexCustom {
  type: 'custom-interval';
}

const WeeklyPlannerContext = createContext<WeeklyPlannerContextProps<any> | undefined>(undefined);

export function useWeeklyPlannerContext<T = any>(): WeeklyPlannerContextProps<T> {
  const context = use(WeeklyPlannerContext) as WeeklyPlannerContextProps<T> | undefined;
  if (!context) {
    throw new Error('useWeeklyPlannerContext must be used within a WeeklyPlannerProvider');
  }
  return context;
}

export function WeeklyPlannerProvider<T>({
  children,
  ...props
}: {
  children: React.ReactNode;
} & WeeklyPlannerProps<T>) {
  const start_hour = props.type === 'uniform-interval' ? props.start_hour : props.timeSlots[0];
  const end_hour = props.type === 'uniform-interval' ? props.end_hour : props.timeSlots[props.timeSlots.length - 1];

  const interval = props.type === 'uniform-interval' ? props.interval : 0;

  const timeSlots =
    props.type === 'uniform-interval' ? getTimeSlots(start_hour, end_hour, props.interval) : props.timeSlots;

  const overlappingEventIds = useMemo(
    () => checkEventsOverlapping(props.overlapping ? 1 : 0, props.events),
    [props.events, props.overlapping],
  );

  return (
    <WeeklyPlannerContext.Provider
      value={{
        locale: props.locale || defaultLocale,
        type: props.type,
        start_hour,
        end_hour,
        timeSlots,
        interval,
        events: props.events,
        overlapping: props.overlapping || false,
        overlappingEventIds,
      }}
    >
      {children}
    </WeeklyPlannerContext.Provider>
  );
}

function getTimeSlots(start: string, end: string, interval: number) {
  if (!start || !end) return [];
  if (interval <= 0 || interval > 60) throw new Error('Interval must be between 1 and 60 minutes.');

  const startTime = getTotalMinutes(start);
  const endTime = getTotalMinutes(end);

  const slots: string[] = [];
  for (let time = startTime; time <= endTime; time += interval) {
    const hours = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (time % 60).toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
  }

  return slots;
}
