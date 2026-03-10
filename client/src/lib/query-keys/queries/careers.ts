import { createQueryKeys } from '@lukemorales/query-key-factory';

export const careers = createQueryKeys('careers', {
  all: {
    queryKey: null,
    contextQueries: {
      options: null,
    },
  },
  detail: (id: string) => [id],
});
