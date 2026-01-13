import { createContext, useContext, useState } from 'react';
import { getNodesFromEdges } from '@/lib/utils/graph';

import type { INode, IEdge } from '@antv/g6';
import type { Subject, SubjectNoCareers } from '@/interfaces/Subject';
import type { Node4j } from '@/interfaces/Graph';

export type nodeCustomState = 'accesible' | 'viewed';
export type edgeCustomState = 'future' | 'prelation' | 'prelation-viewed';

export type newNodeState =
  | {
      state: nodeCustomState;
      value: boolean;
    }
  | {
      state: nodeCustomState;
      value: boolean;
    }[];

interface StatusActionsContextProps<NodeStatusObject extends Subject | SubjectNoCareers = Subject | SubjectNoCareers> {
  nodeStatuses: NodeStatuses<NodeStatusObject>;
  nodeActions: {
    enableViewedNode: (
      node: INode,
      firstNode?: boolean,
      viewedNodes?: Set<string>,
    ) => {
      nodes: Set<string>;
      enabled: boolean;
    };
    disableViewedNode: (node: INode, outEdges: IEdge[]) => void;
  };
  changeNodeState: (nodeState: NodeState | NodeState[]) => void;

  subjectWithCredits: NodeStatusObject[];
  setSubjectWithCredits: React.Dispatch<React.SetStateAction<NodeStatusObject[]>>;

  edgeActions: {};
  graphActions: {};
}

// Use a generic-safe context type; consumers should access via the generic hook below
const StatusActionsContext = createContext<StatusActionsContextProps<any> | null>(null);

export function useStatusActions<NodeStatusObject extends Subject | SubjectNoCareers = Subject | SubjectNoCareers>() {
  const statusActionsContext = useContext(StatusActionsContext) as StatusActionsContextProps<NodeStatusObject> | null;
  if (!statusActionsContext) {
    throw new Error('useStatusActions must be used within a StatusActionsProvider');
  }

  return statusActionsContext;
}

export type NodeStatuses<T> = {
  [key in nodeCustomState]: Map<string, T>;
};

interface NodeState {
  node: INode;
  newState: newNodeState;
}

export function StatusActions<NodeStatusObject extends Subject | SubjectNoCareers = Subject | SubjectNoCareers>({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatuses<NodeStatusObject>>({
    accesible: new Map(),
    viewed: new Map(),
  });
  const [subjectWithCredits, setSubjectWithCredits] = useState<NodeStatusObject[]>([]);

  function changeNodeState(nodeState: NodeState | NodeState[]) {
    const newNodeStatuses: Record<nodeCustomState, Map<string, NodeStatusObject>> = nodeStatuses;

    if (Array.isArray(nodeState)) {
      nodeState.forEach((state) => {
        calculateNewState(state, newNodeStatuses);
      });
    } else {
      calculateNewState(nodeState, newNodeStatuses);
    }

    setNodeStatuses({
      accesible: new Map(newNodeStatuses.accesible),
      viewed: new Map(newNodeStatuses.viewed),
    });
  }

  function enableViewedNode(node: INode) {
    const outEdges = node.getOutEdges();

    if (node.hasState('viewed')) {
      return { nodes: disableViewedNode(node, outEdges), enabled: false };
    }
    const viewedNodes = new Set<string>().add(node.getID());

    changeNodeState({ node, newState: { state: 'viewed', value: true } });

    enableChildrenNodes(node, viewedNodes);

    const nodesToCheck = getNodesFromEdges(outEdges, 'target');
    nodesToCheck.forEach((node) => checkAccesible(node));

    return {
      nodes: viewedNodes,
      enabled: true,
    };
  }

  function enableChildrenNodes(currentNode: INode, viewedNodes: Set<string>) {
    const inEdges = currentNode.getInEdges();

    const previousNodes = getNodesFromEdges(inEdges, 'source');
    previousNodes.forEach((node) => {
      if (node.hasState('viewed')) return;

      changeNodeState({ node, newState: { state: 'viewed', value: true } });
      viewedNodes.add(node.getID());

      enableChildrenNodes(node, viewedNodes);

      const outEdges = node.getOutEdges();
      const nodesToCheck = getNodesFromEdges(outEdges, 'target');
      nodesToCheck.forEach((node) => checkAccesible(node));
    });
  }

  function disableViewedNode(node: INode, outEdges: IEdge[], disabledNodes: Set<string> = new Set()) {
    const sourceNodes = getNodesFromEdges(node.getInEdges(), 'source');

    const shouldAccesible = sourceNodes.every((node) => node.hasState('viewed'));

    const isViewed = node.hasState('viewed');
    const isAccesible = node.hasState('accesible');

    if (isAccesible && !isViewed) {
      changeNodeState({
        node,
        newState: [
          { state: 'accesible', value: false },
          { state: 'viewed', value: false },
        ],
      });
      return disabledNodes;
    } else if (!node.hasState('viewed')) {
      return disabledNodes;
    }

    changeNodeState({
      node,
      newState: [
        { state: 'accesible', value: shouldAccesible },
        { state: 'viewed', value: false },
      ],
    });
    disabledNodes.add(node.getID());

    const outNodes = getNodesFromEdges(outEdges, 'target');

    outNodes.forEach((node) => disableViewedNode(node, node.getOutEdges(), disabledNodes));
    return disabledNodes;
  }

  function checkAccesible(nodeToCheck: INode) {
    // REVIEW - En un futuro comparar cual forma es más rápida
    const isViewed = nodeToCheck.hasState('viewed');
    // nodeStatuses.viewed.has(node.getID());
    if (isViewed) return;

    const sourceNodes = getNodesFromEdges(nodeToCheck.getInEdges(), 'source');

    const sourceNodesViewed = sourceNodes.every((node) => node.hasState('viewed'));

    if (!sourceNodesViewed) return;

    changeNodeState({
      node: nodeToCheck,
      newState: { state: 'accesible', value: true },
    });

    // REVIEW - Antes se llamaba recursivamente, pero ahora creo que es innecesario
    // const outEdges = nodeToCheck.getOutEdges();
    // const nodesToCheck = getNodesFromEdges(outEdges, "target");
    // nodesToCheck.forEach((node) => checkAccesible(node));
  }

  const value = {
    nodeStatuses,
    nodeActions: {
      enableViewedNode,
      disableViewedNode,
    },
    changeNodeState,

    subjectWithCredits,
    setSubjectWithCredits,

    edgeActions: {},
    graphActions: {},
  } as StatusActionsContextProps<NodeStatusObject>;

  return <StatusActionsContext.Provider value={value}>{children}</StatusActionsContext.Provider>;
}

function calculateNewState<NodeStatusObject extends Subject | SubjectNoCareers = Subject | SubjectNoCareers>(
  { node, newState }: NodeState,
  newNodeStatuses: Record<nodeCustomState, Map<string, NodeStatusObject>>,
) {
  const subject = (node.getModel().data as Node4j<NodeStatusObject>).data;
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

function setNewNodeState<NodeStatusObject extends Subject | SubjectNoCareers = Subject | SubjectNoCareers>(
  node: INode,
  nodeId: string,
  data: NodeStatusObject,
  {
    state,
    value,
  }: {
    state: nodeCustomState;
    value: boolean;
  },
  nodeStatuses: Record<nodeCustomState, Map<string, NodeStatusObject>>,
) {
  node.setState(state, value);

  if (value) {
    nodeStatuses[state].set(nodeId, data);
  } else {
    nodeStatuses[state].delete(nodeId);
  }
}
