import { getSubjects } from "@/api/subjectsAPI";
import Graphin, { GraphinData, Behaviors } from "@antv/graphin";
import { MiniMap } from "@antv/graphin-components";
import { useQuery } from "react-query";
import SearchPrelations from "./Search-Prelations";
const { } = Behaviors;

export default function Graph() {
  const { data, isLoading, error } = useQuery<Graph<Subject>>(
    ["subjects", "Ingeniería en Sistemas"],
    getSubjects
  );

  if (error) return <div>Error</div>;

  if (isLoading || !data) return <div>Loading...</div>;

  const graph: GraphinData = {
    // @ts-ignore
    nodes: data.nodes!.map((node) => ({
      id: node.id,
      label: node.data.name,
      data: node,
      style: {
        label: {
          value: node.data.name,
          fill: "white",
        },
        status: {
          start: {
            halo: {
              visible: true,
              fill: "blue",
            },
            icon: {
              // TODO - Ponerle un icono para el start
            },
          },
        },
      },
    })),
    edges: data.edges!.map((edge) => ({
      source: edge.from,
      target: edge.to,
      style: {
        status: {
          prelation: {
            keyshape: {
              stroke: "blue",
            },
            halo: {
              fill: "#ddd",
              visible: true,
            },
          },
          future: {
            keyshape: {
              stroke: "red",
            },
            halo: {
              fill: "#ddd",
              visible: true,
            },
          },
        },
      },
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
      <SearchPrelations />
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
