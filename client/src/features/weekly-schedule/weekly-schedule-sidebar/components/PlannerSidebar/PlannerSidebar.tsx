import { useState } from 'react';

import SubjectOfferCard from '../SubjectOfferCard';
import SubjectOfferDetail from '../SubjectOfferDetail/SubjectOfferDetail';

import { useFetchAnnualOfferByTrimester } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-trimester';
import { useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';
import useFetchCareersOptions from '@/hooks/queries/use-FetchCareersOptions';

import { useSelectedTrimester } from '@/hooks/search-params/use-selected-trimester';
import { useSelectedCareers } from '@/hooks/search-params/use-selected-careers';

import { useAuth } from '@/contexts/AuthenticationContext';

import { CareerMultiDropdown } from '@components/CareerMultiDropdown';
import AutoComplete from '@ui/derived/autocomplete';
import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';
import { Input } from '@ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarRail } from '@ui/sidebar';
import { Skeleton } from '@ui/skeleton';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { Id } from '@/interfaces/surrealDb';

interface Props {
  onAddSubject: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => void;
  onRemoveSubject: (subjectOfferId: Id) => void;
  getIsSubjectSelected: (subjectOffer: SubjectOfferWithSections) => boolean;
}

export function PlannerSidebar({ onAddSubject, onRemoveSubject, getIsSubjectSelected }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectOfferWithSections | null>(null);

  return (
    <div>
      <Sidebar>
        {selectedSubject ? (
          <SubjectOfferDetail
            subjectOffer={selectedSubject}
            onBack={() => setSelectedSubject(null)}
            onAddSubject={onAddSubject}
            onRemoveSubject={onRemoveSubject}
            getIsSubjectSelected={getIsSubjectSelected}
          />
        ) : (
          <HomeSidebar setSelectedSubject={setSelectedSubject} />
        )}
        <SidebarFooter />

        <SidebarRail />
      </Sidebar>
    </div>
  );
}

// TODO - Usar NUQS o tanstack router para usar trimestre y carreras como queryParams
function HomeSidebar({
  setSelectedSubject,
}: {
  setSelectedSubject: (subject: SubjectOfferWithSections | null) => void;
}) {
  const { user: _ } = useAuth();

  const { options } = useFetchCareersOptions();
  const { selectedCareers, setSelectedCareers } = useSelectedCareers({
    careerOptions: options,
  });

  const trimesterQuery = useFetchTrimestersOptions();
  const { selectedTrimester, setSelectedTrimester } = useSelectedTrimester({
    trimesterOptions: trimesterQuery.data ?? [],
  });

  const subjectsOfferQuery = useFetchAnnualOfferByTrimester({
    trimesterId: selectedTrimester?.value ?? '',
    optionalQuery: {
      careers: selectedCareers.map((c) => c.value),
    },
    queryOptions: {
      enabled: !!selectedTrimester,
    },
  });

  return (
    <>
      <SidebarHeader>
        <Input placeholder="Buscar oferta ..." />

        <CareerMultiDropdown
          value={selectedCareers}
          onChange={setSelectedCareers}
          className="bg-transparent"
          placeholder="Carreras a filtrar"
        />

        <AutoComplete
          options={trimesterQuery.data ?? []}
          value={selectedTrimester}
          onSelect={setSelectedTrimester}
          emptyIndicator={'No se encontraron trimestres'}
          isLoading={trimesterQuery.isLoading}
          CustomSelectItem={TrimesterItem}
          isOptionDisabled={(option) => !(option.data?.is_current || option.data?.is_next)}
        />
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <SidebarGroup title="Materias" className="gap-2">
          {subjectsOfferQuery.isPending ? (
            <>
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-30" />
              ))}
            </>
          ) : subjectsOfferQuery.isError ? (
            <div>Error al cargar las materias</div>
          ) : (
            <>
              {/* TODO - Hay un error donde el id del subject es null porque la materia no existen aun pero ya se creo la relación
            Preguntarle a Pilar que hacer */}
              {subjectsOfferQuery.data.map((offer, index) => (
                <SubjectOfferCard key={
                  `${offer.subject?.id.ID ?? 'no-id'}-${index}`
                } subjectOffer={offer} onSelect={setSelectedSubject} />
              ))}
            </>
          )}
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
