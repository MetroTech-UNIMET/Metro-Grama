import { createContext, useContext } from 'react';
import { es, type Locale } from 'date-fns/locale';

import { getTotalMinutes } from './utils';

import type { WeeklyPlannerProps } from './WeeklyPlanner';

type WeeklyPlannerContextProps<T> = (WeeklyPlannerContexUniform | WeeklyPlannerContexCustom) & {
  locale: Locale;
  type: WeeklyPlannerProps<T>['type'];

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

export const useWeeklyPlannerContext = () => {
  const context = useContext(WeeklyPlannerContext);
  if (!context) {
    throw new Error('useWeeklyPlannerContext must be used within a WeeklyPlannerProvider');
  }
  return context;
};

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

  return (
    <WeeklyPlannerContext.Provider
      value={{
        locale: props.locale || es,
        type: props.type,
        start_hour,
        end_hour,
        timeSlots,
        interval,
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
