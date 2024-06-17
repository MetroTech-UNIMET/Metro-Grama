import { GraphinContext, GraphinData } from "@antv/graphin";
import { useContext, useEffect } from "react";
import {
  newNodeState,
  nodeCustomState,
  useStatusActions,
} from "./StatusActions";
import { INode } from "@antv/g6-core";

interface Props {
  graphData: GraphinData;
}

export default function UpdateNodeStatusOnGraphChange({ graphData }: Props) {
  const { graph } = useContext(GraphinContext);

  const { changeNodeState } = useStatusActions();

  useEffect(() => {
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
  }, [graphData]);

  return null;
}
