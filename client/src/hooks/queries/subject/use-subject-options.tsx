import { queryOptions, useQueryClient, useQuery, type QueryClient } from '@tanstack/react-query';
import { getSubjects } from '@/api/subjectsAPI';
import { queryKeys } from '@/lib/query-keys';

import { fetchAndSetQueryData } from '@utils/tanstack-query';

import type { Option } from '@ui/types/option.types';

export function fetchSubjectOptionsOptions(queryClient: QueryClient) {
  const careersParam = 'none';

  return queryOptions({
    queryKey: queryKeys.subjects.list(careersParam)._ctx.options.queryKey,
    queryFn: async () => {
      const subjects = await fetchAndSetQueryData(queryClient, queryKeys.subjects.list(careersParam).queryKey, () =>
        getSubjects(careersParam),
      );

      const options: Option[] =
        subjects?.map((subject) => {
          const code = subject.code.ID;
          const label = `(${code}) - ${subject.name}`;

          return {
            label,
            value: code,
          };
        }) ?? [];

      return options;
    },
  });
}

export function useSubjectOptions() {
  const queryClient = useQueryClient();

  const query = useQuery(fetchSubjectOptionsOptions(queryClient));

  return { ...query, data: query.data ?? [] };
}
