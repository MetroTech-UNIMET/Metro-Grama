import { queryOptions, useQuery } from '@tanstack/react-query';
import { getStudentCareers } from '@/api/interactions/studentApi';
import { notRetryOnUnauthorized } from '@utils/queries';

import type { AxiosError } from 'axios';
import type { OptionalQueryOptions } from '../types';
import type { Id } from '@/interfaces/surrealDb';

interface Props<T = Id[]> {
  queryOptions?: OptionalQueryOptions<T, AxiosError>;
}

export function fetchStudentCareersOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['student', 'careers'],
    queryFn: () => getStudentCareers(),
    retry: notRetryOnUnauthorized,
    ...queryOpt,
  });
}

export function useFetchStudentCareers(props?: Props) {
  return useQuery(fetchStudentCareersOptions(props));
}
