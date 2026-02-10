import { queryOptions, useQuery } from '@tanstack/react-query';
import { getStudentCareers } from '@/api/interactions/studentApi';
import type { OptionalQueryOptions } from '../types';
import type { Id } from '@/interfaces/surrealDb';

interface Props<T = Id[]> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchStudentCareersOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['student', 'careers'],
    queryFn: () => getStudentCareers(),
    ...queryOpt,
  });
}

export function useFetchStudentCareers(props?: Props) {
  return useQuery(fetchStudentCareersOptions(props));
}
