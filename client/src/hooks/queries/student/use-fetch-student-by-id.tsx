import { queryOptions, useQuery } from '@tanstack/react-query';
import { getStudentByID } from '@/api/interactions/studentApi';
import { queryKeys } from '@/lib/query-keys';

import type { OtherStudentDetails } from '@/api/interactions/student.types';
import type { OptionalQueryOptions } from '../types';

interface Props<T = OtherStudentDetails> {
  studentId: string;
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchStudentByIdOptions({ queryOptions: queryOpt, studentId }: Props) {
  return queryOptions({
    queryKey: queryKeys.student.details(studentId).queryKey,
    queryFn: () => getStudentByID(studentId),
    ...queryOpt,
  });
}

export function useFetchStudentByID(props: Props) {
  return useQuery(fetchStudentByIdOptions(props));
}
