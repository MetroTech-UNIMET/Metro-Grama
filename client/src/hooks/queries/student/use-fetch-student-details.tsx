import { queryOptions, useQuery } from '@tanstack/react-query';
import { getStudentDetails } from '@/api/interactions/studentApi';

import type { OptionalQueryOptions } from '../types';
import type { MyStudentDetails } from '@/api/interactions/student.types';

interface Props<T = MyStudentDetails> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchStudentDetailsOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['student', 'details', 'my-id'],
    queryFn: () => getStudentDetails(),
    ...queryOpt,
  });
}

export function useFetchStudentDetails(props?: Props) {
  return useQuery(fetchStudentDetailsOptions(props));
}
