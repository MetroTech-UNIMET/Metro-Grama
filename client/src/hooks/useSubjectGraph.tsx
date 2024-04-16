import Graphin, { GraphinData } from "@antv/graphin";
import iconLoader from "@antv/graphin-icons";
import { NodeStyleIcon } from "@antv/graphin/lib/typings/type";

import { useEffect, useState } from "react";
import { Subject } from "@/interfaces/Subject";
import { Option as DropdownOption } from "@ui/multidropdown";

import "@antv/graphin-icons/dist/index.css";

const icons = Graphin.registerFontFamily(iconLoader);

export default function useSubjectGraph(
  data: Graph<Subject> | undefined,
  isLoading: boolean,
  selectedCareers: DropdownOption[]
) {
  const [graph, setGraph] = useState<GraphinData>({ nodes: [], edges: [] });

  useEffect(() => {
    if (isLoading || !data) return;

    const newGraph: GraphinData = {
      //@ts-ignore
      nodes: data.nodes!.map((node, index) => {
        let icon = getNormalIcon(node.data, selectedCareers)
        let iconLen = icon.value!.replace(" ", "").replace("\n", "").length
        iconLen = iconLen == 0 ? 2 : iconLen > 2 ? iconLen * 0.54 : iconLen
        let labelOffset = iconLen > 2 ? 20 * 0.52 * iconLen : 20 

        return {id: node.id,
        label: node.data.name,
        data: node,
        status: {
          normal: true,
        },

        style: {
          label: {
            value: node.data.name,
            fill: "white",
            offset: [0,labelOffset],
            // fontSize: 12
          },
          status: {
            normal: {
              icon: icon,
              keyshape: {
                size: 22.5 * iconLen,
              },
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
                size: 20,
                fill: "blue",
                stroke: "blue",
              },
            },
          },
        },
      }}),
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

function carrerEmoji(carrer: string): string {
  switch (carrer) {
    case "carrer:quimica":
      return "🧪";
    case "carrer:sistemas":
      return "💾";
  }
  return ""
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
        icon += "\n\r" + carrerEmoji(subject.careers[i]) + " "
        continue
      }
      icon += carrerEmoji(subject.careers[i]) + " "
    }
  } else {
    let career = selectedCareers.find(
      (option) => option.value === subject.careers[0]
    );
    if (career == undefined) {
      var c: DropdownOption = {
        value: subject.careers[0],
        label: subject.careers[0],
      }
      career = c
    }

    if (career) {
      icon = carrerEmoji(career.value)
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
