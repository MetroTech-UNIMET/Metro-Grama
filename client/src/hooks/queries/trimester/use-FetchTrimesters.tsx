import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllTrimesters } from '@/api/trimestersApi';
import { fetchAndSetQueryData } from '@utils/tanstack-query';

import type { Trimester } from '@/interfaces/Trimester';
import type { OptionalQueryOptions } from '../types';
import type { Option } from '@ui/types';

interface Props<T = Trimester[]> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function useFetchTrimesters({ queryOptions }: Props) {
  const query = useQuery({
    queryKey: ['trimesters'],
    queryFn: () => getAllTrimesters(),
    ...queryOptions,
  });

  return query;
}

export function useFetchTrimestersOptions({ queryOptions }: Props<Option[]> = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['trimesters', 'options'],
    queryFn: async () => {
      const trimesters = await fetchAndSetQueryData(queryClient, ['trimesters'], getAllTrimesters);

      const options: Option[] = trimesters.map((trimester) => ({
        value: trimester.id.ID,
        label: trimester.id.ID,
      }));

      return options;
    },
    ...queryOptions,
  });

  return query;
}
