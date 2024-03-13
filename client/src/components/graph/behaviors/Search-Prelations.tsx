import { GraphinContext, IG6GraphEvent } from "@antv/graphin";
import { useContext, useEffect } from "react";
import { INode } from "@antv/g6";
import { clearGraphStates } from "@/lib/utils/graph";
import {
  markEdgesAsFuture,
  markEdgesAsPrelation,
} from "@/lib/utils/states/EdgesStates";


export default function SearchPrelations() {
  const { graph } = useContext(GraphinContext);

  // TODO - Que funcione en touch de telefono
  useEffect(() => {
    function handleClick(e: IG6GraphEvent) {
      const node = e.item as INode;
      if (!node._cfg) return;

      clearGraphStates(graph, {
        statesToTrue: ["inactive"],
        statesToIgnore: ["viewed", "accesible"],
      });

      graph.setItemState(node, "selected", true);
      graph.setItemState(node, "inactive", false);

      selectEdges(node);
    }

    graph.on("node:click", handleClick);
    graph.on("canvas:click", () => {
      clearGraphStates(graph, { statesToIgnore: ["viewed", "accesible"] });
    });

    return () => {
      graph.off("node:click", handleClick);
      graph.off("canvas:click", () => {
        clearGraphStates(graph), { statesToIgnore: ["viewed", "accesible"] };
      });
    };
  }, []);

  function selectEdges(node: INode) {
    const prelations = node.getInEdges();

    const future = node.getOutEdges();

    markEdgesAsFuture(future);
    markEdgesAsPrelation(prelations);
  }

  return null;
}
