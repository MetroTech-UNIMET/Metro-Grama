import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { FiltersPopover } from './FilterPopover';

import { useFilterByDays } from '../../hooks/search-params/use-filter-by-days';
import { useFilterByTimeRange } from '../../hooks/search-params/use-filter-by-time-range';
import { useFilterByAverages } from '../../hooks/search-params/use-filter-by-averages';
import { useSortSubjectOffers } from '../../hooks/search-params/use-sort-subject-offers';
import { useIncludeElectives } from '../../hooks/search-params/use-include-electives';
import { useSearchTerm } from '../../hooks/search-params/use-search-term';

import { fetchTrimestersSelectOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';
import { useSuspenseCareersOptions } from '@/hooks/queries/career/use-fetch-careers';

import { useSelectedCareers } from '@/hooks/search-params/use-selected-careers';
import { useSelectedTrimester } from '@/hooks/search-params/use-selected-trimester';

import { useAuth } from '@/contexts/AuthenticationContext';

import { CareerMultiDropdown } from '@components/CareerMultiDropdown';

import AutoComplete from '@ui/derived/autocomplete';
import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';
import { Input } from '@ui/input';
import { SidebarHeader } from '@ui/sidebar';

import { Checkbox } from '@ui/checkbox';

interface Props {
  showEnrollable: boolean;
  setShowEnrollable: (value: boolean) => void;
}

export function PlannerSidebarHeader({ showEnrollable, setShowEnrollable }: Props) {
  const queryClient = useQueryClient();

  const { term, setTerm } = useSearchTerm();
  const { selectedDays, toggleDay, clearDays } = useFilterByDays();
  const { timeRange, setTimeRange, reset: resetTimeRange } = useFilterByTimeRange();
  const {
    filters: averageFilters,
    setDifficultyRange,
    setGradeRange,
    setWorkloadRange,
    reset: resetAverages,
  } = useFilterByAverages();
  const { sorting, setOrderBy, toggleOrderDir } = useSortSubjectOffers();
  const { includeElectives, setIncludeElectives } = useIncludeElectives();

  const { user } = useAuth();

  const { data: options } = useSuspenseCareersOptions();
  const { selectedCareers, setSelectedCareers } = useSelectedCareers({
    activeUrl: '/_navLayout/horario/',
    careerOptions: options,
    useStudentCareersAsDefault: true,
  });

  const trimesterQuery = useSuspenseQuery(fetchTrimestersSelectOptions({ queryClient }));
  const { selectedTrimester, setSelectedTrimester } = useSelectedTrimester({
    trimesterOptions: trimesterQuery.data ?? [],
  });

  return (
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

      <FiltersPopover
        selectedDays={selectedDays}
        onToggleDay={toggleDay}
        onClearDays={clearDays}
        timeRange={timeRange}
        onChangeTimeRange={setTimeRange}
        onResetTimeRange={resetTimeRange}
        averageFilters={averageFilters}
        setDifficultyRange={setDifficultyRange}
        setGradeRange={setGradeRange}
        setWorkloadRange={setWorkloadRange}
        resetAverages={resetAverages}
        sorting={sorting}
        setOrderBy={setOrderBy}
        toggleOrderDir={toggleOrderDir}
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

      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox
          className="h-4 w-4"
          checked={includeElectives}
          onCheckedChange={(value) => setIncludeElectives(value === true)}
        />
        Incluir electivas
      </label>
    </SidebarHeader>
  );
}
