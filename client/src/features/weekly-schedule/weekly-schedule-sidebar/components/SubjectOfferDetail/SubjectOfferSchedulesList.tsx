import { useMemo } from 'react';
import { Pencil, Plus, Trash } from 'lucide-react';

import { usePlannerSidebarContext } from '../../context/PlannerSidebarContext';

import { weekDayOptions } from '@/lib/constants/date';
import { cn } from '@utils/className';
import { formatTimeHour } from '@utils/time';

import { SidebarGroup } from '@ui/sidebar';
import { Button } from '@ui/button';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  isSelected: boolean;
  onRequestEdit?: () => void;
}

export function SubjectOfferSchedulesList({ subjectOffer, isSelected, onRequestEdit }: Props) {
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
          <SectionSchedules
            key={sectionIndex}
            section={section}
            sectionIndex={sectionIndex}
            subjectOffer={subjectOffer}
            isSelected={isSelected}
          />
        ))}
      </div>
    </SidebarGroup>
  );
}

interface SectionSchedulesProps {
  subjectOffer: SubjectOfferWithSections;
  isSelected: boolean;

  section: SubjectOfferWithSections['sections'][number];
  sectionIndex: number;
}

function SectionSchedules({ section, sectionIndex, subjectOffer, isSelected }: SectionSchedulesProps) {
  const { onAddSubject, onRemoveSubject, getWouldCauseTripleOverlap, getIsSectionSelected } =
    usePlannerSidebarContext();
  const isSectionSelected = getIsSectionSelected(subjectOffer, sectionIndex);

  const wouldCauseTripleOverlap = useMemo(
    () => getWouldCauseTripleOverlap(section.schedules),
    [getWouldCauseTripleOverlap, section.schedules],
  );
  const sectionNumber = sectionIndex + 1;

  return (
    <div className="flex flex-col gap-2">
      {section.schedules.map((sch, idx) => (
        <ScheduleItem key={idx} schedule={sch} isSectionSelected={isSectionSelected} />
      ))}
      <Button
        colors={isSelected ? 'destructive' : 'primary'}
        disabled={!isSelected && wouldCauseTripleOverlap}
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
            Agregar Sección {sectionNumber} al horario
          </>
        )}
      </Button>

      {!isSelected && wouldCauseTripleOverlap && (
        <span className="text-destructive text-sm">
          No puedes agregar la <strong>sección {sectionNumber}</strong>: ya existen 2 materias{' '}
          <strong>solapando</strong> en ese bloque de horario.
        </span>
      )}
    </div>
  );
}

function ScheduleItem({ schedule, isSectionSelected }: { schedule: SubjectSchedule; isSectionSelected: boolean }) {
  const startStr = formatTimeHour(schedule.starting_hour, schedule.starting_minute);
  const endStr = formatTimeHour(schedule.ending_hour, schedule.ending_minute);

  return (
    <div className={cn('flex flex-col gap-3 rounded-md border p-3', isSectionSelected && 'border-primary')}>
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
