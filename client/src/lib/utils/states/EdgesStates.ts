import { IEdge } from "@antv/g6";
import { getNodesFromEdges } from "../graph";

type edgeCustomState = "future" | "prelation";

export function markEdgesAsFuture(edges: IEdge[]) {
  highlightEdges(edges, "future");
  const nodes = getNodesFromEdges(edges, "target");

  nodes.forEach((node) => {
    const future = node.getOutEdges();
    node.setState("inactive", false);

    markEdgesAsFuture(future);
  });
}

export function markEdgesAsPrelation(edges: IEdge[]) {
  highlightEdges(edges, "prelation");
  const nodes = getNodesFromEdges(edges, "source");

  nodes.forEach((node) => {
    const prelations = node.getInEdges();
    node.setState("inactive", false);

    if (prelations.length == 0) {
      node.setState("start", true);
      return;
    }

    markEdgesAsPrelation(prelations);
  });
}

function highlightEdges(edges: IEdge[], tag: edgeCustomState) {
  edges.forEach((edge) => highlightEdge(edge, tag));
}

function highlightEdge(edge: IEdge, tag: edgeCustomState) {
  edge.setState("inactive", false);
  edge.setState(tag, true);
}
