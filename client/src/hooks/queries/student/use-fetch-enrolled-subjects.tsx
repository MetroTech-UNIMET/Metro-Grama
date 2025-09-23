import { queryOptions, useQuery } from '@tanstack/react-query';

import { getEnrolledSubjects, type QueryEnrollParams } from '@/api/interactions/enrollApi';

import { notRetryOnUnauthorized } from '@utils/queries';

import type { OptionalQueryOptions } from '../types';
import type { AxiosError } from 'axios';

interface Props<T = string[]> {
  queryOptions?: OptionalQueryOptions<T, AxiosError>;
  params?: QueryEnrollParams;
}

export function fetchEnrolledSubjectsOptions({ queryOptions: queryOpt, params }: Props = {}) {
  return queryOptions<string[], AxiosError>({
    queryKey: ['student', 'enrolled-subjects', params],
    queryFn: () => getEnrolledSubjects(params),
    retry: notRetryOnUnauthorized,
    ...queryOpt,
  });
}

export function useFetchEnrolledSubjects(props?: Props) {
  return useQuery(fetchEnrolledSubjectsOptions(props));
}
