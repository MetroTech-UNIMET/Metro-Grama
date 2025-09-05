// inspired from: https://codyhouse.co/ds/components/info/weekly-schedule
import { useState } from 'react';
import { format, type Locale } from 'date-fns';
import { es } from 'date-fns/locale';

import { WeeklyPlannerProvider } from './context';
import { DaysColumns } from './components/DayColumn';
import { MobileDayColumns } from './components/DayColumn/MobileDayColumns';
import { MobileTabNavigation } from './components/MobileTabNavigation';
import { PlannerGrid, PlannerGridProps } from './components/PlannerGrid';
import { daysOfWeek } from './constants';

import { useResizeObserver } from '@/hooks/use-resize-observer';
import { useScrollbarWidth } from '@/hooks/use-scrollbar-width';

import { Tabs } from '@ui/tabs';

import type { Event, DaySchedule } from './types';

export type WeeklyPlannerProps<T> = {
  events: Event<T>[];
  type: 'uniform-interval' | 'custom-interval';
  locale?: Locale;
  rowHeight?: string;
  extraDecoration?: PlannerGridProps['extraDecoration'];
  shouldRenderTime?: PlannerGridProps['shouldRenderTime'];
  children?: React.ReactNode;
} & (UniformIntervalProps | CustomIntervalProps);

interface UniformIntervalProps {
  type: 'uniform-interval';
  start_hour: string;
  end_hour: string;
  interval: number;
}

interface CustomIntervalProps {
  type: 'custom-interval';
  timeSlots: string[];
}

export function WeeklyPlanner<T>({
  events,
  locale = es,
  shouldRenderTime,
  extraDecoration,
  rowHeight = '3.5rem',
  children,
  ...props
}: WeeklyPlannerProps<T>) {
  const schedules: DaySchedule[] = Array.from({ length: 7 }, (_, dayIndex) => ({
    day: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + dayIndex)),
    events: events.filter((event) => event.dayIndex === dayIndex),
  }));

  const [isMobile, setIsMobile] = useState<boolean | undefined>(false);
  const scrollbarWidth = useScrollbarWidth();

  const ref = useResizeObserver<HTMLDivElement>({
    onResize: (width, ref) => {
      const { scrollHeight, clientHeight } = ref;
      const hasVerticalScrollbar = scrollHeight > clientHeight;
      const offsetWidth = hasVerticalScrollbar ? -scrollbarWidth : 0;

      setIsMobile(width < 1024 - 1 + offsetWidth);
    },
  });

  return (
    <WeeklyPlannerProvider events={events} {...props}>
      <Tabs defaultValue={format(daysOfWeek[0], 'EEE', { locale })} asChild>
        <div ref={ref} className="relative" style={{ '--height-row': rowHeight } as React.CSSProperties}>
          {!!isMobile && <MobileTabNavigation />}

          {!!isMobile ? <MobileDayColumns schedules={schedules} /> : <DaysColumns schedules={schedules} />}

          {!isMobile && <PlannerGrid shouldRenderTime={shouldRenderTime} extraDecoration={extraDecoration} />}

          {children}
        </div>
      </Tabs>
    </WeeklyPlannerProvider>
  );
}
