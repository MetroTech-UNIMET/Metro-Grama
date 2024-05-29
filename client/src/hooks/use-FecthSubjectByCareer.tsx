import { getSubjects } from "@/api/subjectsAPI";
import { Subject } from "@/interfaces/Subject";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { Option } from "@ui/derived/multidropdown";
import useFetchCareersOptions from "./use-FetchCareersOptions";


// TODO - Refactorizar query string para quitar filter y que de una sea career
export default function useFecthSubjectByCareer() {
  const [selectedCareers, setSelectedCareers] = useState<Option[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    careers: "all",
  });

  // TODO -  usar queryKey
  const { data, isLoading, isRefetching, error, refetch } = useQuery<
    Graph<Subject>
  >({
    // queryKey: [],
    queryFn: () => getSubjects(searchParams.get("careers") ?? "all"),
  });

  const {
    options,
    error: errorCareers,
    isLoading: loadingCareers,
  } = useFetchCareersOptions();

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (options.length === 0 || isLoading) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;

      const filter = searchParams.get("filter");
      if (!filter || !options) return;

      if (filter === "all") {
        setSelectedCareers([]);
      } else {
        const careers = filter.slice(7).split(",");

        const selectedCareers = careers.map((career) => {
          const option = options.find((option) => option.value === career)!;
          return option;
        });
        setSelectedCareers(selectedCareers);
      }
      return;
    }

    if (selectedCareers.length === 0) {
      setSearchParams({ careers: "all" });
    } else {
      const careers = selectedCareers.map((career) => career.value).join(",");
      setSearchParams({ careers });
    }
  }, [selectedCareers, loadingCareers]);

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
