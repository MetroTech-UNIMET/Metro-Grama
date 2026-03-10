import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { Query_AnnualOffers } from '@/api/subject_offferAPI';

export const subjectOffers = createQueryKeys('subjectOffers', {
  byQuery: (optionalQuery?: Query_AnnualOffers) => ({
    queryKey: [optionalQuery],
    contextQueries: {
      trimester: (trimesterId: string) => [trimesterId],
    },
  }),
  byYear: (year?: string, careerId?: string) => [year, careerId],
});
