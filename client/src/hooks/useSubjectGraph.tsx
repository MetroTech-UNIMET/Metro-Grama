import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Graphin, { GraphinData } from "@antv/graphin";
import iconLoader from "@antv/graphin-icons";
import type { NodeStyleIcon } from "@antv/graphin/lib/typings/type";

import type { Subject } from "@/interfaces/Subject";

import type { Option as DropdownOption } from "@ui/derived/multidropdown";
import { getEnrolledSubjects } from "@/api/interactions/enrollApi";

import "@antv/graphin-icons/dist/index.css";
import type { AxiosError } from "axios";
import { notRetryOnUnauthorized } from "@utils/queries";
import {
  NodeStatuses,
  useStatusActions,
} from "@components/graph/behaviors/StatusActions";

const icons = Graphin.registerFontFamily(iconLoader);

export default function useSubjectGraph(
  data: Graph<Subject> | undefined,
  selectedCareers: DropdownOption[]
) {
  const [graph, setGraph] = useState<GraphinData>({ nodes: [], edges: [] });

  const { nodeStatuses, setSubjectWithCredits } = useStatusActions();

  const { data: enrolledSubjects, error: errorEnrolledSubjects } = useQuery<
    string[],
    AxiosError
  >({
    queryKey: ["enrolledSubjects", "studentId"],
    queryFn: () => getEnrolledSubjects(),
    retry: notRetryOnUnauthorized,
  });

  useEffect(() => {
    if (data?.nodes.length === 0) {
      setGraph({ nodes: [], edges: [] });
      return;
    }

    const setEnrolledSubjects = getSetEnrolledSubjects(
      enrolledSubjects,
      errorEnrolledSubjects,
      nodeStatuses
    );

    if (!data || !setEnrolledSubjects) return;

    const nodesWithEdges = new Set<string>();
    const relations: Record<string, Set<string>> = {};

    const subjectWithCredits: Subject[] = [];

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
        const [labelOffset, iconLen] = getCustomIconProps(icon);

        const nodeSize = 22.5 * iconLen;

        const [isEnrolled, isAccesible] = getNodeStatus(
          node,
          setEnrolledSubjects,
          relations,
          nodeStatuses
        );

        if (node.data.credits + node.data.BPCredits > 0) {
          subjectWithCredits.push(node.data);
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
              fill: "white",
              stroke: "#5B8FF9",
              size: nodeSize,
            },
            label: {
              value: node.data.name,
              fill: "white",
              offset: [0, labelOffset],
              fontSize: 12,
            },
            status: {
              hover: {
                halo: {
                  animate: {
                    attrs: (ratio: number) => {
                      const startR = nodeSize - 15;
                      const diff = 6;

                      return {
                        r: startR + diff * ratio,
                        opacity: 0.5 + 0.5 * ratio,
                      };
                    },
                    duration: 200,
                    easing: "easeCubic",
                    delay: 0,
                    repeat: false,
                  },
                },
              },
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

    setSubjectWithCredits(subjectWithCredits);
    setGraph(newGraph);
  }, [data, selectedCareers, enrolledSubjects]);

  return { graph };
}

function getSetEnrolledSubjects(
  enrolledSubjects: string[] | undefined,
  errorEnrolledSubjects: AxiosError | null,
  nodeStatuses: NodeStatuses<Subject>
) {
  // If there is an error fetching the enrolled subjects,
  // we will use the viewed subjects from the context.
  if (errorEnrolledSubjects) {
    const enrrolledSubjects = new Set<string>(nodeStatuses.viewed.keys());

    return enrrolledSubjects;
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

/**
 * Returns the NodeStyleIcon for a given subject and selected careers.
 * @param subject - The subject object.
 * @param selectedCareers - The selected careers as DropdownOptions.
 * @returns The NodeStyleIcon object.
 */
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
    type: "text",
    fontFamily: "graphin",
    value: icon,
  };
}

/**
 * Calculates the custom icon properties based on the provided NodeStyleIcon.
 * @param icon - The NodeStyleIcon object.
 * @returns An array containing the label offset and icon length.
 */
function getCustomIconProps(icon: NodeStyleIcon) {
  let iconLen = icon.value!.replace(/\s/g, "").length;
  iconLen = iconLen == 0 ? 2 : iconLen > 2 ? iconLen * 0.54 : iconLen;
  const labelOffset = iconLen > 2 ? 10 * 0.52 * iconLen : 10;

  return [labelOffset, iconLen];
}

/**
 * Determines the status of a node in the subject graph.
 *
 * @param node - The node to determine the status for.
 * @param setEnrolledSubjects - A set of enrolled subjects.
 * @param relations - A record of subject relations.
 * @param nodeStatuses - Responsible from maintaining the node status across different career fetchers.
 * @returns An array containing two boolean values: [isEnrolled, isAccessible].
 */
function getNodeStatus(
  node: Node4j<Subject>,
  setEnrolledSubjects: Set<string>,
  relations: Record<string, Set<string>>,
  nodeStatuses: NodeStatuses<Subject>
) {
  if (nodeStatuses.viewed.has(node.id)) {
    return [true, false];
  } else if (nodeStatuses.accesible.has(node.id)) {
    return [false, true];
  }

  const isEnrolled = setEnrolledSubjects.has(node.id);
  if (isEnrolled) {
    return [true, false];
  }

  let isAccesible = false;
  for (let [subject, subjectRelations] of Object.entries(relations)) {
    if (subjectRelations.has(node.id)) {
      if (setEnrolledSubjects.has(subject)) {
        isAccesible = true;
      } else {
        isAccesible = false;
      }
      return [false, isAccesible];
    }
  }

  // Son los nodos iniciales (no tienen prelaciones)
  if (node.data.BPCredits === 0 && node.data.credits === 0) {
    //Necesitan un mínimo de créditos para ser vistos
    return [false, true];
  } else {
    return [false, false];
  }
}
