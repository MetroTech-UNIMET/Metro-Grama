import { useEffect, useState } from 'react';

import { getInitialTrimester } from './functions';
import SubjectOfferCard from '../SubjectOfferCard';
import SubjectOfferDetail from '../SubjectOfferDetail/SubjectOfferDetail';

import { useFetchAnnualOfferByTrimester } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-trimester';
import { type TrimesterOption, useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

import AutoComplete from '@ui/derived/autocomplete';
import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';
import { Input } from '@ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarRail } from '@ui/sidebar';
import { Skeleton } from '@ui/skeleton';

import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';

interface Props {
  onAddSubject: (subjectOffer: SubjectOfferWithSchedules) => void;
}

export function PlannerSidebar({ onAddSubject }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectOfferWithSchedules | null>(null);

  return (
    <div>
      <Sidebar>
        {selectedSubject ? (
          <SubjectOfferDetail
            subjectOffer={selectedSubject}
            onBack={() => setSelectedSubject(null)}
            onAddSubject={onAddSubject}
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

function HomeSidebar({
  setSelectedSubject,
}: {
  setSelectedSubject: (subject: SubjectOfferWithSchedules | null) => void;
}) {
  const trimesterQuery = useFetchTrimestersOptions();

  const [selectedTrimester, setSelectedTrimester] = useState<TrimesterOption | undefined>(undefined);

  useEffect(() => {
    if (trimesterQuery.data) {
      const initialTrimester = getInitialTrimester(trimesterQuery.data);
      setSelectedTrimester(initialTrimester);
    }
  }, [trimesterQuery.data]);

  const subjectsOfferQuery = useFetchAnnualOfferByTrimester({
    trimesterId: selectedTrimester?.value ?? '',
    queryOptions: {
      enabled: !!selectedTrimester,
    },
  });

  // Render header and content; show loading/error inside content
  return (
    <>
      <SidebarHeader>
        <Input placeholder="Buscar oferta ..." />

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
      <SidebarContent>
        <SidebarGroup title="Materias" className="gap-2">
          {false || subjectsOfferQuery.isPending ? (
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
              {subjectsOfferQuery.data.map((offer) => (
                <SubjectOfferCard key={offer.subject.id.ID} subjectOffer={offer} onSelect={setSelectedSubject} />
              ))}
            </>
          )}
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
