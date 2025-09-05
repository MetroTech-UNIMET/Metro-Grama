import { useQuery } from '@tanstack/react-query';
import { getCareers } from '@/api/careersApi';

import type { Option } from '@ui/types/option.types';
import type { Career } from '@/interfaces/Career';

export type CareerOption = Option<`career:${string}`, Career>;

export default function useFetchCareersOptions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['careers'],
    queryFn: getCareers,
  });

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
