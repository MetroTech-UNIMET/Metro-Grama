import { useQuery } from '@tanstack/react-query';
import { getAnualOffersByTrimester } from '@/api/subject_offferAPI';

import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';
import type { OptionalQueryOptions } from '../types';

interface Props<T = SubjectOfferWithSchedules[]> {
  queryOptions?: OptionalQueryOptions<T>;
  trimesterId: string;
}

export function useFetchAnnualOfferByTrimester({ queryOptions, trimesterId }: Props) {
  const query = useQuery({
    queryKey: ['subjects', 'offer', trimesterId],
    queryFn: () => getAnualOffersByTrimester(trimesterId),
    ...queryOptions,
  });

  return query;
}
