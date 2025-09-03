import { useQuery } from '@tanstack/react-query';
import { getAnualOffersByTrimester, type Query_AnnualOffers } from '@/api/subject_offferAPI';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { OptionalQueryOptions } from '../types';

interface Props<T = SubjectOfferWithSections[]> {
  queryOptions?: OptionalQueryOptions<T>;
  trimesterId: string;
  optionalQuery?: Query_AnnualOffers;
}

export function useFetchAnnualOfferByTrimester({ queryOptions, trimesterId, optionalQuery }: Props) {
  const query = useQuery({
    queryKey: ['subjects', 'offer', trimesterId, optionalQuery],
    queryFn: () => getAnualOffersByTrimester(trimesterId, optionalQuery),
    ...queryOptions,
  });

  return query;
}
