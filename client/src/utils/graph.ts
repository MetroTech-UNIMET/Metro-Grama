import { INode, IEdge, IGraph } from "@antv/g6";

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

/**
 * Filters an array of edges based on the node type and node ID.
 *
 * @param {IEdge[]} edges - The array of edges to filter.
 * @param {nodeType} nodeType - The type of the node ("source" or "target") to consider when filtering.
 * @param {string} nodeId - The ID of the node to exclude from the result.
 * @param {(edge: IEdge) => void} [sideEffect] - An optional function that is called for each edge.
 * @returns {IEdge[]} The filtered array of edges.
 */
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

/**
 * Clears all states from all nodes and edges in the graph.
 *
 * @param {IGraph} graph - The graph from which to clear states.
 */
export function clearGraphStates(graph: IGraph) {
  clearEdgesStates(graph);
  clearNodesStates(graph);
}

/**
 * Clears all states from all edges in the graph.
 *
 * @param {IGraph} graph - The graph from which to clear edge states.
 */
export function clearEdgesStates(graph: IGraph) {
  graph.getEdges().forEach((edge) => {
    graph.clearItemStates(edge);
  });
}

/**
 * Clears all states from all nodes in the graph.
 *
 * @param {IGraph} graph - The graph from which to clear node states.
 */
export function clearNodesStates(graph: IGraph) {
  graph.getNodes().forEach((node) => {
    graph.clearItemStates(node);
  });
}
