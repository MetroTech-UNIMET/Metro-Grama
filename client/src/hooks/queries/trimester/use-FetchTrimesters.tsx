import { useQuery, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getAllTrimesters } from '@/api/trimestersApi';
import { fetchAndSetQueryData } from '@utils/tanstack-query';

import type { Trimester } from '@/interfaces/Trimester';
import type { OptionalQueryOptions } from '../types';
import type { Option } from '@ui/types/option.types';

interface Props<T = Trimester[]> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchTrimestersOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['trimesters'],
    queryFn: () => getAllTrimesters(),
    ...queryOpt,
  });
}

export function useFetchTrimesters({ queryOptions }: Props) {
  const query = useQuery(fetchTrimestersOptions({ queryOptions }));

  return query;
}

export type TrimesterOption = Option<string, Trimester>;

export function fetchTrimestersSelectOptions({
  queryClient,
  queryOptions: queryOpt = {},
}: Props<TrimesterOption[]> & {
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  return queryOptions({
    queryKey: ['trimesters', 'options'],
    queryFn: async () => {
      const trimesters = await fetchAndSetQueryData(queryClient, ['trimesters'], getAllTrimesters);

      const options: TrimesterOption[] = trimesters.map((trimester) => ({
        value: trimester.id.ID,
        label: trimester.id.ID,
        data: trimester,
      }));

      return options;
    },
    ...queryOpt,
  });
}

export function useFetchTrimestersOptions({ queryOptions }: Props<TrimesterOption[]> = {}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...fetchTrimestersSelectOptions({ queryClient, queryOptions }),
    queryFn: async () => {
      const trimesters = await fetchAndSetQueryData(queryClient, ['trimesters'], getAllTrimesters);
      const options: TrimesterOption[] = trimesters.map((trimester) => ({
        value: trimester.id.ID,
        label: trimester.id.ID,
        data: trimester,
      }));
      return options;
    },
  });
  return query;
}
