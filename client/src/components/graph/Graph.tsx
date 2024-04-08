import { getSubjects } from "@/api/subjectsAPI";
import Graphin from "@antv/graphin";
import { MiniMap } from "@antv/graphin-components";
import { useQuery } from "react-query";

import SearchPrelations from "./behaviors/Search-Prelations";
// @ts-ignore
import MenuActions from "./behaviors/MenuActions";
import useSubectGraph from "@/hooks/useSubectGraph";

export default function Graph() {

  const { data, isLoading, error } = useQuery<Graph<Subject>>(
    ["subjects", "Ingeniería en Sistemas"],
    getSubjects
  );

  if (error) return <div>Error</div>;

  if (isLoading || !data) return <div>Loading...</div>;
  
  const {graph} = useSubectGraph(data);

  return (
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
          border: "1px solid #e2e2e2",
          borderRadius: 4,
        }}
        options={{
          className:
            "fixed bottom-4 right-4 border-2 border-white rounded-lg bg-white",
        }}
      />
    </Graphin>
  );
}
