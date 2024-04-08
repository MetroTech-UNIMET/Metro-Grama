import Graphin, { GraphinData } from "@antv/graphin";

import  iconLoader  from "@antv/graphin-icons";
import '@antv/graphin-icons/dist/index.css';

const {fontFamily , glyphs} = iconLoader();

const icons = Graphin.registerFontFamily(iconLoader);



export default function useSubectGraph(data: Graph<Subject>) {
  


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
        icon: {
          type: "font",
          fontFamily: fontFamily,
          // value: icons.compass,
          fill: "green",
          size: 20,
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
