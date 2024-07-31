import type { Subject } from "@/interfaces/Subject";
import type { Option as DropdownOption } from "@ui/derived/multidropdown";

import { getNormalIcon, getCustomIconProps } from "./functions";

import Graphin from "@antv/graphin";
import iconLoader from "@antv/graphin-icons";

import "@antv/graphin-icons/dist/index.css";

const icons = Graphin.registerFontFamily(iconLoader);

export const edgeStyle = {
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
}

export function getNodeStyle(node: Node4j<Subject>, selectedCareers: DropdownOption[]) {
  const icon = getNormalIcon(node.data, selectedCareers);
        const [labelOffset, iconLen] = getCustomIconProps(icon);

        const nodeSize = 22.5 * iconLen;

  return  {
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
  }
}