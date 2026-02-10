import { queryOptions, useQuery } from '@tanstack/react-query';
import { getStudentCourseByTrimester, type QueryCourseParams } from '@/api/interactions/courseApi';

import type { OptionalQueryOptions } from '../types';
import type { GetCourseByTrimesterResponse } from '@/api/interactions/course.types';

interface Props<T = GetCourseByTrimesterResponse> {
  trimesterId: string;
  queryOptions?: OptionalQueryOptions<T>;
  params?: QueryCourseParams;
}

export function fetchStudentCourseByTrimesterOptions({ trimesterId, params, queryOptions: queryOpt }: Props) {
  return queryOptions({
    queryKey: ['course', 'student', trimesterId, params],
    queryFn: async () => {
      try {
        return await getStudentCourseByTrimester(trimesterId, params);
      } catch (err: any) {
        // If backend indicates no data found, return a safe empty shape instead of throwing
        if (err?.response?.data?.message === 'No se encontraron datos para el trimestre') {
          return {
            trimesterId,
            is_principal: params?.is_principal ?? true,
            sections: [],
          } as GetCourseByTrimesterResponse;
        }
        throw err;
      }
    },
    enabled: !!trimesterId,
    ...queryOpt,
  });
}

export function useFetchStudentCourseByTrimester({ trimesterId, queryOptions, params }: Props) {
  return useQuery(fetchStudentCourseByTrimesterOptions({ trimesterId, params, queryOptions }));
}
