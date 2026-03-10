import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { QueryEnrollParams } from '@/api/interactions/enrollApi';

export const student = createQueryKeys('student', {
  details: (studentId: string) => [studentId],
  careers: null,
  enrolledSubjects: (params?: QueryEnrollParams) => [params],
});
