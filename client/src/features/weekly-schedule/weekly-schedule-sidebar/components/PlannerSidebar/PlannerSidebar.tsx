import { useQueryClient, type UseQueryResult, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import SubjectOfferCard from '../SubjectOfferCard';
import SubjectOfferDetail from '../SubjectOfferDetail/SubjectOfferDetail';

import { useFetchAnnualOfferByTrimester } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-trimester';
import { fetchTrimestersSelectOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';
import useFetchCareersOptions, { type CareerOption } from '@/hooks/queries/use-FetchCareersOptions';

import { useSelectedTrimester } from '@/hooks/search-params/use-selected-trimester';
import { useSelectedCareers } from '@/hooks/search-params/use-selected-careers';

import { useSearchTerm } from '@/features/weekly-schedule/weekly-schedule-sidebar/hooks/search-params/use-search-term';

import { useAuth } from '@/contexts/AuthenticationContext';
import { normalize } from '@utils/strings';

import { CareerMultiDropdown } from '@components/CareerMultiDropdown';
import AutoComplete from '@ui/derived/autocomplete';
import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';
import { Input } from '@ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarRail } from '@ui/sidebar';
import { Skeleton } from '@ui/skeleton';
import { Checkbox } from '@ui/checkbox';

import { PlannerSidebarProvider, type PlannerSidebarContextValue } from '../../context/PlannerSidebarContext';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props extends PlannerSidebarContextValue {}

export function PlannerSidebar({ ...contextProps }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectOfferWithSections | null>(null);

  return (
    <div>
      <PlannerSidebarProvider value={contextProps}>
        <Sidebar>
          {selectedSubject ? (
            <SubjectOfferDetail subjectOffer={selectedSubject} onBack={() => setSelectedSubject(null)} />
          ) : (
            <HomeSidebar setSelectedSubject={setSelectedSubject} />
          )}
          <SidebarFooter />
          <SidebarRail />
        </Sidebar>
      </PlannerSidebarProvider>
    </div>
  );
}

function HomeSidebar({
  setSelectedSubject,
}: {
  setSelectedSubject: (subject: SubjectOfferWithSections | null) => void;
}) {
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const [showEnrollable, setShowEnrollable] = useState(false);

  const { term, setTerm, debouncedTerm: debouncedSearch } = useSearchTerm();

  useEffect(() => {
    if (!user && showEnrollable) setShowEnrollable(false);
  }, [user, showEnrollable]);

  const { options } = useFetchCareersOptions();
  const { selectedCareers, setSelectedCareers } = useSelectedCareers({
    activeUrl: '/_navLayout/materias/',
    careerOptions: options,
    useStudentCareersAsDefault: true,
  });

  const trimesterQuery = useSuspenseQuery(fetchTrimestersSelectOptions({ queryClient }));
  const { selectedTrimester, setSelectedTrimester } = useSelectedTrimester({
    trimesterOptions: trimesterQuery.data ?? [],
  });

  const subjectsOfferQuery = useFetchAnnualOfferByTrimester({
    trimesterId: selectedTrimester?.value ?? '',
    optionalQuery: {
      careers: selectedCareers.map((c) => c.value),
      // Only send subjectsFilter when a user exists; backend defaults to 'none' otherwise
      subjectsFilter: user ? (showEnrollable ? 'enrollable' : 'none') : undefined,
    },
    queryOptions: {
      enabled: !!selectedTrimester && selectedCareers.length > 0,
    },
  });

  const filteredData = useMemo(() => {
    if (!subjectsOfferQuery.data) return [] as SubjectOfferWithSections[];

    const termRaw = debouncedSearch.trim();
    if (!termRaw) return subjectsOfferQuery.data;
    const norm = normalize(termRaw);
    return subjectsOfferQuery.data.filter((offer) => {
      const name = normalize(offer.subject?.name ?? '');
      return name.includes(norm);
    });
  }, [subjectsOfferQuery.data, debouncedSearch]);

  return (
    <>
      <SidebarHeader>
        <Input placeholder="Busca por nombre de la materia..." value={term} onChange={(e) => setTerm(e.target.value)} />

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

        {user && (
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              className="h-4 w-4"
              checked={showEnrollable}
              onCheckedChange={(value) => setShowEnrollable(value === true)}
            />
            Solo materias inscribibles
          </label>
        )}
      </SidebarHeader>

      <SidebarContent className="mt-4">
        <SidebarGroup className="gap-2">
          <SubjectsSection
            selectedCareers={selectedCareers}
            query={subjectsOfferQuery}
            filteredData={filteredData}
            onSelect={setSelectedSubject}
          />
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}

function SubjectsSection({
  selectedCareers,
  query,
  filteredData,
  onSelect,
}: {
  selectedCareers: CareerOption[];
  query: UseQueryResult<SubjectOfferWithSections[]>;
  filteredData: SubjectOfferWithSections[];
  onSelect: (subject: SubjectOfferWithSections | null) => void;
}) {
  if (selectedCareers.length === 0) {
    return <div className="text-muted-foreground text-sm">Escoja una carrera para ver la oferta académica</div>;
  }

  if (query.isPending) {
    return (
      <>
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-30" />
        ))}
      </>
    );
  }

  if (query.isError) {
    return <div>Error al cargar las materias</div>;
  }

  if (!filteredData || filteredData.length === 0) {
    return <div className="text-muted-foreground text-sm">No hay materias para los filtros seleccionados</div>;
  }

  // Data state
  return (
    <>
      {filteredData.map((offer, index) => (
        <SubjectOfferCard
          key={`${offer.subject?.id.ID ?? 'no-id'}-${index}`}
          subjectOffer={offer}
          onSelect={onSelect}
          state={offer.is_enrolled ? 'isEnrolled' : offer.is_enrollable ? 'isEnrollable' : 'default'}
        />
      ))}
    </>
  );
}
