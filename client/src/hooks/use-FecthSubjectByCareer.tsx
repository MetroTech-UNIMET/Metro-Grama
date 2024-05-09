import { getSubjects } from "@/api/subjectsAPI";
import { Subject } from "@/interfaces/Subject";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { Option } from "@ui/derived/multidropdown";

export default function useFecthSubjectByCareer() {
  const [selectedCareers, setSelectedCareers] = useState<Option[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    filter: "all",
  });

  // REVIEW - Considerar usar queryKey
  const { data, isLoading, isRefetching, error, refetch } = useQuery<
    Graph<Subject>
  >({
    queryFn: () => getSubjects(searchParams.get("filter") ?? "all"),
  });

  useEffect(() => {
    if (selectedCareers.length === 0) {
      setSearchParams({ filter: "all" });
    } else {
      const careers = selectedCareers.map((career) => career.value).join(",");
      setSearchParams({ filter: `career:${careers}` });
    }
  }, [selectedCareers]);

  useEffect(() => {
    refetch();
  }, [searchParams]);

  return {
    data,
    isLoading,
    isRefetching,
    error,
    selectedCareers,
    setSelectedCareers,
  };
}
