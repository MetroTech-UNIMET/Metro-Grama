import { useMemo } from 'react';
import { Pencil, Plus, Trash } from 'lucide-react';

import { usePlannerSidebarContext } from '../../../context/PlannerSidebarContext';
import { ScheduleItem } from './ScheduleItem';

import { SidebarGroup } from '@ui/sidebar';
import { Button } from '@ui/button';
import { ButtonGroup } from '@ui/button-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

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

// TODO - Considerar hacer que el studentsPlanningToEnroll aumente dependiendo si fue seleccionado o no
// Tomar en cuenta que
function SectionSchedules({ section, sectionIndex, subjectOffer, isSelected }: SectionSchedulesProps) {
  const {
    onAddSubject,
    onRemoveSubject,
    getWouldCauseTripleOverlap,
    getIsSectionSelected,
    getAdjustedStudentsPlanningToEnroll,
  } = usePlannerSidebarContext();
  const isSectionSelected = getIsSectionSelected(subjectOffer, sectionIndex);

  const wouldCauseTripleOverlap = useMemo(
    () => getWouldCauseTripleOverlap(section.schedules),
    [getWouldCauseTripleOverlap, section.schedules],
  );

  const sectionNumber = sectionIndex + 1;

  const studentsPlanningToEnroll = getAdjustedStudentsPlanningToEnroll(subjectOffer, sectionIndex);

  const moreThan1StudentPlanningToEnroll = studentsPlanningToEnroll > 1;

  return (
    <div className="flex flex-col gap-2">
      {section.schedules.map((sch, idx) => (
        <ScheduleItem key={idx} schedule={sch} isSectionSelected={isSectionSelected} />
      ))}
      <div className="flex flex-row gap-2">
        <ButtonGroup className="w-full">
          <Button
            colors={isSelected ? 'destructive' : 'primary'}
            disabled={!isSelected && wouldCauseTripleOverlap}
            onClick={() =>
              isSelected ? onRemoveSubject(subjectOffer, sectionIndex) : onAddSubject(subjectOffer, sectionIndex)
            }
            className="w-full"
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
          {/* TODO - Seguramente tenga que ver como hacer esto para mobile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" colors="secondary" variant="outline" className="w-fit min-w-9 px-1">
                {studentsPlanningToEnroll}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {studentsPlanningToEnroll} estudiante{moreThan1StudentPlanningToEnroll ? 's' : ''} planea
              {moreThan1StudentPlanningToEnroll ? 'n' : ''} inscribir esta sección
              {studentsPlanningToEnroll === 0 && '. Sé el primero!'}
            </TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </div>

      {!isSelected && wouldCauseTripleOverlap && (
        <span className="text-destructive text-sm">
          No puedes agregar la <strong>sección {sectionNumber}</strong>: ya existen 2 materias{' '}
          <strong>solapando</strong> en ese bloque de horario.
        </span>
      )}
    </div>
  );
}
