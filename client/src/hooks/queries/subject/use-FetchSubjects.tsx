import { useQuery } from "@tanstack/react-query";

import { getSubjects } from "@/api/subjectsAPI";

import type { Subject } from "@/interfaces/Subject";
import type { OptionalQueryOptions } from "../types";

export function useFetchSubjects(
  careers: string[] = [],
  queryOptions?: OptionalQueryOptions<Subject[]>
) {
  const careersParam = careers.length === 0 ? "none" : careers.sort().join(",");

  const query = useQuery({
    queryKey: [
      "subjects",
      {
        careers: careersParam,
      },
    ],
    queryFn: () => getSubjects(careersParam),
    ...queryOptions,
  });

  return query;
}
