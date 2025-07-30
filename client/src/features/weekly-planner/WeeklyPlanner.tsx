// inspired from: https://codyhouse.co/ds/components/info/weekly-schedule
import { format, type Locale } from 'date-fns';
import { es } from 'date-fns/locale';

import { WeeklyPlannerProvider } from './context';
import { DaysColumns } from './components/DayColumn';
import { MobileDayColumns } from './components/DayColumn/MobileDayColumns';
import { MobileTabNavigation } from './components/MobileTabNavigation';
import { PlannerGrid, PlannerGridProps } from './components/PlannerGrid';
import { daysOfWeek } from './constants';

import { useBreakpoint } from '@/hooks/use-is-mobile';

import { Tabs } from '@ui/tabs';

import type { SubjectEvent, DaySchedule } from './types';

export type WeeklyPlannerProps = {
  type: 'uniform-interval' | 'custom-interval';
  locale?: Locale;
  rowHeight?: string;
  extraDecoration?: PlannerGridProps['extraDecoration'];
  shouldRenderTime?: PlannerGridProps['shouldRenderTime'];
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

export function WeeklyPlanner({
  locale = es,
  shouldRenderTime,
  extraDecoration,
  rowHeight = '3.5rem',
  ...props
}: WeeklyPlannerProps) {
  const isMobile = useBreakpoint(1024);

  const subjectEvents: SubjectEvent[] = [
    {
      id: 'm1',
      start_hour: '09:30',
      end_hour: '10:30',
      title: 'Abs Circuit',
      type: 'abs',
      dayIndex: 1,
    },
    {
      id: 'm2',
      start_hour: '11:00',
      end_hour: '12:30',
      title: 'Rowing Workout',
      type: 'rowing',
      dayIndex: 1,
    },
    {
      id: 'm3',
      start_hour: '14:00',
      end_hour: '15:15',
      title: 'Yoga Level 1',
      type: 'yoga1',
      dayIndex: 1,
    },
    {
      id: 't1',
      start_hour: '10:00',
      end_hour: '11:00',
      title: 'Rowing Workout',
      type: 'rowing',
      dayIndex: 2,
    },
    {
      id: 't2',
      start_hour: '11:30',
      end_hour: '13:00',
      title: 'Restorative Yoga',
      type: 'restorative',
      dayIndex: 2,
    },
    {
      id: 't3',
      start_hour: '13:30',
      end_hour: '15:00',
      title: 'Abs Circuit',
      type: 'abs',
      dayIndex: 2,
    },
    {
      id: 't4',
      start_hour: '15:45',
      end_hour: '16:45',
      title: 'Yoga Level 1',
      type: 'yoga1',
      dayIndex: 2,
    },
    {
      id: 'w1',
      start_hour: '09:00',
      end_hour: '10:15',
      title: 'Restorative Yoga',
      type: 'restorative',
      dayIndex: 3,
    },
    {
      id: 'w2',
      start_hour: '10:45',
      end_hour: '11:45',
      title: 'Yoga Level 1',
      type: 'yoga1',
      dayIndex: 3,
    },
    {
      id: 'w3',
      start_hour: '12:00',
      end_hour: '13:45',
      title: 'Rowing Workout',
      type: 'rowing',
      dayIndex: 3,
    },
    {
      id: 'w4',
      start_hour: '13:45',
      end_hour: '15:00',
      title: 'Yoga Level 1',
      type: 'yoga1',
      dayIndex: 3,
    },
    {
      id: 'th1',
      start_hour: '09:30',
      end_hour: '10:30',
      title: 'Abs Circuit',
      type: 'abs',
      dayIndex: 4,
    },
    {
      id: 'th2',
      start_hour: '12:00',
      end_hour: '13:45',
      title: 'Restorative Yoga',
      type: 'restorative',
      dayIndex: 4,
    },
    {
      id: 'th3',
      start_hour: '15:30',
      end_hour: '16:30',
      title: 'Abs Circuit',
      type: 'abs',
      dayIndex: 4,
    },
    {
      id: 'th4',
      start_hour: '17:00',
      end_hour: '18:00',
      title: 'Rowing Workout',
      type: 'rowing',
      dayIndex: 4,
    },
    {
      id: 'f1',
      start_hour: '10:00',
      end_hour: '11:00',
      title: 'Rowing Workout',
      type: 'rowing',
      dayIndex: 5,
    },
    {
      id: 'f2',
      start_hour: '12:30',
      end_hour: '14:00',
      title: 'Abs Circuit',
      type: 'abs',
      dayIndex: 5,
    },
    {
      id: 'f3',
      start_hour: '15:45',
      end_hour: '16:45',
      title: 'Yoga Level 1',
      type: 'yoga1',
      dayIndex: 5,
    },
  ];

  const schedules: DaySchedule[] = Array.from({ length: 7 }, (_, dayIndex) => ({
    day: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + dayIndex)),
    events: subjectEvents.filter((event) => event.dayIndex === dayIndex),
  }));

  return (
    <WeeklyPlannerProvider {...props}>
      <Tabs defaultValue={format(daysOfWeek[0], 'EEE', { locale })}>
        <div className="relative" style={{ '--height-row': rowHeight } as React.CSSProperties}>
          {isMobile && <MobileTabNavigation />}

          {isMobile ? <MobileDayColumns schedules={schedules} /> : <DaysColumns schedules={schedules} />}

          {!isMobile && <PlannerGrid shouldRenderTime={shouldRenderTime} extraDecoration={extraDecoration} />}
        </div>
      </Tabs>
    </WeeklyPlannerProvider>
  );
}
