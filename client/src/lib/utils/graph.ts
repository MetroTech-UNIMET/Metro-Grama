import { INode, IEdge, IGraph } from "@antv/g6";

export type nodeType = "source" | "target";

interface ClearStateOptions {
  /**
   * An array of states to be set to true.
   */
  statesToTrue?: string[];
  /**
   * An array of states to be ignored (not cleared).
   */
  statesToIgnore?: string[];
}

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
 * Clears all states from all nodes and edges in the graph unless options is set.
 *
 * @param {IGraph} graph - The graph from which to clear states.
 * @param options - An object containing options for clearing states.
 */
export function clearGraphStates(
  graph: IGraph,
  options: ClearStateOptions = {}
) {
  clearEdgesStates(graph, options);
  clearNodesStates(graph, options);
}

/**
 * Clears all states from all edges in the graph.
 *
 * @param {IGraph} graph - The graph from which to clear edge states.
 * @param {string[]} statesToTrue - An array of states to be set to true.
 * @param {string[]} statesToIgnore - An array of states to be ignored (not cleared).
 */
export function clearEdgesStates(
  graph: IGraph,
  options: ClearStateOptions = {}
) {
  graph.getEdges().forEach((edge) => {
    clearItemStates(edge, options);
  });
}

/**
 * Clears all states from all nodes in the graph.
 *
 * @param {IGraph} graph - The graph from which to clear node states.
 * @param options - An object containing options for clearing states.
 */
export function clearNodesStates(
  graph: IGraph,
  options: ClearStateOptions = {}
) {
  graph.getNodes().forEach((node) => {
    clearItemStates(node, options);
  });
}

/**
 * Clears the state of a given item in the graph, with exceptions.
 *
 * @param {INode | IEdge} item - The item (node or edge) whose state is to be cleared.
 * @param options - An object containing options for clearing states.
 */
function clearItemStates(item: INode | IEdge, options: ClearStateOptions = {}) {
  const { statesToTrue = [], statesToIgnore = [] } = options;
  const statesToClear = item.getStates();

  statesToClear.forEach((state) => {
    if (!statesToIgnore.includes(state)) {
      item.clearStates(state);
    }
  });

  if (statesToTrue.length > 0) {
    statesToTrue.forEach((state) => {
      item.setState(state, true);
    });
  }
}
