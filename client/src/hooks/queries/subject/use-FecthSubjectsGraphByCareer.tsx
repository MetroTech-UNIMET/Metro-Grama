import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import useFetchCareersOptions, { type CareerOption } from "../use-FetchCareersOptions";
import { getSubjectsGraph } from "@/api/subjectsAPI";

import type { Graph } from "@/interfaces/Graph";
import type { Subject } from "@/interfaces/Subject";

export default function useFecthSubjectsGraphByCareer() {
  const [selectedCareers, setSelectedCareers] = useState<CareerOption[]>([]);
  const search = useSearch({ from: "/materias" });
  const navigate = useNavigate();

  const careers = search?.careers ?? "none";
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

  const filter = careers;
      if (!filter || !options) return;

      if (filter === "none") {
        setSelectedCareers([]);
      } else {
        const careers = filter.split(",");

        const selectedCareers = careers.reduce((acc: CareerOption[], career: string) => {
          const option = options.find((option) => option.value === career);
          const exists = acc.find((accOption) => accOption.value === career);
          if (option && !exists) acc.push(option);

          return acc;
        }, [] as CareerOption[]);

        setSelectedCareers(selectedCareers);
      }
      return;
    }

    // Update the URL search params via router to keep state in sync
  const next =
      selectedCareers.length === 0
        ? { careers: "none" as const }
        : { careers: selectedCareers.map((c) => c.value).join(",") };
  navigate({ to: "/materias", search: next as any, replace: true });
  }, [selectedCareers, loadingCareers]);

  useEffect(() => {
    subjectQuery.refetch();
  }, [careers]);

  return { ...subjectQuery, selectedCareers, setSelectedCareers };
}
