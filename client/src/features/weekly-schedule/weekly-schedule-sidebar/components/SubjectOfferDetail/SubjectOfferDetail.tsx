import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';

import SubjectOfferForm from './SubjectOfferForm/SubjectOfferForm';
import { SubjectOfferSchedulesList } from './SubjectOfferSchedulesList';
import { FriendsPopover } from './FriendsPopover/FriendsPopover';

import { useSubjectOfferDetailRouter } from '../../hooks/useSubjectOfferDetailRouter';
import { usePlannerSidebarContext } from '../../context/PlannerSidebarContext';

import { CardTitle, CardDescription } from '@ui/card';
import { SidebarContent, SidebarHeader } from '@ui/sidebar';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  onBack: () => void;
}

export default function SubjectOfferDetail({ subjectOffer, onBack }: Props) {
  const { getIsSubjectSelected } = usePlannerSidebarContext();
  // FIXME - Creo que despues de crear en un form me manda otra vez para el home y no al detalle
  const { view, go, back } = useSubjectOfferDetailRouter(subjectOffer);
  const handleHeaderBack = () => back(onBack);

  const isSelected = useMemo(() => getIsSubjectSelected(subjectOffer), [subjectOffer, getIsSubjectSelected]);

  return (
    <>
      <SubjectSidebarHeader subjectOffer={subjectOffer} onBack={handleHeaderBack} />

      <SidebarContent>
        {view === 'form' ? (
          <SubjectOfferForm subjectOffer={subjectOffer} onBack={handleHeaderBack} />
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

function SubjectSidebarHeader({ subjectOffer, onBack }: Pick<Props, 'subjectOffer' | 'onBack'>) {
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

      {maxFriends > 0 && <FriendsPopover subjectOffer={subjectOffer} totalFriends={maxFriends} />}
    </SidebarHeader>
  );
}
