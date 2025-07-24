import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getSubjects } from "@/api/subjectsAPI";

export function useFetchSubjects(careers: string[] = [], queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
  const careersParam = careers.length === 0  ? "none" : careers.sort().join(",")
  
  const query = useQuery({
    queryKey: ["subjects", {
      careers: careersParam
    }],
    queryFn: () => getSubjects(careersParam),
    ...queryOptions
  });

  return query;
}
