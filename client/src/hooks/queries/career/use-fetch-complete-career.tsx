import { queryOptions, useQuery } from '@tanstack/react-query';

import { getCompleteCareer } from '@/api/careersApi';

import type { OptionalQueryOptions } from '../types';
import type { CareerWithSubjects } from '@/interfaces/Career';

interface Props<T = CareerWithSubjects> {
  id: string;
  queryOptions?: OptionalQueryOptions<T>;
}

export function useFetchCompleteCareer({ id, queryOptions }: Props) {
  return useQuery(fetchCompleteCareerOptions({ id, queryOptions }));
}

export function fetchCompleteCareerOptions({ id, queryOptions: queryOpt }: Props) {
  return queryOptions({
    queryKey: ['career', id],
    queryFn: () => getCompleteCareer(id),
    ...queryOpt,
  });
}
