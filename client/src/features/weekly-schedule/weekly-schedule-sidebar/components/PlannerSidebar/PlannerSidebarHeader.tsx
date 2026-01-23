import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowDownAZ, ArrowUpAZ, SlidersHorizontal } from 'lucide-react';

import { useFilterByDays } from '../../hooks/search-params/use-filter-by-days';
import { TimeRange, useFilterByTimeRange } from '../../hooks/search-params/use-filter-by-time-range';
import { useFilterByAverages } from '../../hooks/search-params/use-filter-by-averages';
import { useSortSubjectOffers } from '../../hooks/search-params/use-sort-subject-offers';

import { useSearchTerm } from '../../hooks/search-params/use-search-term';
import { FilterByDays } from '../FilterByDays/FilterByDays';
import { FilterByTimeRange } from '../FilterByTimeRange/FilterByTimeRange';
import { FilterByAverages } from '../FilterByAverages/FilterByAverages';

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
import { Button } from '@ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Checkbox } from '@ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Separator } from '@ui/separator';

import type { SortField } from '@/routes/_navLayout/horario/queryParams';

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

      {/* Combined filters popover */}
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
    </SidebarHeader>
  );
}

// REVIEW - Acaso no existe mejor manera de manejar esto?
interface FiltersPopoverProps {
  selectedDays: number[];
  onToggleDay: (day: number) => void;
  onClearDays: () => void;
  timeRange: TimeRange | undefined;
  onChangeTimeRange: (next: Partial<{ start: string; end: string }>) => void;
  onResetTimeRange: () => void;
  averageFilters: ReturnType<typeof useFilterByAverages>['filters'];
  setDifficultyRange: (range: [number, number]) => void;
  setGradeRange: (range: [number, number]) => void;
  setWorkloadRange: (range: [number, number]) => void;
  resetAverages: () => void;
  sorting: ReturnType<typeof useSortSubjectOffers>['sorting'];
  setOrderBy: (field: SortField) => void;
  toggleOrderDir: () => void;
}

function FiltersPopover({
  selectedDays,
  onToggleDay,
  onClearDays,
  timeRange,
  onChangeTimeRange,
  onResetTimeRange,
  averageFilters,
  setDifficultyRange,
  setGradeRange,
  setWorkloadRange,
  resetAverages,
  sorting,
  setOrderBy,
  toggleOrderDir,
}: FiltersPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[80vh] w-80 space-y-4 overflow-y-auto" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Ordenar Por</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleOrderDir}>
              {sorting.orderDir === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
            </Button>
          </div>
          <Select value={sorting.orderBy} onValueChange={(val) => setOrderBy(val as SortField)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Alfabético</SelectItem>
              <SelectItem value="avg_difficulty">Dificultad</SelectItem>
              <SelectItem value="avg_grade">Nota</SelectItem>
              <SelectItem value="avg_workload">Carga</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Días</h4>
          <FilterByDays selectedDays={selectedDays} onToggle={onToggleDay} onClear={onClearDays} />
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Rango de Horas</h4>
          <FilterByTimeRange value={timeRange} onChange={onChangeTimeRange} onReset={onResetTimeRange} />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Promedios</h4>
            <Button variant="link" className="text-muted-foreground h-auto p-0 text-xs" onClick={resetAverages}>
              Resetear
            </Button>
          </div>
          <FilterByAverages
            filters={averageFilters}
            setDifficultyRange={setDifficultyRange}
            setGradeRange={setGradeRange}
            setWorkloadRange={setWorkloadRange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
