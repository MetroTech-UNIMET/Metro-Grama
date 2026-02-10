import { useQuery, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getAllTrimesters, type QueryTrimesterParams } from '@/api/trimestersApi';
import { fetchAndSetQueryData } from '@utils/tanstack-query';

import type { Trimester } from '@/interfaces/Trimester';
import type { OptionalQueryOptions } from '../types';
import type { Option } from '@ui/types/option.types';

interface Props<T = Trimester[]> {
  queryOptions?: OptionalQueryOptions<T>;
  params?: QueryTrimesterParams;
}

export function fetchTrimestersOptions({ queryOptions: queryOpt, params }: Props = {}) {
  return queryOptions({
    queryKey: ['trimesters', params],
    queryFn: () => getAllTrimesters(params),
    ...queryOpt,
  });
}

export function useFetchTrimesters({ queryOptions, params }: Props) {
  const query = useQuery(fetchTrimestersOptions({ queryOptions, params }));

  return query;
}

export type TrimesterOption = Option<string, Trimester>;

export function fetchTrimestersSelectOptions({
  queryClient,
  queryOptions: queryOpt = {},
  params,
}: Props<TrimesterOption[]> & {
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const baseQueryKey = ['trimesters', params];

  return queryOptions({
    queryKey: [...baseQueryKey, 'options'],
    queryFn: async () => {
      const trimesters = await fetchAndSetQueryData(queryClient, baseQueryKey, () => getAllTrimesters(params));

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

export function useFetchTrimestersOptions({ queryOptions, params }: Props<TrimesterOption[]> = {}) {
  const queryClient = useQueryClient();
  const query = useQuery(fetchTrimestersSelectOptions({ queryClient, queryOptions, params }));
  return query;
}
