import { useMemo } from 'react';
import { format } from 'date-fns';

import { daysOfWeek } from '../constants';
import { useWeeklyPlannerContext } from '../context';

import { TabsList, TabsTrigger } from '@ui/tabs';

export function MobileTabNavigation() {
  const { locale } = useWeeklyPlannerContext();
  const weekdays = useMemo(() => daysOfWeek.map((day) => format(day, 'EEE', { locale })), [locale]);

  return (
    <TabsList className="flex h-20 items-center gap-2 bg-transparent">
      {weekdays.map((day) => (
        <TabsTrigger key={day} className="h-20 grow basis-0 bg-gray-100 text-xl uppercase" value={day}>
          {day}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
// data-[state=active]
