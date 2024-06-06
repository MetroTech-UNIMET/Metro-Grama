import { getSubjects } from "@/api/subjectsAPI";
import { Subject } from "@/interfaces/Subject";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import useFetchCareersOptions, {
  CareerOption,
} from "./use-FetchCareersOptions";

export default function useFecthSubjectByCareer() {
  const [selectedCareers, setSelectedCareers] = useState<CareerOption[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    careers: "none",
  });

  const careers = searchParams.get("careers") ?? "none";
  const subjectQuery = useQuery<Graph<Subject>>({
    queryKey: [
      "subjects",
      {
        careers: careers === "none" ? [] : careers.split(",").sort(),
      },
    ],
    queryFn: () => getSubjects(careers),
  });

  const { options, isLoading: loadingCareers } = useFetchCareersOptions();

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (options.length === 0 || loadingCareers) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;

      const filter = searchParams.get("careers");
      if (!filter || !options) return;

      if (filter === "none") {
        setSelectedCareers([]);
      } else {
        const careers = filter.split(",");

        const selectedCareers = careers.map((career) => {
          const option = options.find((option) => option.query === career)!;
          return option;
        });

        setSelectedCareers(selectedCareers);
      }
      return;
    }

    if (selectedCareers.length === 0) {
      setSearchParams({ careers: "none" });
    } else {
      const careers = selectedCareers.map((career) => career.query).join(",");
      setSearchParams({ careers });
    }
  }, [selectedCareers, loadingCareers]);

  useEffect(() => {
    subjectQuery.refetch();
  }, [searchParams]);

  return { ...subjectQuery, selectedCareers, setSelectedCareers };
}
