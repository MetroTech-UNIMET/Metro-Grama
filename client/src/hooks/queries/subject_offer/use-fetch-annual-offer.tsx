import { useQuery } from '@tanstack/react-query';
import { getAnualOffers } from '@/api/subject_offferAPI';

import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';
import type { OptionalQueryOptions } from '../types';

interface Props<T = SubjectOfferWithSchedules[]> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function useFetchAnnualOffer({ queryOptions }: Props = {}) {
  const query = useQuery({
    queryKey: ['subjects', 'offer'],
    queryFn: () => getAnualOffers(),
    ...queryOptions,
  });

  return query;
}
