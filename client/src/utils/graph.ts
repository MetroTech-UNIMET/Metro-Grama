import { INode, IEdge } from "@antv/g6";

export type nodeType = "source" | "target";

/**
 * @param edges The edges to get the nodes from
 * @param nodeType The direction of the edge to get the nodes from
 * @returns The nodes from the edges
 */
export function getNodesFromEdges(edges: IEdge[], nodeType: nodeType) {
  const nodes = edges.map((edge) => {
    return edge._cfg?.[nodeType] as INode;
  });

  return nodes;
}

export function filterEdgesByTarget(
  edges: IEdge[],
  nodeType: nodeType,
  nodeId: string,
  sideEffect?: (edge: IEdge) => void
) {
  return edges.filter((edge) => {
    if (sideEffect) sideEffect(edge);
    return (edge._cfg?.[nodeType] as INode).getID() !== nodeId;
  });
}
