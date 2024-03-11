import { GraphinData } from "@antv/graphin/lib/typings/type";
import { useEffect } from "react";

export default function useSubectGraph(data: Graph<Subject>) {
  const graph: GraphinData = {
    nodes: data.Nodes!.map((node) => ({
      id: node.Id,
      label: node.Data.Name,
      data: node,

      style: {
        label: {
          value: node.Data.Name,
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
    edges: data.Edges!.map((edge) => ({
      source: edge.From,
      target: edge.To,
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
