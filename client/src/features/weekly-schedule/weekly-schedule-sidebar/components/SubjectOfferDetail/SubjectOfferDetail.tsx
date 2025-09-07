import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';

import SubjectOfferForm from './SubjectOfferForm/SubjectOfferForm';
import { SubjectOfferSchedulesList } from './SubjectOfferSchedulesList';
import { useSubjectOfferDetailRouter } from '../../hooks/useSubjectOfferDetailRouter';
import { usePlannerSidebarContext } from '../../context/PlannerSidebarContext';

import { useFetchAnnualOfferByTrimester } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-trimester';

import { CardTitle, CardDescription } from '@ui/card';
import { SidebarContent, SidebarHeader } from '@ui/sidebar';
import { Button } from '@ui/button';

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

  // Always prefer the freshest data from react-query
  const trimesterId = subjectOffer.trimester.id.ID;
  const { data: offers } = useFetchAnnualOfferByTrimester({ trimesterId });

  const currentSubjectOffer = useMemo(
    () => offers?.find((o) => o.id.ID === subjectOffer.id.ID) ?? subjectOffer,
    [offers, subjectOffer],
  );

  const isSelected = useMemo(
    () => getIsSubjectSelected(currentSubjectOffer),
    [currentSubjectOffer, getIsSubjectSelected],
  );

  return (
    <>
      <SubjectSidebarHeader subjectOffer={currentSubjectOffer} onBack={handleHeaderBack} />

      <SidebarContent>
        {view === 'form' ? (
          <SubjectOfferForm subjectOffer={currentSubjectOffer} onBack={handleHeaderBack} />
        ) : (
          <SubjectOfferSchedulesList
            subjectOffer={currentSubjectOffer}
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
    </SidebarHeader>
  );
}
