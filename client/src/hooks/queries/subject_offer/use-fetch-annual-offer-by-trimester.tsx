import { queryOptions, useQuery } from '@tanstack/react-query';
import { getAnualOffersByTrimester, type Query_AnnualOffers } from '@/api/subject_offferAPI';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { OptionalQueryOptions } from '../types';

interface Props<T = SubjectOfferWithSections[]> {
  queryOptions?: OptionalQueryOptions<T>;
  trimesterId: string;
  optionalQuery?: Query_AnnualOffers;
}

export function useFetchAnnualOfferByTrimester({ queryOptions, trimesterId, optionalQuery }: Props) {
  const query = useQuery(fetchAnnualOfferByTrimesterOptions({ trimesterId, optionalQuery, queryOptions }));

  return query;
}

export function fetchAnnualOfferByTrimesterOptions({ trimesterId, optionalQuery, queryOptions: queryOpt }: Props) {
  const optionalQuerParams: Query_AnnualOffers = {
    ...optionalQuery,
    careers: optionalQuery?.careers?.sort() ?? [],
    subjectsFilter: optionalQuery?.subjectsFilter || 'none',
  };

  return queryOptions({
    queryKey: ['subjects', 'offer', trimesterId, optionalQuerParams],
    queryFn: () => getAnualOffersByTrimester(trimesterId, optionalQuery),
    enabled: !!trimesterId && (optionalQuerParams?.careers?.length ?? 0) > 0,
    ...queryOpt,
  });
}
