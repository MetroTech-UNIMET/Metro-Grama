import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import useFetchCareersOptions from "../use-FetchCareersOptions";
import { getSubjectsGraph } from "@/api/subjectsAPI";

import type { Subject } from "@/interfaces/Subject";
import type { Option } from "@ui/types";
import type { Graph } from "@/interfaces/Graph";

export default function useFecthSubjectsGraphByCareer() {
  const [selectedCareers, setSelectedCareers] = useState<Option[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    careers: "none",
  });

  const careers = searchParams.get("careers") ?? "none";
  const subjectQuery = useQuery<Graph<Subject>>({
    queryKey: [
      "subjects",
      "graph",
      {
        careers: careers === "none" ? [] : careers.split(",").sort(),
      },
    ],
    queryFn: () => getSubjectsGraph(careers),
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

        const selectedCareers = careers.reduce<Option[]>((acc, career) => {
          const option = options.find((option) => option.value === career);
          const exists = acc.find((accOption) => accOption.value === career);
          if (option && !exists) acc.push(option);

          return acc;
        }, []);

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
    subjectQuery.refetch();
  }, [searchParams]);

  return { ...subjectQuery, selectedCareers, setSelectedCareers };
}
