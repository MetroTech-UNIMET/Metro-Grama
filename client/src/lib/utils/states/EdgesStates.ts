import { IEdge } from "@antv/g6";
import { getNodesFromEdges } from "../graph";

type edgeCustomState = "future" | "prelation" | "prelation-viewed";

export function markEdgesAsFuture(edges: IEdge[]) {
  highlightEdges(edges, "future");
  const nodes = getNodesFromEdges(edges, "target");

  nodes.forEach((node) => {
    const future = node.getOutEdges();
    node.setState("inactive", false);

    markEdgesAsFuture(future);
  });
}

export function markEdgesAsPrelation(edges: IEdge[], prelationViewed = false) {
  highlightEdges(edges, prelationViewed ? "prelation-viewed" : "prelation");
  const nodes = getNodesFromEdges(edges, "source");

  nodes.forEach((node) => {
    const prelations = node.getInEdges();
    node.setState("inactive", false);

    if (prelations.length === 0) {
      return;
    }

    if (node.hasState("accesible")) {
      node.setState("start", true);
      prelationViewed = true;
    }

    markEdgesAsPrelation(prelations, prelationViewed);
  });
}

function highlightEdges(edges: IEdge[], tag: edgeCustomState) {
  edges.forEach((edge) => highlightEdge(edge, tag));
}

function highlightEdge(edge: IEdge, tag: edgeCustomState) {
  edge.setState("inactive", false);
  edge.setState(tag, true);
}
