import { INode, IEdge } from "@antv/g6";

/**
 * @param edges The edges to get the nodes from
 * @param nodeType The direction of the edge to get the nodes from
 * @returns The nodes from the edges
 */
export function getNodesFromEdges(
  edges: IEdge[],
  nodeType: "source" | "target"
) {
  const nodes = edges.map((edge) => {
    return edge._cfg?.[nodeType] as INode;
  });

  return nodes;
}
