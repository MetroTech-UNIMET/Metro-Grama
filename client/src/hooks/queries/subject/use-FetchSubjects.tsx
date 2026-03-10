import { queryOptions, useQuery } from "@tanstack/react-query";

import { getSubjects } from "@/api/subjectsAPI";
import { queryKeys } from '@/lib/query-keys';

import type { Subject } from "@/interfaces/Subject";
import type { OptionalQueryOptions } from "../types";

export function fetchSubjectsOptions(careers: string[] = [], queryOpt?: OptionalQueryOptions<Subject[]>) {
  const careersParam = careers.length === 0 ? "none" : careers.sort().join(",");
  return queryOptions({
    queryKey: queryKeys.subjects.list(careersParam).queryKey,
    queryFn: () => getSubjects(careersParam),
    ...queryOpt,
  });
}

export function useFetchSubjects(
  careers: string[] = [],
  queryOptions?: OptionalQueryOptions<Subject[]>
) {
  const query = useQuery(fetchSubjectsOptions(careers, queryOptions));
  return query;
}
