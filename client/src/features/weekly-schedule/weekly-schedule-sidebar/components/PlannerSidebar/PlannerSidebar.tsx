import { useQueryClient, type UseQueryResult, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { PlannerSidebarHeader } from './PlannerSidebarHeader';
import SubjectOfferCard from '../SubjectOfferCard';
import SubjectOfferDetail from '../SubjectOfferDetail/SubjectOfferDetail';

import { useFetchAnnualOfferByTrimester } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-trimester';
import { fetchTrimestersSelectOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';
import useFetchCareersOptions, { type CareerOption } from '@/hooks/queries/use-FetchCareersOptions';

import { useSelectedTrimester } from '@/hooks/search-params/use-selected-trimester';
import { useSelectedCareers } from '@/hooks/search-params/use-selected-careers';

import { useSearchTerm } from '@/features/weekly-schedule/weekly-schedule-sidebar/hooks/search-params/use-search-term';
import { useFilterByDays } from '@/features/weekly-schedule/weekly-schedule-sidebar/hooks/search-params/use-filter-by-days';
import { useFilterByTimeRange } from '@/features/weekly-schedule/weekly-schedule-sidebar/hooks/search-params/use-filter-by-time-range';

import { useAuth } from '@/contexts/AuthenticationContext';
import { normalize } from '@utils/strings';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarRail } from '@ui/sidebar';
import { Skeleton } from '@ui/skeleton';

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

  const { debouncedTerm: debouncedSearch } = useSearchTerm();
  const { selectedDays } = useFilterByDays();
  const { timeRange } = useFilterByTimeRange();

  const { user } = useAuth();
  const [showEnrollable, setShowEnrollable] = useState(false);
  useEffect(() => {
    if (!user && showEnrollable) setShowEnrollable(false);
  }, [user, showEnrollable]);

  const { options } = useFetchCareersOptions();
  const { selectedCareers } = useSelectedCareers({
    activeUrl: '/_navLayout/horario/',
    careerOptions: options,
    useStudentCareersAsDefault: true,
  });

  const trimesterQuery = useSuspenseQuery(fetchTrimestersSelectOptions({ queryClient }));
  const { selectedTrimester } = useSelectedTrimester({
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

    let data = subjectsOfferQuery.data;

    // Name filter
    const termRaw = debouncedSearch.trim();
    if (termRaw) {
      const norm = normalize(termRaw);
      data = data.filter((offer) => normalize(offer.subject?.name ?? '').includes(norm));
    }

    // Days filter (ANY match across any section schedule)
    if (selectedDays.length > 0) {
      const selectedSet = new Set(selectedDays);
      data = data.filter((offer) =>
        offer.sections?.some((section) => section.schedules?.some((sch) => selectedSet.has(sch.day_of_week))),
      );
    }

    // Time range filter (section schedule START within range OR overlapping)
    // We'll treat a schedule as matching if any part overlaps the chosen window.
    if (timeRange) {
      const [startH, startM] = timeRange.start.split(':').map(Number);
      const [endH, endM] = timeRange.end.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      data = data.filter((offer) =>
        offer.sections?.some((section) =>
          section.schedules?.some((sch) => {
            const schStart = sch.starting_hour * 60 + sch.starting_minute;
            const schEnd = sch.ending_hour * 60 + sch.ending_minute;
            return schStart < endMinutes && schEnd > startMinutes; // overlap condition
          }),
        ),
      );
    }

    return data;
  }, [subjectsOfferQuery.data, debouncedSearch, selectedDays, timeRange]);

  return (
    <>
      <PlannerSidebarHeader showEnrollable={showEnrollable} setShowEnrollable={setShowEnrollable} />

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
