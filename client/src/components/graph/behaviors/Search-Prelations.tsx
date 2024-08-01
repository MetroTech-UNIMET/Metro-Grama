import { useEffect } from "react";

import { clearGraphStates } from "@utils/graph";
import {
  markEdgesAsFuture,
  markEdgesAsPrelation,
} from "@utils/states/EdgesStates";
import { useLazyGraphinContext } from "@/hooks/lazy-loading/use-LazyGraphin";

import type { INode } from "@antv/g6";
import type { IG6GraphEvent } from "@antv/graphin";

const statesToIgnore = ["viewed", "accesible"];

export default function SearchPrelations() {
  const graphinContext = useLazyGraphinContext();

  useEffect(() => {
    if (!graphinContext) return;
    const { graph } = graphinContext;

    function handleClick(e: IG6GraphEvent) {
      const node = e.item as INode;
      if (!node._cfg) return;

      clearGraphStates(graph, {
        statesToTrue: ["inactive"],
        statesToIgnore,
      });

      graph.setItemState(node, "selected", true);
      graph.setItemState(node, "inactive", false);

      selectEdges(node);
    }

    graph.on("node:click", handleClick);

    // FIXME - Que el si se mantiene el touch para el drag, no genere el handleClick
    graph.on("node:touchstart", handleClick);
    graph.on("canvas:touchstart", () => {
      clearGraphStates(graph, { statesToIgnore });
    });
    graph.on("canvas:click", () => {
      clearGraphStates(graph, { statesToIgnore });
    });

    return () => {
      graph.off("node:click", handleClick);
      graph.off("canvas:click", () => {
        clearGraphStates(graph), { statesToIgnore };
      });
      graph.off("node:touchstart", handleClick);
      graph.off("canvas:touchstart", () => {
        clearGraphStates(graph, { statesToIgnore });
      });
    };
  }, [graphinContext]);

  return null;
}

function selectEdges(node: INode) {
  const prelations = node.getInEdges();

  const future = node.getOutEdges();

  markEdgesAsFuture(future);
  markEdgesAsPrelation(prelations);
}
