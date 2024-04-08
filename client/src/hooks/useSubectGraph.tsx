import Graphin, { GraphinData } from "@antv/graphin";
import iconLoader from "@antv/graphin-icons";
import "@antv/graphin-icons/dist/index.css";

const icons = Graphin.registerFontFamily(iconLoader);


export default function useSubectGraph(data: Graph<Subject>) {
  const graph: GraphinData = {
    //@ts-ignore 
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
              size: 20,
              fill: "green",
              type: "font",
              fontFamily: "graphin",
              value: icons.home,
            },
          },
          viewed: {
            keyshape: {
              fill: "green",
              stroke: "green",
            },
          },
          accesible: {
            keyshape: {
              fill: "blue",
              stroke: "blue",
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

  return { graph };
}
