import { useQuery, queryOptions, useQueryClient, type QueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { getCareers } from '@/api/careersApi';
import { queryKeys } from '@/lib/query-keys';
import { fetchAndSetQueryData } from '@utils/tanstack-query';

import type { Option } from '@ui/types/option.types';
import type { Career } from '@/interfaces/Career';

export type CareerOption = Option<`career:${string}`, Career> & {
  id: string
}

export function fetchCareersOptions() {
  return queryOptions({
    queryKey: queryKeys.careers.all.queryKey,
    queryFn: getCareers,
  });
}

export function useFetchCareers() {
  const query = useQuery(fetchCareersOptions());

  return query;
}

export function fetchCareersOptionsOptions(queryClient: QueryClient) {
  return queryOptions({
    queryKey: queryKeys.careers.all._ctx.options.queryKey,
    queryFn: async () => {
      const careers = await fetchAndSetQueryData(queryClient, queryKeys.careers.all.queryKey, getCareers);

      const data: CareerOption[] =
        careers?.map((career) => ({
          value: `${career.id.Table}:${career.id.ID}` as `career:${string}`,
          label: `${career.emoji} ${career.name}`,
          id: `${career.id.Table}:${career.id.ID}`,
        })) ?? [];
      return data;
    },
  });
}

export function useFetchCareersOptions() {
  const queryClient = useQueryClient();

  const query = useQuery(fetchCareersOptionsOptions(queryClient));

  return { ...query, data: query.data ?? [] };
}

export function useSuspenseCareersOptions() {
  const queryClient = useQueryClient();

  const query = useSuspenseQuery(fetchCareersOptionsOptions(queryClient));

  return { ...query, data: query.data ?? [] };
}
