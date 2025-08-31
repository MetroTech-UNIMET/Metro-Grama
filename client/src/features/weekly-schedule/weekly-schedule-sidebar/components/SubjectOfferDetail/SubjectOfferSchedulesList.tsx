import { Pencil, Plus } from 'lucide-react';

import { weekDayOptions } from './SubjectOfferForm/constants';

import { cn } from '@utils/className';
import { formatTimeHour } from '@utils/time';

import { SidebarGroup } from '@ui/sidebar';
import { Button } from '@ui/button';

import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';
// removed inline editing in favor of parent-controlled pseudo-router

interface Props {
  subjectOffer: SubjectOfferWithSchedules;
  onAddSubject: (subjectOffer: SubjectOfferWithSchedules) => void;
  onRequestEdit?: () => void;
}

export function SubjectOfferSchedulesList({ subjectOffer, onAddSubject, onRequestEdit }: Props) {
  const schedules = subjectOffer.schedules;

  return (
    <SidebarGroup>
      <div className="flex w-full items-center">
        <Button colors="primary" className="w-full rounded-r-none" onClick={() => onAddSubject(subjectOffer)}>
          <Plus />
          Agregar al horario
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-l-none border-yellow-400 text-black hover:bg-yellow-200 active:bg-yellow-100"
          onClick={onRequestEdit}
        >
          <Pencil />
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {(!schedules || schedules.length === 0) && <div className="text-muted-foreground text-sm">Sin horarios</div>}

        {schedules?.map((sch, idx) => (
          <ScheduleItem key={idx} schedule={sch} />
        ))}
      </div>
    </SidebarGroup>
  );
}

function ScheduleItem({ schedule }: { schedule: SubjectSchedule }) {
  const startStr = formatTimeHour(schedule.starting_hour, schedule.starting_minute);
  const endStr = formatTimeHour(schedule.ending_hour, schedule.ending_minute);

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="text-sm font-medium">
        {startStr} - {endStr}
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
