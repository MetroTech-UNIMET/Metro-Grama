import { getSubjects } from "@/api/subjectsAPI";
import Graphin, {
  Components,
  GraphinData,
  Behaviors,
  Utils,
} from "@antv/graphin";
import { useQuery } from "react-query";
const { MiniMap } = Components;
const { DragCanvas, ZoomCanvas } = Behaviors;

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
        label: {
          value: node.Data.Name,
        },
      },
    })),
    edges: data.Edges!.map((edge) => ({
      source: edge.From,
      target: edge.To,
    })),
  };

  return (
    <Graphin
      data={graph}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <ZoomCanvas enableOptimize={true} />
      <DragCanvas enableOptimize={true} />
      {/* <MiniMap
        style={{
          position: "absolute",
          right: 4,
          bottom: 4,
          width: 200,
          height: 150,
          border: "1px solid #e2e2e2",
          borderRadius: 4,
        }}
      /> */}
    </Graphin>
  );
}
