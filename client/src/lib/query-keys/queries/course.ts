import { createQueryKeys } from '@lukemorales/query-key-factory';

import type{ QueryCourseParams } from '@/api/interactions/courseApi';

export const course = createQueryKeys('course', {
  student: (trimesterId: string, params?: QueryCourseParams) => [trimesterId, params],
});
