import { queryOptions, useQuery } from '@tanstack/react-query';

import { getEnrollment } from '@/api/interactions/enrollApi';

import type { OptionalQueryOptions } from '@/hooks/queries/types';
import type { AxiosError } from 'axios';
import type { EnrollEntity } from '@/interfaces/Enroll';

interface Props<T = EnrollEntity> {
  subjectCode: string | undefined;
  queryOptions?: OptionalQueryOptions<T, AxiosError>;
}

export function fetchEnrollmenOptions({ subjectCode, queryOptions: queryOpt }: Props) {
  return queryOptions({
    queryKey: ['subjects', subjectCode, 'enrollment'],
    queryFn: async () => {
      if (!subjectCode) throw new Error('Es necesario seleccionar una materia');
      return getEnrollment(subjectCode);
    },
    enabled: !!subjectCode && queryOpt?.enabled,
    ...queryOpt,
  });
}

export function useFetchEnrollment({ subjectCode, queryOptions }: Props) {
  return useQuery(fetchEnrollmenOptions({ subjectCode, queryOptions }));
}
