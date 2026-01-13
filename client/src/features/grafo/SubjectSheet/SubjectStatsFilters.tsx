import { useSubjectStatsQueryContext } from './context/subject-stats-query-context';
import { useId } from 'react';

import { CareerMultiDropdown } from '@components/CareerMultiDropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { useFetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

import type { Option } from '@ui/types/option.types';
import AutoComplete from '@ui/derived/autocomplete';
import { TrimesterItem } from '@ui/derived/custom-command-items/trimester-item-option';

const studentsFilterOptions: Option<string>[] = [
  { value: 'all', label: 'Todos los estudiantes' },
  { value: 'friends', label: 'Solo amigos' },
  { value: 'friendsFriends', label: 'Amigos de amigos' },
];

interface Props {
  popoverContainer: HTMLElement | undefined;
}

export function SubjectStatsCareerFilter({ popoverContainer }: Props) {
  const {
    selectedCareers,
    setSelectedCareers,
    selectedStudentsFilter,
    setSelectedStudentsFilter,
    startingTrimester,
    setStartingTrimester,
    endingTrimester,
    setEndingTrimester,
  } = useSubjectStatsQueryContext();
  const careersInputId = useId();
  const studentsFilterId = useId();
  const startingTrimesterId = useId();
  const endingTrimesterId = useId();

  const trimesterQuery = useFetchTrimestersOptions();

  // TODO - Add labels
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={careersInputId}>Carreras</Label>
        <CareerMultiDropdown
          className="bg-transparent"
          placeholder="Selecciona las carreras que quieres filtrar"
          inputProps={{ id: careersInputId, className: 'w-auto placeholder:text-gray-600' }}
          maxSelected={undefined}
          value={selectedCareers}
          onChange={setSelectedCareers}
          popoverContainer={popoverContainer}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={studentsFilterId}>Filtro de estudiantes</Label>
        <Select
          items={studentsFilterOptions}
          value={selectedStudentsFilter}
          onValueChange={(value) => setSelectedStudentsFilter(value as 'all' | 'friends' | 'friendFriends')}
        >
          <SelectTrigger id={studentsFilterId}>
            <SelectValue />
          </SelectTrigger>

          <SelectContent container={popoverContainer}>
            {studentsFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={startingTrimesterId}>Trimestre inicial</Label>

          <AutoComplete
            id={startingTrimesterId}
            placeholder="Trimestre"
            // placeholder="Filtra desde donde quieres ver las estadísticas"
            options={trimesterQuery.data ?? []}
            emptyIndicator={'No se encontraron trimestres'}
            isLoading={trimesterQuery.isLoading}
            CustomSelectItem={TrimesterItem}
            value={startingTrimester}
            onSelect={(option) => setStartingTrimester(option.value)}
            saveAsOption
          />
        
        </div>

        <div className="space-y-2">
          <Label htmlFor={endingTrimesterId}>Trimestre final</Label>
          <AutoComplete
            id={startingTrimesterId}
            placeholder="Trimestre"
            // placeholder="Filtra hasta donde quieres ver las estadísticas"
            options={trimesterQuery.data ?? []}
            emptyIndicator={'No se encontraron trimestres'}
            isLoading={trimesterQuery.isLoading}
            CustomSelectItem={TrimesterItem}
            value={endingTrimester}
            onSelect={(option) => setEndingTrimester(option.value)}
            saveAsOption
          />
        </div>
      </div>
    </div>
  );
}
