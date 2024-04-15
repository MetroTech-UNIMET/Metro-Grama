import Graphin, { GraphinData } from "@antv/graphin";
import iconLoader from "@antv/graphin-icons";
import { NodeStyleIcon } from "@antv/graphin/lib/typings/type";

import { useEffect, useState } from "react";
import { Subject } from "@/interfaces/Subject";
import { Option } from "@ui/multidropdown";

import "@antv/graphin-icons/dist/index.css";

const icons = Graphin.registerFontFamily(iconLoader);

export default function useSubjectGraph(
  data: Graph<Subject> | undefined,
  isLoading: boolean,
  selectedCareers: Option[]
) {
  const [graph, setGraph] = useState<GraphinData>({ nodes: [], edges: [] });

  useEffect(() => {
    if (isLoading || !data) return;

    const newGraph: GraphinData = {
      //@ts-ignore
      nodes: data.nodes!.map((node, index) => ({
        id: node.id,
        label: node.data.name,
        data: node,
        status: {
          normal: true,
        },

        style: {
          label: {
            value: node.data.name,
            fill: "white",
          },
          status: {
            normal: {
              icon: getNormalIcon(node.data, selectedCareers),
            },
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
            "prelation-viewed": {
              keyshape: {
                stroke: "blue",
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

    setGraph(newGraph);
  }, [data, selectedCareers]);

  return { graph };
}

function getNormalIcon(
  subject: Subject,
  selectedCareers: Option[]
): NodeStyleIcon {
  let icon = "";

  if (subject.careers.length > 1) {
    icon = "🤝";
  } else {
    const career = selectedCareers.find(
      (option) => option.value === `carrer:${subject.careers[0]}`
    );

    if (career) {
      icon = career.label.split(" ")[0];
    }
  }

  return {
    size: 15,
    fill: "green",
    type: "text",
    fontFamily: "graphin",
    value: icon,
  };
}
