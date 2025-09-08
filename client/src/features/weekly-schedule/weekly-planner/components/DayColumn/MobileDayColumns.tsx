import { format } from 'date-fns';

import { MobileEvent } from '../Event';
import { useWeeklyPlannerContext } from '../../context';

import { TabsContent } from '@ui/tabs';

import type { DaySchedule } from '../../types';

interface Props {
  schedules: DaySchedule[];
}

export function MobileDayColumns({ schedules }: Props) {
  const { locale, overlappingEventIds } = useWeeklyPlannerContext();

  return (
    <>
      {schedules.map((day) => {
        const value = format(day.day, 'EEE', { locale });
        return (
          <TabsContent key={`mobile-${day.day.toISOString()}`} value={value}>
            <ul className="flex flex-col flex-wrap gap-4">
              {day.events.length > 0 ? (
                day.events.map((event) => (
                  <MobileEvent key={event.id} event={event} isOverlapping={overlappingEventIds.has(event.id)} />
                ))
              ) : (
                <li className="text-gray-500">No tienes clases programadas</li>
              )}
            </ul>
          </TabsContent>
        );
      })}
    </>
  );
}
