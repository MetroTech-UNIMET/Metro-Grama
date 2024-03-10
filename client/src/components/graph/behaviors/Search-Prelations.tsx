import { GraphinContext, IG6GraphEvent } from "@antv/graphin";
import { useContext, useEffect } from "react";
import { INode, IEdge } from "@antv/g6";
import { clearGraphStates, getNodesFromEdges } from "@/lib/utils/graph";

type edgeCustomState = "future" | "prelation";

// TODO - Que con cualquier click se limpie el estado de los edges
// TODO - Diferentes colores en los edges si son prelation o future
export default function SearchPrelations() {
  const { graph } = useContext(GraphinContext);

  // TODO - Que funcione en touch de telefono
  useEffect(() => {
    function handleClick(e: IG6GraphEvent) {
      const node = e.item as INode;
      if (!node._cfg) return;

      clearGraphStates(graph, {
        statesToTrue: ["inactive"],
        statesToIgnore: ["viewed"],
      });

      graph.setItemState(node, "selected", true);
      graph.setItemState(node, "inactive", false);

      selectEdges(node);
    }

    graph.on("node:click", handleClick);
    graph.on("canvas:click", () => {
      clearGraphStates(graph, { statesToIgnore: ["viewed"] });
    });

    return () => {
      graph.off("node:click", handleClick);
      graph.off("canvas:click", () => {
        clearGraphStates(graph), { statesToIgnore: ["viewed"] };
      });
    };
  }, []);

  function selectEdges(node: INode) {
    const prelations = node.getInEdges();

    const future = node.getOutEdges();

    seePrelations(prelations);
    seeFuture(future);
  }

  function seeFuture(edges: IEdge[]) {
    highlightEdges(edges, "future");
    const nodes = getNodesFromEdges(edges, "target");

    nodes.forEach((node) => {
      const future = node.getOutEdges();
      graph.setItemState(node, "inactive", false);

      seeFuture(future);
    });
  }

  function seePrelations(edges: IEdge[]) {
    highlightEdges(edges, "prelation");
    const nodes = getNodesFromEdges(edges, "source");

    nodes.forEach((node) => {
      const prelations = node.getInEdges();
      graph.setItemState(node, "inactive", false);

      if (prelations.length == 0) {
        graph.setItemState(node, "start", true);
        return;
      }

      seePrelations(prelations);
    });
  }

  function highlightEdges(edges: IEdge[], tag: edgeCustomState) {
    edges.forEach((edge) => highlightEdge(edge, tag));
  }

  function highlightEdge(edge: IEdge, tag: edgeCustomState) {
    graph.setItemState(edge, "inactive", false);
    graph.setItemState(edge, tag, true);
  }

  return null;
}
