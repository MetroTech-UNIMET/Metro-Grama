import Graphin, { GraphinData } from "@antv/graphin";
import iconLoader from "@antv/graphin-icons";
import { NodeStyleIcon } from "@antv/graphin/lib/typings/type";

import { useEffect, useState } from "react";
import { Subject } from "@/interfaces/Subject";
import { Option as DropdownOption } from "@ui/multidropdown";

import "@antv/graphin-icons/dist/index.css";
import { useStatusActions } from "@/components/graph/behaviors/StatusActions";

const icons = Graphin.registerFontFamily(iconLoader);

export default function useSubjectGraph(
  data: Graph<Subject> | undefined,
  isLoading: boolean,
  selectedCareers: DropdownOption[]
) {
  const [graph, setGraph] = useState<GraphinData>({ nodes: [], edges: [] });

  const { nodeStatuses: graphStatuses } = useStatusActions();

  useEffect(() => {
    if (isLoading || !data) return;

    const nodesWithEdges = new Set<string>();

    const newGraph: GraphinData = {
      edges: data.edges!.map((edge) => {
        nodesWithEdges.add(edge.to);

        return {
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
        };
      }),

      //@ts-ignore
      nodes: data.nodes!.map((node) => {
        const icon = getNormalIcon(node.data, selectedCareers);
        let iconLen = icon.value!.replace(/\s/g, "").length;
        iconLen = iconLen == 0 ? 2 : iconLen > 2 ? iconLen * 0.54 : iconLen;
        const labelOffset = iconLen > 2 ? 10 * 0.52 * iconLen : 10;

        console.log(iconLen, labelOffset)

        return {
          id: node.id,
          label: node.data.name,
          data: node,
          status: {
            viewed: graphStatuses.viewed.includes(node.id),
            accesible:
              !nodesWithEdges.has(node.id) ||
              graphStatuses.accesible.includes(node.id),
          },

          style: {
            icon: icon,
            keyshape: {
              size: 22.5 * iconLen,
            },
            label: {
              value: node.data.name,
              fill: "white",
              offset: [0, labelOffset],
              fontSize: 12,
            },
            status: {
              start: {
                halo: {
                  visible: true,
                  fill: "blue",
                },
                icon: {
                  size: 16 * iconLen,
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
        };
      }),
    };

    setGraph(newGraph);
  }, [data, selectedCareers]);

  return { graph };
}

function carrerEmoji(carrer: string): string {
  switch (carrer) {
    case "carrer:quimica":
      return "🧪";
    case "carrer:sistemas":
      return "💾";
  }
  return "";
}

function getNormalIcon(
  subject: Subject,
  selectedCareers: DropdownOption[]
): NodeStyleIcon {
  let icon = "";

  if (subject.careers.length > 1) {
    icon = "🤝";
    for (let i = 0; i < subject.careers.length; i++) {
      if (i == 0) {
        icon += "\n\r" + carrerEmoji(subject.careers[i]) + " ";
        continue;
      }
      icon += carrerEmoji(subject.careers[i]) + " ";
    }
  } else {
    let career = selectedCareers.find(
      (option) => option.value === subject.careers[0]
    );
    if (career == undefined) {
      var c: DropdownOption = {
        value: subject.careers[0],
        label: subject.careers[0],
      };
      career = c;
    }

    if (career) {
      icon = carrerEmoji(career.value);
    }
  }

  return {
    size: 25,
    fill: "green",
    type: "text",
    fontFamily: "graphin",
    value: icon,
  };
}
