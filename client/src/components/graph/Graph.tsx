import { useState, useEffect } from "react";
import { getSubjects } from "@/api/subjectsAPI";
import Graphin from "@antv/graphin";
import { MiniMap } from "@antv/graphin-components";
import { useQuery } from "react-query";
import { AxiosError } from  "axios";

import SearchPrelations from "./behaviors/Search-Prelations";
import MenuActions from "./behaviors/MenuActions";

import useSubjectGraph from "@/hooks/useSubjectGraph";
import { Subject } from "@/interfaces/Subject";
import { ShowAxiosError } from "@components/ShowAxiosError";
import { CareerMultiDropdown } from "@components/CareerMultiDropdown";

import { Option } from "@ui/multidropdown";
import { Spinner } from "@ui/spinner";

export default function Graph() {
  const [selectedCareers, setSelectedCareers] = useState<Option[]>([]);
  const { data, isLoading, error, refetch } = useQuery<Graph<Subject>>(
    {
      queryFn: () => getSubjects(selectedCareers.map((c) => c.value)),
    }
  );

  useEffect(() => {
    refetch()
  }, [selectedCareers])
  

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
      <CareerMultiDropdown
        value={selectedCareers}
        onChange={setSelectedCareers}
      />

      <Graphin
        data={graph}
        style={{
          backgroundColor: "transparent",
        }}
        layout={{ type: "dagre" }}
      >
        <SearchPrelations />
        <MenuActions />
        <MiniMap
          visible={true}
          style={{
            borderRadius: 4,
          }}
          options={{
            className:
              "fixed bottom-4 right-4 border-2 border-white rounded-lg bg-white",
          }}
        />
      </Graphin>
    </>
  );
}
