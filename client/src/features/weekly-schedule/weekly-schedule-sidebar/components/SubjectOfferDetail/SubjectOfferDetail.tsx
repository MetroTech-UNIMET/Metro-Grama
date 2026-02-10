import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';

import SubjectOfferForm from './SubjectOfferForm/SubjectOfferForm';
import { SubjectOfferSchedulesList } from './SubjectOfferSchedulesList/SubjectOfferSchedulesList';
import { FriendsPopover } from './FriendsPopover/FriendsPopover';

import { useSubjectOfferDetailRouter } from '../../hooks/useSubjectOfferDetailRouter';
import { usePlannerSidebarContext } from '../../context/PlannerSidebarContext';

import { CardTitle, CardDescription } from '@ui/card';
import { SidebarContent, SidebarHeader } from '@ui/sidebar';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  onBack: () => void;
}

export default function SubjectOfferDetail({ subjectOffer, onBack }: Props) {
  const { getIsSubjectSelected } = usePlannerSidebarContext();
  const { view, go, back } = useSubjectOfferDetailRouter(subjectOffer);
  const handleHeaderBack = () => back(onBack);

  const isSelected = useMemo(() => getIsSubjectSelected(subjectOffer), [subjectOffer, getIsSubjectSelected]);

  return (
    <>
      <SubjectSidebarHeader subjectOffer={subjectOffer} onBack={handleHeaderBack} />

      <SidebarContent>
        {view === 'form' ? (
          <SubjectOfferForm subjectOffer={subjectOffer} onBack={() => go('list')} />
        ) : (
          <SubjectOfferSchedulesList
            subjectOffer={subjectOffer}
            isSelected={isSelected}
            onRequestEdit={() => go('form')}
          />
        )}
      </SidebarContent>
    </>
  );
}

const SubjectStat = ({ label, value }: { label: string; value: number }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className="hover:bg-accent/50 flex cursor-help flex-col items-center justify-center rounded-md border p-2 text-center transition-colors">
          {value === 0 ? (
            <span className="text-muted-foreground text-lg font-bold">-</span>
          ) : (
            <span className="text-lg font-bold">{value.toFixed(1)}</span>
          )}
          <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px] text-center">
        <p>
          Estos son los promedios de la materia en el trimestre anterior. En caso de no tener datos se muestra un "-"
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

function SubjectSidebarHeader({ subjectOffer, onBack }: Pick<Props, 'subjectOffer' | 'onBack'>) {
  const differentFriends = subjectOffer.differentFriends;

  console.log('Last Student Editor:', subjectOffer);
  return (
    <SidebarHeader>
      <Button colors="secondary" variant="outline" className="rounded-full" onClick={onBack}>
        <ArrowLeft />
      </Button>

      <CardTitle>
        {subjectOffer.subject.name} ({subjectOffer.subject.id.ID})
      </CardTitle>
      <CardDescription>
        Modifica o agrega los horarios para el trimestre <strong>{subjectOffer.trimester.id.ID}</strong> para que todos
        los estudiantes puedan organizar sus horarios!
      </CardDescription>

      {subjectOffer.prelations.length > 0 && (
        <section>
          <div className="text-muted-foreground mt-4 text-sm font-semibold">
            Materias que desbloquea: {subjectOffer.prelations.length}{' '}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {subjectOffer.prelations.map((prerequisite) => (
              <Badge key={prerequisite.id.ID} variant="primary">
                {prerequisite.name} ({prerequisite.id.ID})
              </Badge>
            ))}
          </div>
        </section>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2">
        <SubjectStat label="Dificultad" value={subjectOffer.avg_difficulty} />
        <SubjectStat label="Nota" value={subjectOffer.avg_grade} />
        <SubjectStat label="Carga" value={subjectOffer.avg_workload} />
      </div>

      {differentFriends > 0 && <FriendsPopover subjectOffer={subjectOffer} totalFriends={differentFriends} />}
    </SidebarHeader>
  );
}
