import { queryOptions, useQueryClient, useQuery, type QueryClient } from '@tanstack/react-query';
import { getSubjects } from '@/api/subjectsAPI';

import { fetchAndSetQueryData } from '@utils/tanstack-query';

import type { Option } from '@ui/types/option.types';

export function fetchSubjectOptionsOptions(queryClient: QueryClient) {
  return queryOptions({
    queryKey: ['subjects', 'options'],
    queryFn: async () => {
      const careersParam = 'none';
      const subjects = await fetchAndSetQueryData(queryClient, ['subjects', { careers: careersParam }], () =>
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
