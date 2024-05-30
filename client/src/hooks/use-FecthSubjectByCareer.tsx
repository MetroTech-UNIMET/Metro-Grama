import { getSubjects } from "@/api/subjectsAPI";
import { Subject } from "@/interfaces/Subject";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { Option } from "@ui/derived/multidropdown";
import useFetchCareersOptions from "./use-FetchCareersOptions";

export default function useFecthSubjectByCareer() {
  const [selectedCareers, setSelectedCareers] = useState<Option[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    careers: "none",
  });

  const careers = searchParams.get("careers") ?? "none";
  const { data, isLoading, isRefetching, error, refetch } = useQuery<
    Graph<Subject>
  >({
    queryKey: [
      "careers",
      {
        careers,
      },
    ],
    queryFn: () => getSubjects(careers),
  });

  const { options, isLoading: loadingCareers } = useFetchCareersOptions();

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (options.length === 0 || isLoading) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;

      const filter = searchParams.get("careers");
      if (!filter || !options) return;

      if (filter === "none") {
        setSelectedCareers([]);
      } else {
        const careers = filter.split(",");

        const selectedCareers = careers.map((career) => {
          const option = options.find((option) => option.value === career)!;
          return option;
        });
        setSelectedCareers(selectedCareers);
      }
      return;
    }

    if (selectedCareers.length === 0) {
      setSearchParams({ careers: "none" });
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
