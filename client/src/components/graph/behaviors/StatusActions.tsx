import { createContext, useContext, useState } from "react";
import { INode, IEdge } from "@antv/g6";
import { getNodesFromEdges } from "@/lib/utils/graph";

type nodeCustomState = "accesible" | "viewed";
type edgeCustomState = "future" | "prelation" | "prelation-viewed";

interface StatusActionsContextProps {
  nodeStatuses: NodeStatuses;
  nodeActions: {
    enableViewedNode: (node: INode, firstNode?: boolean) => void;
  };
}

const StatusActionsContext = createContext<StatusActionsContextProps>({
  nodeStatuses: {
    accesible: [],
    viewed: [],
  },
  nodeActions: {
    enableViewedNode: () => {},
  },
});

export function useStatusActions() {
  return useContext(StatusActionsContext);
}

type NodeStatuses = {
  [key in nodeCustomState]: string[];
};

type EdgeStatus = {
  [key in edgeCustomState]: string[];
};

export function StatusActions({ children }: { children: React.ReactNode }) {
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatuses>({
    accesible: [],
    viewed: [],
  });

  function enableViewedNode(node: INode, firstNode = true) {
    const outEdges = node.getOutEdges();

    if (firstNode && node.hasState("viewed")) {
      disableViewedNode(node, outEdges);
      return;
    }

    node.setState("accesible", false);
    node.setState("viewed", true);
    setNodeStatuses((prev) => ({
      ...prev,
      viewed: [...prev.viewed, node.getID()],
      accesible: prev.accesible.filter((id) => id !== node.getID()),
    }));

    const inEdges = node.getInEdges();

    const previousNodes = getNodesFromEdges(inEdges, "source");
    previousNodes.forEach((node) => enableViewedNode(node, false));

    checkAccesible(outEdges);
  }

  function disableViewedNode(node: INode, outEdges: IEdge[]) {
    node.setState("viewed", false);
    setNodeStatuses((prev) => ({
      ...prev,
      viewed: prev.viewed.filter((id) => id !== node.getID()),
    }));

    const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

    const isAccesible = sourceNodes.every((node) => node.hasState("viewed"));

    node.setState("accesible", isAccesible);

    const outNodes = getNodesFromEdges(outEdges, "target");

    outNodes.forEach((node) => disableViewedNode(node, node.getOutEdges()));
  }

  function checkAccesible(outEdges: IEdge[]) {
    const nodesToCheck = getNodesFromEdges(outEdges, "target");

    nodesToCheck.forEach((node) => {
      const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

      if (sourceNodes.every((node) => node.hasState("viewed"))) {
        if (!node.hasState("viewed")) {
          node.setState("accesible", true);
          setNodeStatuses((prev) => ({
            ...prev,
            accesible: [...prev.accesible, node.getID()],
          }));
        }
      }
    });
  }

  return (
    <StatusActionsContext.Provider
      value={{
        nodeStatuses: nodeStatuses,
        nodeActions: {
          enableViewedNode,
        },
      }}
    >
      {children}
    </StatusActionsContext.Provider>
  );
}
