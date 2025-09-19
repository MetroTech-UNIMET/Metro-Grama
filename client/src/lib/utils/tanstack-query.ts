import type { QueryClient, QueryKey } from '@tanstack/query-core';

export async function fetchAndSetQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  fetchFn: () => Promise<T>,
): Promise<T> {
  let data = queryClient.getQueryData<T>(queryKey);

  if (!data) {
    data = await fetchFn();
    queryClient.setQueryData(queryKey, data);
  }

  return data;
}

export async function invalidateRootQueryKey(queryClient: QueryClient, queryKey: string | number) {
  await queryClient.invalidateQueries({
    predicate: (query) => Array.isArray(query.queryKey) && query.queryKey.length > 0 && query.queryKey[0] === queryKey,
  });
}
