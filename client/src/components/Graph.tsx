import { getSubjects } from "@/api/subjectsAPI";
import Graphin, { GraphinData, Behaviors, Utils } from "@antv/graphin";
import { MiniMap } from "@antv/graphin-components";
import { useQuery, useQueryClient } from "react-query";
const { ActivateRelations } = Behaviors;

export default function Graph() {
  const { data, isLoading, error } = useQuery<Graph<Subject>>(
    ["subjects", "Ingeniería en Sistemas"],
    getSubjects
  );

  if (error) return <div>Error</div>;

  if (isLoading || !data) return <div>Loading...</div>;

  const graph: GraphinData = {
    nodes: data.Nodes!.map((node) => ({
      id: node.Id,
      label: node.Data.Name,
      data: node,
      style: {
        // keyshape: {
        //   fill: "red"
        // },
        label: {
          value: node.Data.Name,
          fill: "white",
        },
      },
    })),
    edges: data.Edges!.map((edge) => ({
      source: edge.From,
      target: edge.To,
    })),
  };
  console.log(graph);

  return (
    <Graphin
      data={graph}
      // width={undefined}
      // height={undefined}
      style={{
        backgroundColor: "transparent",
      }}
    >
      {/* <ActivateRelations trigger="click" /> */}
      <MiniMap
        visible={true}
        style={{
          border: "1px solid #e2e2e2",
          borderRadius: 4,
        }}
        options={{ className: "fixed bottom-4 right-4 border-2 border-white rounded-lg bg-white" }}
      />
    </Graphin>
  );
}
