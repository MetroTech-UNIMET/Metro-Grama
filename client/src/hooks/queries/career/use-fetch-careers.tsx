import { useQuery, queryOptions, useQueryClient } from '@tanstack/react-query';
import { getCareers } from '@/api/careersApi';

import type { Option } from '@ui/types/option.types';
import type { Career } from '@/interfaces/Career';
import { fetchAndSetQueryData } from '@utils/tanstack-query';

export type CareerOption = Option<`career:${string}`, Career>;

export function fetchCareersOptions() {
  return queryOptions({
    queryKey: ['careers'],
    queryFn: getCareers,
  });
}

export function useFetchCareers() {
  const query = useQuery(fetchCareersOptionsOptions());

  return query;
}

export function fetchCareersOptionsOptions() {
  const queryClient = useQueryClient();

  return queryOptions({
    queryKey: ['careers', 'options'],
    queryFn: async () => {
      const careers = await fetchAndSetQueryData(queryClient, ['careers'], getCareers);

      const data: CareerOption[] =
        careers?.map((career) => ({
          value: `${career.id.Table}:${career.id.ID}` as `career:${string}`,
          label: `${career.emoji} ${career.name}`,
        })) ?? [];
      return data;
    },
  });
}

export function useFetchCareersOptions() {
  const query = useQuery(fetchCareersOptionsOptions());

  return { ...query, data: query.data ?? [] };
}
