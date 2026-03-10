import { queryOptions, useQuery } from '@tanstack/react-query';

import { getAnnualOfferByYear, type AnnualOfferByYearItem } from '@/api/subject_offferAPI';
import { queryKeys } from '@/lib/query-keys';

import type { OptionalQueryOptions } from '../types';

interface Props<T = AnnualOfferByYearItem[]> {
  year: string | undefined;
  career: string | undefined;
  queryOptions?: OptionalQueryOptions<T>;
}

export function useFetchAnnualOfferByYear({ year, career, queryOptions }: Props) {
  return useQuery(fetchAnnualOfferByYearOptions({ year, career, queryOptions }));
}

export function fetchAnnualOfferByYearOptions({ year, career, queryOptions: queryOpt }: Props) {
  return queryOptions({
    queryKey: queryKeys.subjectOffers.byYear(year, career).queryKey,
    queryFn: () => getAnnualOfferByYear(year as string, career),
    enabled: !!year && !!career,
    ...queryOpt,
  });
}
