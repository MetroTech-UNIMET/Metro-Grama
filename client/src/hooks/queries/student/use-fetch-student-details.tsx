import { queryOptions, useQuery } from '@tanstack/react-query';
import { getStudentDetails } from '@/api/interactions/studentApi';

import type { OptionalQueryOptions } from '../types';
import type { StudentDetails } from '@/interfaces/Student';

interface Props<T = StudentDetails> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchStudentDetailsOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['student', 'details'],
    queryFn: () => getStudentDetails(),
    ...queryOpt,
  });
}

export function useFetchStudentDetails(props?: Props) {
  return useQuery(fetchStudentDetailsOptions(props));
}
