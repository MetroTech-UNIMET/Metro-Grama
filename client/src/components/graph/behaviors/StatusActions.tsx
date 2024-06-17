import { createContext, useContext, useState } from "react";
import { INode, IEdge } from "@antv/g6";
import { getNodesFromEdges } from "@/lib/utils/graph";
import { Subject } from "@/interfaces/Subject";

export type nodeCustomState = "accesible" | "viewed";
export type edgeCustomState = "future" | "prelation" | "prelation-viewed";

export type newNodeState =
  | {
      state: nodeCustomState;
      value: boolean;
    }
  | {
      state: nodeCustomState;
      value: boolean;
    }[];

interface StatusActionsContextProps<NodeStatusObject = Subject> {
  nodeStatuses: NodeStatuses<NodeStatusObject>;
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
  changeNodeState: (nodeState: NodeState | NodeState[]) => void;

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

type NodeStatuses<T> = {
  [key in nodeCustomState]: Map<string, T>;
};

interface NodeState {
  node: INode;
  newState: newNodeState;
}

export function StatusActions({ children }: { children: React.ReactNode }) {
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatuses<Subject>>({
    accesible: new Map(),
    viewed: new Map(),
  });

  function changeNodeState(nodeState: NodeState | NodeState[]) {
    const newNodeStatuses: Record<
      nodeCustomState,
      Map<string, Subject>
    > = nodeStatuses;

    if (Array.isArray(nodeState)) {
      nodeState.forEach((state) => {
        calculateNewState(state, newNodeStatuses);
      });
    } else {
      calculateNewState(nodeState, newNodeStatuses);
    }

    setNodeStatuses(newNodeStatuses);
  }

  function enableViewedNode(node: INode) {
    const outEdges = node.getOutEdges();

    if (node.hasState("viewed")) {
      return { nodes: disableViewedNode(node, outEdges), enabled: false };
    }
    const viewedNodes = new Set<string>().add(node.getID());

    changeNodeState({ node, newState: { state: "viewed", value: true } });

    enableChildrenNodes(node, viewedNodes);
    checkAccesible(outEdges);

    return {
      nodes: viewedNodes,
      enabled: true,
    };
  }

  function enableChildrenNodes(currentNode: INode, viewedNodes: Set<string>) {
    const inEdges = currentNode.getInEdges();

    const previousNodes = getNodesFromEdges(inEdges, "source");
    previousNodes.forEach((node) => {
      if (node.hasState("viewed")) return;

      changeNodeState({ node, newState: { state: "viewed", value: true } });
      viewedNodes.add(node.getID());

      enableChildrenNodes(node, viewedNodes);

      const outEdges = node.getOutEdges();
      checkAccesible(outEdges);
    });
  }

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
      changeNodeState({
        node,
        newState: [
          { state: "accesible", value: false },
          { state: "viewed", value: false },
        ],
      });
      return disabledNodes;
    } else if (!node.hasState("viewed")) {
      return disabledNodes;
    }

    changeNodeState({
      node,
      newState: [
        { state: "accesible", value: shouldAccesible },
        { state: "viewed", value: false },
      ],
    });
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
      // REVIEW - En un futuro comparar cual forma es más rápida
      const isViewed = node.hasState("viewed");
      // nodeStatuses.viewed.has(node.getID());
      if (isViewed) return;

      const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

      const sourceNodesViewed = sourceNodes.every((node) =>
        node.hasState("viewed")
      );

      if (!sourceNodesViewed) return;

      changeNodeState({
        node,
        newState: { state: "accesible", value: true },
      });

      checkAccesible(node.getOutEdges());
    });
  }

  return (
    <StatusActionsContext.Provider
      value={{
        nodeStatuses,
        nodeActions: {
          enableViewedNode,
          disableViewedNode,
        },
        changeNodeState,

        edgeActions: {},
        graphActions: {},
      }}
    >
      {children}
    </StatusActionsContext.Provider>
  );
}

function calculateNewState(
  { node, newState }: NodeState,
  newNodeStatuses: Record<nodeCustomState, Map<string, Subject>>
) {
  const subject = (node.getModel().data as Node4j<Subject>).data;
  const nodeId = node.getID();

  if (Array.isArray(newState)) {
    newState.forEach(({ state, value }) => {
      setNewNodeState(node, nodeId, subject, { state, value }, newNodeStatuses);
    });

    return;
  }

  setNewNodeState(node, nodeId, subject, newState, newNodeStatuses);

  return newNodeStatuses;
}

function setNewNodeState(
  node: INode,
  nodeId: string,
  data: Subject,
  {
    state,
    value,
  }: {
    state: nodeCustomState;
    value: boolean;
  },
  nodeStatuses: Record<nodeCustomState, Map<string, Subject>>
) {
  node.setState(state, value);

  if (value) {
    nodeStatuses[state].set(nodeId, data);
  } else {
    nodeStatuses[state].delete(nodeId);
  }
}
