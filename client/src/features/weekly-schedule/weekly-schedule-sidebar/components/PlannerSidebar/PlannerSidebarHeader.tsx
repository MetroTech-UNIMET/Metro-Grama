import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';

import { useFilterByDays } from '../../hooks/search-params/use-filter-by-days';
import { TimeRange, useFilterByTimeRange } from '../../hooks/search-params/use-filter-by-time-range';
import { useSearchTerm } from '../../hooks/search-params/use-search-term';
import { FilterByDays } from '../FilterByDays/FilterByDays';
import { FilterByTimeRange } from '../FilterByTimeRange/FilterByTimeRange';

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

interface Props {
  showEnrollable: boolean;
  setShowEnrollable: (value: boolean) => void;
}

export function PlannerSidebarHeader({ showEnrollable, setShowEnrollable }: Props) {
  const queryClient = useQueryClient();

  const { term, setTerm } = useSearchTerm();
  const { selectedDays, toggleDay, clearDays } = useFilterByDays();
  const { timeRange, setTimeRange, reset: resetTimeRange } = useFilterByTimeRange();

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

interface FiltersPopoverProps {
  selectedDays: number[];
  onToggleDay: (day: number) => void;
  onClearDays: () => void;
  timeRange: TimeRange | undefined;
  onChangeTimeRange: (next: Partial<{ start: string; end: string }>) => void;
  onResetTimeRange: () => void;
}
function FiltersPopover({
  selectedDays,
  onToggleDay,
  onClearDays,
  timeRange,
  onChangeTimeRange,
  onResetTimeRange,
}: FiltersPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Días</h4>
          <FilterByDays selectedDays={selectedDays} onToggle={onToggleDay} onClear={onClearDays} />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Rango de Horas</h4>
          <FilterByTimeRange value={timeRange} onChange={onChangeTimeRange} onReset={onResetTimeRange} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
