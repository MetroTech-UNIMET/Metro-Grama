import { ThumbsUp } from 'lucide-react';

import { weekDayOptions } from '@/lib/constants/date';
import { cn } from '@utils/className';
import { formatTimeHour } from '@utils/time';

import { Button } from '@ui/button';

import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';

// TODO - Query para saber si el usuario ya le dió like
export function ScheduleItem({
  schedule,
  isSectionSelected,
}: {
  schedule: SubjectSchedule;
  isSectionSelected: boolean;
}) {
  const isSectionLiked = false;
  const startStr = formatTimeHour(schedule.starting_hour, schedule.starting_minute);
  const endStr = formatTimeHour(schedule.ending_hour, schedule.ending_minute);

  return (
    <div className={cn('flex flex-col gap-3 rounded-md border p-3', isSectionSelected && 'border-primary')}>
      <div className="flex flex-row justify-between">
        <div className="text-sm font-medium">
          {startStr} - {endStr}
        </div>

        <Button size="icon" variant={isSectionLiked ? 'ghost' : 'outline'} colors="success" className="text-success">
          <ThumbsUp />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        {weekDayOptions.map((d, i) => {
          const active = i === schedule.day_of_week;
          return (
            <div
              key={i}
              className={cn(
                'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground/70',
              )}
              title={d.label}
            >
              {d.label.slice(0, 2).toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
