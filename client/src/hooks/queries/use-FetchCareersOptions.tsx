import { useQuery, queryOptions } from '@tanstack/react-query';
import { getCareers } from '@/api/careersApi';

import type { Option } from '@ui/types/option.types';
import type { Career } from '@/interfaces/Career';

export type CareerOption = Option<`career:${string}`, Career>;

export function fetchCareersOptions() {
  return queryOptions({
    queryKey: ['careers'],
    queryFn: getCareers,
  });
}

export default function useFetchCareersOptions() {
  const { data, isLoading, error } = useQuery(fetchCareersOptions());

  const options: CareerOption[] =
    data?.map((career) => ({
      value: `${career.id.Table}:${career.id.ID}` as `career:${string}`,
      label: `${career.emoji} ${career.name}`,
    })) ?? [];

  return {
    options,
    isLoading,
    error,
  };
}
