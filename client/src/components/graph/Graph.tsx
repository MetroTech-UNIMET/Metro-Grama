import { useState } from "react";
import { getSubjects } from "@/api/subjectsAPI";
import Graphin from "@antv/graphin";
import { MiniMap } from "@antv/graphin-components";
import { useQuery } from "react-query";

import SearchPrelations from "./behaviors/Search-Prelations";
import MenuActions from "./behaviors/MenuActions";
import useSubectGraph from "@/hooks/useSubectGraph";
import { ShowAxiosError } from "@components/ShowAxiosError";
import { AxiosError } from "axios";
import { Subject } from "@/interfaces/Subject";
import { CareerMultiDropdown } from "@components/CareerMultiDropdown";
import { Option } from "@ui/multidropdown";

export default function Graph() {
  const { data, isLoading, error } = useQuery<Graph<Subject>>(
    ["subjects", "Ingeniería en Sistemas"],
    getSubjects
  );

  const [selectedCareers, setSelectedCareers] = useState<Option[]>([]);

  if (error) return <ShowAxiosError error={error as AxiosError} />;

  if (isLoading || !data) return <div>Loading...</div>;

  const { graph } = useSubectGraph(data);

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
