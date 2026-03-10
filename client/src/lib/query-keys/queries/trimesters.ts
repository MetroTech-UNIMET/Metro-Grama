import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { QueryTrimesterParams } from '@/api/trimestersApi';

export const trimesters = createQueryKeys('trimesters', {
  list: (params?: QueryTrimesterParams) => ({
    queryKey: [params],
    contextQueries: {
      options: null,
    },
  }),
});
