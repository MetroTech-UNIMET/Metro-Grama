import { useState, useEffect } from "react";
import { getSubjects } from "@/api/subjectsAPI";
import Graphin from "@antv/graphin";
import { useQuery } from "react-query";
import { AxiosError } from "axios";

import SearchPrelations from "./behaviors/Search-Prelations";
import MenuActions from "./behaviors/MenuActions";
import SideBarGraph from "./SideBarGraph";

import useSubjectGraph from "@/hooks/useSubjectGraph";
import { Subject } from "@/interfaces/Subject";
import { ShowAxiosError } from "@components/ShowAxiosError";
import { CareerMultiDropdown } from "@components/CareerMultiDropdown";

import { Option } from "@ui/derived/multidropdown";
import { Spinner } from "@ui/spinner";
import { Toaster } from "@ui/toaster";
import { useSearchParams } from "react-router-dom";

export default function Graph() {
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

  const { graph } = useSubjectGraph(data, isLoading, selectedCareers);

  if (error) return <ShowAxiosError error={error as AxiosError} />;

  if (isLoading || !data)
    return (
      <div className="h-full grid place-items-center ">
        <Spinner size="giant" />
      </div>
    );

  return (
    <>
      <div className="fixed flex flex-row gap-4 z-10 w-full pr-12">
        <SideBarGraph />

        <CareerMultiDropdown
          loadingSubjects={isRefetching}
          value={selectedCareers}
          onChange={setSelectedCareers}
        />
      </div>

      <Graphin
        data={graph}
        style={{
          backgroundColor: "transparent",
        }}
        layout={{ type: "dagre" }}
      >
        <SearchPrelations />
        <MenuActions />
        <Toaster />
      </Graphin>
    </>
  );
}
