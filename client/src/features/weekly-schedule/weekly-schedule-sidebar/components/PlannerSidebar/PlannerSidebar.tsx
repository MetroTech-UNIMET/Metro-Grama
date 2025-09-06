import { useEffect, useMemo, useState } from 'react';

import SubjectOfferCard from '../SubjectOfferCard';
import SubjectOfferDetail from '../SubjectOfferDetail/SubjectOfferDetail';

import { useFetchAnnualOfferByTrimester } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-trimester';
import { useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';
import useFetchCareersOptions from '@/hooks/queries/use-FetchCareersOptions';

import { useSelectedTrimester } from '@/hooks/search-params/use-selected-trimester';
import { useSelectedCareers } from '@/hooks/search-params/use-selected-careers';

import { useAuth } from '@/contexts/AuthenticationContext';
import { normalize } from '@utils/strings';

import { CareerMultiDropdown } from '@components/CareerMultiDropdown';
import AutoComplete from '@ui/derived/autocomplete';
import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';
import { Input } from '@ui/input';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarRail } from '@ui/sidebar';
import { Skeleton } from '@ui/skeleton';
import { Checkbox } from '@ui/checkbox';
import { useDebounceValue } from '@/hooks/shadcn.io/debounce/use-debounce-value';

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
          <HomeSidebar setSelectedSubject={setSelectedSubject} getIsSubjectSelected={getIsSubjectSelected} />
        )}
        <SidebarFooter />

        <SidebarRail />
      </Sidebar>
    </div>
  );
}

function HomeSidebar({
  setSelectedSubject,
  getIsSubjectSelected,
}: {
  setSelectedSubject: (subject: SubjectOfferWithSections | null) => void;
  getIsSubjectSelected: Props['getIsSubjectSelected'];
}) {
  const { user } = useAuth();
  const [showEnrollable, setShowEnrollable] = useState(false);
  // Immediate input value (updates instantly for UX)
  const [searchInput, setSearchInput] = useState('');
  // Debounced value (updates after delay)
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue('', 300);

  useEffect(() => {
    if (!user && showEnrollable) setShowEnrollable(false);
  }, [user, showEnrollable]);

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
      // Only send subjectsFilter when a user exists; backend defaults to 'none' otherwise
      subjectsFilter: user ? (showEnrollable ? 'enrollable' : 'none') : undefined,
    },
    queryOptions: {
      enabled: !!selectedTrimester,
    },
  });

  const filteredData = useMemo(() => {
    if (!subjectsOfferQuery.data) return [] as SubjectOfferWithSections[];

    const termRaw = debouncedSearch.trim();
    if (!termRaw) return subjectsOfferQuery.data;
    const term = normalize(termRaw);
    return subjectsOfferQuery.data.filter((offer) => {
      const name = normalize(offer.subject?.name ?? '');
      return name.includes(term);
    });
  }, [subjectsOfferQuery.data, debouncedSearch]);

  return (
    <>
      <SidebarHeader>
        {/* TODO - Hacerlo funcionar, pero creo que solo será un filtro a nivel de cliente debounced */}
        <Input
          placeholder="Busca por nombre de la materia..."
          value={searchInput}
          onChange={(e) => {
            const v = e.target.value;
            setSearchInput(v);
            setDebouncedSearch(v); // debounced setter (from hook)
          }}
        />

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
              {filteredData.map((offer, index) => (
                <SubjectOfferCard
                  key={`${offer.subject?.id.ID ?? 'no-id'}-${index}`}
                  subjectOffer={offer}
                  onSelect={setSelectedSubject}
                  getIsSubjectSelected={getIsSubjectSelected}
                />
              ))}
            </>
          )}
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
