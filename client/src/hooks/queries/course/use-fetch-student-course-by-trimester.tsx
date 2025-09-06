import { useQuery } from '@tanstack/react-query';
import { getStudentCourseByTrimester, type QueryCourseParams } from '@/api/interactions/courseApi';

import type { OptionalQueryOptions } from '../types';
import type { GetCourseByTrimesterResponse } from '@/api/interactions/course.types';

interface Props<T = GetCourseByTrimesterResponse> {
  trimesterId: string;
  queryOptions?: OptionalQueryOptions<T>;
  params?: QueryCourseParams;
}

export function useFetchStudentCourseByTrimester({ trimesterId, queryOptions, params }: Props) {
  return useQuery({
    queryKey: ['course', 'student', trimesterId, params],
    queryFn: () => getStudentCourseByTrimester(trimesterId, params),
    enabled: !!trimesterId,
    ...queryOptions,
  });
}
