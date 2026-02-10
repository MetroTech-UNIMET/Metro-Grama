import { queryOptions, useQuery } from "@tanstack/react-query";

import { getSubjects } from "@/api/subjectsAPI";

import type { Subject } from "@/interfaces/Subject";
import type { OptionalQueryOptions } from "../types";

export function fetchSubjectsOptions(careers: string[] = [], queryOpt?: OptionalQueryOptions<Subject[]>) {
  const careersParam = careers.length === 0 ? "none" : careers.sort().join(",");
  return queryOptions({
    queryKey: [
      "subjects",
      {
        careers: careersParam,
      },
    ],
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
