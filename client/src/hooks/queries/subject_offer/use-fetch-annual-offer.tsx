import { queryOptions, useQuery } from '@tanstack/react-query';
import { getAnualOffers, Query_AnnualOffers } from '@/api/subject_offferAPI';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { OptionalQueryOptions } from '../types';

interface Props<T = SubjectOfferWithSections[]> {
  queryOptions?: OptionalQueryOptions<T>;
  optionalQuery?: Query_AnnualOffers;
}

export function useFetchAnnualOffer({ queryOptions, optionalQuery }: Props = {}) {
  const query = useQuery(fetchAnnualOfferOptions({ queryOptions, optionalQuery }));

  return query;
}

export function fetchAnnualOfferOptions({ queryOptions: queryOpt, optionalQuery }: Props = {}) {
  return queryOptions({
    queryKey: ['subjects', 'offer', optionalQuery],
    queryFn: () => getAnualOffers(optionalQuery),
    ...queryOpt,
  });
}
