import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import Graphin, { GraphinData } from "@antv/graphin";
import iconLoader from "@antv/graphin-icons";
import { NodeStyleIcon } from "@antv/graphin/lib/typings/type";

import { Subject } from "@/interfaces/Subject";

import { Option as DropdownOption } from "@ui/derived/multidropdown";
import { getEnrolledSubjects } from "@/api/interactions/enrollApi";

import "@antv/graphin-icons/dist/index.css";
import { AxiosError } from "axios";

const icons = Graphin.registerFontFamily(iconLoader);

export default function useSubjectGraph(
  data: Graph<Subject> | undefined,
  selectedCareers: DropdownOption[]
) {
  const {
    data: enrolledSubjects,
    error: errorEnrolledSubjects,
  } = useQuery<string[], AxiosError>({
    queryKey: ["enrolledSubjects", "studentId"],
    queryFn: () => getEnrolledSubjects(),
  });

  const [graph, setGraph] = useState<GraphinData>({ nodes: [], edges: [] });

  useEffect(() => {
    if (data?.nodes.length === 0) {
      setGraph({ nodes: [], edges: [] });
      return;
    }

    const setEnrolledSubjects = getSetEnrolledSubjects(
      enrolledSubjects,
      errorEnrolledSubjects
    );

    if (!data || !setEnrolledSubjects) return;

    const nodesWithEdges = new Set<string>();
    const relations: Record<string, Set<string>> = {};

    const newGraph: GraphinData = {
      edges: data.edges!.map((edge) => {
        nodesWithEdges.add(edge.to);

        if (!relations[edge.from]) {
          relations[edge.from] = new Set();
        }
        relations[edge.from].add(edge.to);

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

        const isEnrolled = setEnrolledSubjects.has(node.id);

        let isAccesible = false;
        if (!isEnrolled) {
          Object.entries(relations).forEach(([subject, subjectRelations]) => {
            if (subjectRelations.has(node.id)) {
              if (setEnrolledSubjects.has(subject)) {
                isAccesible = true;
              } else {
                isAccesible = false;
                return;
              }
            }
          });
        }

        return {
          id: node.id,
          label: node.data.name,
          data: node,
          status: {
            viewed: isEnrolled,
            accesible: isAccesible,
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
  }, [data, selectedCareers, enrolledSubjects]);

  return { graph };
}

function getSetEnrolledSubjects(
  enrolledSubjects: string[] | undefined,
  errorEnrolledSubjects: AxiosError | null
) {
  if (errorEnrolledSubjects) {
    return new Set<string>();
  }

  return new Set<string>(enrolledSubjects ?? []);
}
function careerEmoji(career: string): string {
  switch (career) {
    case "career:quimica":
      return "🧪";
    case "career:sistemas":
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
        icon += "\n\r" + careerEmoji(subject.careers[i]) + " ";
        continue;
      }
      icon += careerEmoji(subject.careers[i]) + " ";
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
      icon = careerEmoji(career.value);
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
