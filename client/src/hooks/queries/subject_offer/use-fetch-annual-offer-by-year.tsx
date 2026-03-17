import { queryOptions, useQuery } from '@tanstack/react-query';

import {
  getAnnualOfferByYear,
  type Query_AnnualOfferByYear,
  type AnnualOfferByYearItem,
} from '@/api/subject_offferAPI';
import { queryKeys } from '@/lib/query-keys';

import type { OptionalQueryOptions } from '../types';

interface Props<T = AnnualOfferByYearItem[]> {
  year: string | undefined;
  queryOptions?: OptionalQueryOptions<T>;
  query: Query_AnnualOfferByYear;
}

export function useFetchAnnualOfferByYear({ year, queryOptions, query }: Props) {
  return useQuery(fetchAnnualOfferByYearOptions({ year, queryOptions, query }));
}

export function fetchAnnualOfferByYearOptions({ year, query, queryOptions: queryOpt }: Props) {
  return queryOptions({
    queryKey: queryKeys.subjectOffers.byYear(year, query.career, query.includeElectives).queryKey,
    queryFn: () => getAnnualOfferByYear(year as string, query),
    enabled: !!year && (!!query.career || !!query.includeElectives),
    ...queryOpt,
  });
}
