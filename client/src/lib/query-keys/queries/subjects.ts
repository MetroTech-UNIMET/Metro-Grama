import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { Query_SubjectStats } from '@/api/statsApi';

export const subjects = createQueryKeys('subjects', {
  list: (careersCsv: string) => ({
    queryKey: [{ careers: careersCsv }],
    contextQueries: {
      graph: null,
      options: null,
    },
  }),

  electivesGraph: null,

  details: (subjectCode: string) => ({
    queryKey: [subjectCode],
    contextQueries: {
      stats: (query?: Query_SubjectStats) => [query],
      enrollment: null,
    },
  }),
});
