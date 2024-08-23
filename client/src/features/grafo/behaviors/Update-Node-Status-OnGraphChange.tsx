import { useEffect } from "react";
import {
  newNodeState,
  nodeCustomState,
  useStatusActions,
} from "./StatusActions";

import type { GraphinData } from "@antv/graphin";
import type { INode } from "@antv/g6-core";
import { useLazyGraphinContext } from "@/hooks/lazy-loading/use-LazyGraphin";

interface Props {
  graphData: GraphinData;
}

export default function UpdateNodeStatusOnGraphChange({ graphData }: Props) {
  const graphinContext = useLazyGraphinContext();
  const { changeNodeState } = useStatusActions();

  useEffect(() => {
    if (!graphinContext) return;

    const { graph } = graphinContext;

    const nodesState: {
      node: INode;
      newState: newNodeState;
    }[] = [];
    graph.getNodes().forEach((node) => {
      const states = node.getStates();

      if (states.length === 0) return;

      nodesState.push({
        node,
        newState: states.map((state) => ({
          state: state as nodeCustomState,
          value: true,
        })),
      });
    });

    changeNodeState(nodesState);
  }, [graphinContext, graphData]);

  return null;
}
