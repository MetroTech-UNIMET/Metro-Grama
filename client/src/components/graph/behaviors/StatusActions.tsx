import { createContext, useContext, useState } from "react";
import { INode, IEdge } from "@antv/g6";
import { getNodesFromEdges } from "@/lib/utils/graph";

type nodeCustomState = "accesible" | "viewed";
type edgeCustomState = "future" | "prelation" | "prelation-viewed";

interface StatusActionsContextProps {
  nodeStatuses: NodeStatuses;
  edgeStatuses: EdgeStatuses;
  nodeActions: {
    enableViewedNode: (
      node: INode,
      firstNode?: boolean,
      viewedNodes?: Set<string>
    ) => {
      nodes: Set<string>;
      enabled: boolean;
    };
    disableViewedNode: (node: INode, outEdges: IEdge[]) => void;
  };
  edgeActions: {};
  graphActions: {};
}

const StatusActionsContext = createContext<StatusActionsContextProps | null>(
  null
);

export function useStatusActions() {
  const statusActionsContext = useContext(StatusActionsContext);
  if (!statusActionsContext) {
    throw new Error(
      "useStatusActions must be used within a StatusActionsProvider"
    );
  }

  return statusActionsContext;
}

type NodeStatuses = {
  [key in nodeCustomState]: string[];
};

type EdgeStatuses = {
  [key in edgeCustomState]: string[];
};

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

export function StatusActions({ children }: { children: React.ReactNode }) {
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatuses>({
    accesible: [],
    viewed: [],
  });

  const [edgeStatuses, setEdgeStatuses] = useState<EdgeStatuses>({
    future: [],
    prelation: [],
    "prelation-viewed": [],
  });

  function changeNodeState(
    node: INode,
    newState:
      | {
          state: nodeCustomState;
          value: boolean;
        }
      | {
          state: nodeCustomState;
          value: boolean;
        }[]
  ) {
    if (Array.isArray(newState)) {
      const newNodeStatuses: Record<string, string[]> = {};

      newState.forEach(({ state, value }) => {
        node.setState(state, value);
        newNodeStatuses[state] = value
          ? [...nodeStatuses[state], node.getID()]
          : nodeStatuses[state].filter((id) => id !== node.getID());
      });

      setNodeStatuses((prev) => ({
        ...prev,
        ...newNodeStatuses,
      }));

      return;
    }

    const { state, value } = newState;
    node.setState(state, value);

    const newNodeStatuses = {
      [state]: value
        ? [...nodeStatuses[state], node.getID()]
        : nodeStatuses[state].filter((id) => id !== node.getID()),
    };

    setNodeStatuses((prev) => ({
      ...prev,
      ...newNodeStatuses,
    }));
  }

  function enableViewedNode(
    node: INode,
    firstNode = true,
    viewedNodes: Set<string> = new Set()
  ) {
    const outEdges = node.getOutEdges();

    if (node.hasState("viewed")) {
      if (firstNode)
        return { nodes: disableViewedNode(node, outEdges), enabled: false };
    }

    const nodeId = node.getID();
    if (viewedNodes.has(nodeId)) {
      return { nodes: viewedNodes, enabled: true };
    }

    changeNodeState(node, [
      { state: "accesible", value: false },
      { state: "viewed", value: true },
    ]);

    viewedNodes.add(nodeId);

    const inEdges = node.getInEdges();

    const previousNodes = getNodesFromEdges(inEdges, "source");
    previousNodes.forEach(
      (node) =>
        !node.hasState("viewed") && enableViewedNode(node, false, viewedNodes)
    );

    checkAccesible(outEdges);
    return { nodes: viewedNodes, enabled: true };
  }

  // TODO - Esto rrecorre todo el grafo hacia abajo, parar si el nodo xxx
  function disableViewedNode(
    node: INode,
    outEdges: IEdge[],
    disabledNodes: Set<string> = new Set()
  ) {
    const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

    const shouldAccesible = sourceNodes.every((node) =>
      node.hasState("viewed")
    );
    const isViewed = node.hasState("viewed");
    const isAccesible = node.hasState("accesible");

    if (isAccesible && !isViewed) {
      changeNodeState(node, [
        { state: "accesible", value: false },
        { state: "viewed", value: false },
      ]);
      return disabledNodes;
    } else if (!node.hasState("viewed")) {
      return disabledNodes;
    }
    changeNodeState(node, [
      { state: "accesible", value: shouldAccesible },
      { state: "viewed", value: false },
    ]);
    disabledNodes.add(node.getID());

    const outNodes = getNodesFromEdges(outEdges, "target");

    outNodes.forEach((node) =>
      disableViewedNode(node, node.getOutEdges(), disabledNodes)
    );
    return disabledNodes;
  }

  function checkAccesible(outEdges: IEdge[]) {
    const nodesToCheck = getNodesFromEdges(outEdges, "target");

    nodesToCheck.forEach((node) => {
      const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

      if (
        sourceNodes.every((node) => node.hasState("viewed")) &&
        !node.hasState("viewed")
      ) {
        changeNodeState(node, { state: "accesible", value: true });
      }
    });
  }

  // function clearGraphStates(graph: IGraph, options: ClearStateOptions = {}) {
  //   clearEdgesStates(graph, options);
  //   clearNodesStates(graph, options);
  // }

  // function clearEdgesStates(graph: IGraph, options: ClearStateOptions) {
  //   throw new Error("Function not implemented.");
  // }

  // function clearNodesStates(graph: IGraph, options: ClearStateOptions) {
  //   throw new Error("Function not implemented.");
  // }

  return (
    <StatusActionsContext.Provider
      value={{
        nodeStatuses,
        edgeStatuses,
        nodeActions: {
          enableViewedNode,
          disableViewedNode,
        },
        edgeActions: {},
        graphActions: {},
      }}
    >
      {children}
    </StatusActionsContext.Provider>
  );
}
