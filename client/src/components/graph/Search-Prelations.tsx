import { GraphinContext, IG6GraphEvent } from "@antv/graphin";
import { useContext, useEffect } from "react";
import { INode, IEdge } from "@antv/g6";
import { getNodesFromEdges } from "@/utils/graph";

// TODO - Que con cualquier click se limpie el estado de los edges
// TODO - Diferentes colores en los edges si son prelation o future
export default function SearchPrelations() {
  const { graph } = useContext(GraphinContext);

  // TODO - Que funcione en touch de telefono
  useEffect(() => {
    function handleClick(e: IG6GraphEvent) {
      const node = e.item as INode; //Usar INode de G6
      if (!node._cfg) return;

      clearEdgesState();
      console.log(node)
      selectEdges(node.getEdges(), node.getID());
    }

    graph.on("node:click", handleClick);

    return () => {
      graph.off("node:click", handleClick);
    };
  }, []);

  function selectEdges(edges: IEdge[], nodeId: string) {
    const prelations = edges.filter((edge) => {
      return (edge._cfg?.source as INode).getID() !== nodeId;
    });

    const future = edges.filter((edge) => {
      return (edge._cfg?.source as INode).getID() === nodeId;
    });

    seePrelations(prelations);
    seeFuture(future);
  }

  function seeFuture(edges: IEdge[]) {
    highlightEdges(edges, "future");
    const nodes = getNodesFromEdges(edges, "target");

    nodes.forEach((node) => {
      console.log("future", node);
      const future = node.getEdges().filter((edge) => {
        console.log(edge.getStateStyle("active"))
        return (edge._cfg?.target as INode).getID() !== node.getID();
      });

      seeFuture(future);
    });
  }

  function seePrelations(edges: IEdge[]) {
    highlightEdges(edges, "prelation");
    const nodes = getNodesFromEdges(edges, "source");

    nodes.forEach((node) => {
      const prelations = node.getEdges().filter((edge) => {
        return (edge._cfg?.source as INode).getID() !== node.getID();
      });
      if (prelations.length == 0) return;

      seePrelations(prelations);
    });
  }

  function highlightEdges(edges: IEdge[], tag: "future" | "prelation") {
    edges.forEach((edge) => highlightEdge(edge, tag));
  }

  function highlightEdge(edge: IEdge, tag: "future" | "prelation") {
    graph.setItemState(edge, tag, true);
  }

  function clearEdgesState() {
    // REVIEW Analizar si se puede usar graph.findAllByState
    const states = ["future", "prelation"];

    graph.getEdges().forEach((edge) => {
      states.forEach((state) => {
        if (edge.hasState(state)) {
          graph.setItemState(edge, state, false);
        }
      });
    });
  }

  return null;
}
