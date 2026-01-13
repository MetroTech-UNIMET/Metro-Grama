import { queryOptions, useQuery } from '@tanstack/react-query';

import { getAnnualOfferByYear, type AnnualOfferByYearItem } from '@/api/subject_offferAPI';

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
    queryKey: ['subjects', 'offer', 'year', year, career],
    queryFn: () => getAnnualOfferByYear(year as string, career),
    enabled: !!year && !!career,
    ...queryOpt,
  });
}
