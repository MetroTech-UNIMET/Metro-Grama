import { queryOptions, useQuery } from '@tanstack/react-query';
import { getStudentByID } from '@/api/interactions/studentApi';

import type { StudentDetails } from '@/interfaces/Student';
import type { OptionalQueryOptions } from '../types';

interface Props<T = StudentDetails> {
  studentId: string;
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchStudentByIdOptions({ queryOptions: queryOpt, studentId }: Props) {
  return queryOptions({
    queryKey: ['student', 'details', studentId],
    queryFn: () => getStudentByID(studentId),
    ...queryOpt,
  });
}

export function useFetchStudentByID(props: Props) {
  return useQuery(fetchStudentByIdOptions(props));
}
