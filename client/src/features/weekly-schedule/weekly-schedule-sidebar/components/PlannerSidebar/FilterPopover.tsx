import { SlidersHorizontal, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

import { useFilterByAverages } from '../../hooks/search-params/use-filter-by-averages';
import { useSortSubjectOffers } from '../../hooks/search-params/use-sort-subject-offers';

import { FilterByAverages } from '../FilterByAverages/FilterByAverages';
import { FilterByDays } from '../FilterByDays/FilterByDays';
import { FilterByTimeRange } from '../FilterByTimeRange/FilterByTimeRange';

import { Button } from '@ui/button';
import { Separator } from '@ui/separator';
import { ScrollArea } from '@ui/scroll-area';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/popover';
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from '@ui/select';

import type { SortField } from '@/routes/_navLayout/horario/queryParams';
import type { Option } from '@ui/types/option.types';
import type { TimeRangeString } from '../../hooks/search-params/use-filter-by-time-range';

// REVIEW - Acaso no existe mejor manera de manejar esto?
interface Props {
  selectedDays: number[];
  onToggleDay: (day: number) => void;
  onClearDays: () => void;
  timeRange: TimeRangeString | undefined;
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

const orderSelectOptions: Option<SortField>[] = [
  { label: 'Alfabético', value: 'alphabetical' },
  { label: 'Dificultad', value: 'avg_difficulty' },
  { label: 'Nota', value: 'avg_grade' },
  { label: 'Carga', value: 'avg_workload' },
  { label: 'Número de Prelaciones', value: 'prelations' },
];

export function FiltersPopover({
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
}: Props) {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 px-0" align="start">
        <ScrollArea className="px-4 max-sm:[&>[data-radix-scroll-area-viewport]]:max-h-[24rem]">
          <div className="space-y-4 py-1/2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Ordenar Por:</h4>
                <span className="text-muted-foreground text-xs">
                  {sorting.orderDir === 'asc' ? 'Ascendente' : 'Descendente'}
                </span>

                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleOrderDir}>
                  {sorting.orderDir === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
                </Button>
              </div>
              <Select
                value={sorting.orderBy}
                onValueChange={(val) => val && setOrderBy(val)}
                items={orderSelectOptions}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderSelectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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

            <div className="space-y-4 pb-1">
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
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
