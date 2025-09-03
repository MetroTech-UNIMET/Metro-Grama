import { Pencil, Plus, Trash } from 'lucide-react';

import { weekDayOptions } from './SubjectOfferForm/constants';

import { cn } from '@utils/className';
import { formatTimeHour } from '@utils/time';

import { SidebarGroup } from '@ui/sidebar';
import { Button } from '@ui/button';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';
import type { Id } from '@/interfaces/surrealDb';

interface Props {
  subjectOffer: SubjectOfferWithSections;

  isSelected: boolean;
  onAddSubject: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => void;
  onRemoveSubject: (subjectOfferId: Id) => void;

  onRequestEdit?: () => void;
}

export function SubjectOfferSchedulesList({
  subjectOffer,
  onAddSubject,
  isSelected,
  onRemoveSubject,
  onRequestEdit,
}: Props) {
  const sections = subjectOffer.sections;

  return (
    <SidebarGroup>
      <div className="flex w-full items-center"></div>
      <Button
        variant="outline"
        className="border-yellow-400 text-black hover:bg-yellow-200 active:bg-yellow-100"
        onClick={onRequestEdit}
      >
        Editar horarios
        <Pencil />
      </Button>

      <div className="mt-4 flex flex-col gap-4">
        {(!sections || sections.length === 0) && <div className="text-muted-foreground text-sm">Sin horarios</div>}

        {sections?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="flex flex-col gap-2">
            {/* <h4 className="text-center font-semibold">Sección {idx + 1}</h4> */}

            {section.schedules.map((sch, idx) => (
              <ScheduleItem key={idx} schedule={sch} />
            ))}
            <Button
              colors={isSelected ? 'destructive' : 'primary'}
              onClick={() => (isSelected ? onRemoveSubject(subjectOffer.id) : onAddSubject(subjectOffer, sectionIndex))}
            >
              {isSelected ? (
                <>
                  <Trash />
                  Eliminar del horario
                </>
              ) : (
                <>
                  <Plus />
                  Agregar Sección {sectionIndex + 1} al horario
                </>
              )}
            </Button>
          </div>
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
