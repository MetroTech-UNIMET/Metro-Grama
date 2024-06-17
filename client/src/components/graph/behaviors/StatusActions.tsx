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
  changeNodeState: (node: INode, newState: newNodeState) => void;
  changeNodesState: (
    nodesState: {
      node: INode;
      newState: newNodeState;
    }[]
  ) => void;

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
  [key in nodeCustomState]: T[];
};

type NodeStatusesExperiment<T> = {
  [key in nodeCustomState]: Map<string, T>;
};

//@ts-ignore
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
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatuses<Subject>>({
    accesible: [],
    viewed: [],
  });

  const [experimentStatus, setExperimentStatus] = useState<
    NodeStatusesExperiment<Subject>
  >({
    accesible: new Map(),
    viewed: new Map(),
  });

  function changeNodeState(node: INode, newState: newNodeState) {
    const subject = (node.getModel().data as Node4j<Subject>).data;

    if (Array.isArray(newState)) {
      const newNodeStatuses: Record<string, Subject[]> = {};

      newState.forEach(({ state, value }) => {
        node.setState(state, value);
        newNodeStatuses[state] = value
          ? [...nodeStatuses[state], subject]
          : nodeStatuses[state].filter((n) => n.code !== subject.code);
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
        ? [...nodeStatuses[state], subject]
        : nodeStatuses[state].filter((n) => n.code !== subject.code),
    };

    setNodeStatuses((prev) => ({
      ...prev,
      ...newNodeStatuses,
    }));
  }

  function changeNodesState(
    nodesState: {
      node: INode;
      newState: newNodeState;
    }[]
  ) {
    const newNodeStatuses: Record<
      nodeCustomState,
      Map<string, Subject>
    > = experimentStatus;

    nodesState.forEach(({ node, newState }) => {
      const subject = (node.getModel().data as Node4j<Subject>).data;
      const nodeId = node.getID();

      if (Array.isArray(newState)) {
        newState.forEach(({ state, value }) => {
          node.setState(state, value);

          if (value) {
            newNodeStatuses[state].set(nodeId, subject);
          } else {
            newNodeStatuses[state].delete(nodeId);
          }
        });

        return;
      }

      const { state, value } = newState;
      node.setState(state, value);

      if (value) {
        newNodeStatuses[state].set(nodeId, subject);
      } else {
        newNodeStatuses[state].delete(nodeId);
      }
    });

    setExperimentStatus(newNodeStatuses);
  }

  function enableViewedNode(node: INode) {
    if (node.hasState("viewed")) {
      return { nodes: disableViewedNode(node, outEdges), enabled: false };
    }

    const nodesState: {
      node: INode;
      newState: newNodeState;
    }[] = [
      {
        node,
        newState: [
          { state: "accesible", value: false },
          { state: "viewed", value: true },
        ],
      },
    ];

    // REVIEW - Nodos repetidos
    nodesState.push(...enableChildrenNodes(node));

    changeNodesState(nodesState);
    console.log("Debug", nodesState);

    return {
      nodes: new Set(nodesState.map((n) => n.node.getID())),
      enabled: true,
    };
  }

  function enableChildrenNodes(
    currentNode: INode,
    nodesState: {
      node: INode;
      newState: newNodeState;
    }[] = []
  ) {
    const inEdges = currentNode.getInEdges();
    
    const previousNodes = getNodesFromEdges(inEdges, "source");
    previousNodes.forEach((node) => {
      if (node.hasState("viewed")) return;
      
      const outEdges = node.getOutEdges();
      nodesState.push({
        node,
        newState: [
          { state: "accesible", value: false },
          { state: "viewed", value: true },
        ],
      });

      if (node.getID() === "subject:FBTMM01") {
        // debugger;
      }

      enableChildrenNodes(node, nodesState);
      nodesState.push(...checkAccesible2(outEdges, nodesState));
    });

    return nodesState;
  }

  function disableViewedNode2(
    node: INode,
    outEdges: IEdge[],
    nodesState: {
      node: INode;
      newState: newNodeState;
    }[]
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

  function checkAccesible2(
    outEdges: IEdge[],
    nodesState: {
      node: INode;
      newState: newNodeState;
    }[]
  ) {
    const nodesToCheck = getNodesFromEdges(outEdges, "target");

    nodesToCheck.forEach((node) => {
      const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

      // const sourceNodesViewed = sourceNodes.every((node) =>
      //   node.hasState("viewed")
      // );

      // FIXME - Race condition, en vez de pedir nodesState, pedir un objeto parecido a experimentStatus en los parametros.
      const sourceNodesViewed = sourceNodes.every((node) =>
        // experimentStatus.viewed.has(node.getID())
        nodesState.some(
          (n) =>
            n.node.getID() === node.getID() &&
            n.newState.some((s) => s.state === "viewed" && s.value)
        )
      );
      const isViewed = node.hasState("viewed");

      if (sourceNodesViewed && !isViewed) {
        nodesState.push({
          node,
          newState: [{ state: "accesible", value: true }],
        });
        checkAccesible2(node.getOutEdges(), nodesState);
      }
    });

    return nodesState;
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
        changeNodesState,

        edgeActions: {},
        graphActions: {},
      }}
    >
      {children}
    </StatusActionsContext.Provider>
  );
}
