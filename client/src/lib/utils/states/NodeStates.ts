import { INode, IEdge } from "@antv/g6";
import { getNodesFromEdges } from "../graph";

export function markNodeAsViewed(node: INode) {
  if (node.hasState("viewed")) {
    node.setState("viewed", false);
    return;
  }

  node.setState("viewed", true);
  const inEdges = node.getInEdges();
  const outEdges = node.getOutEdges();

  const previousNodes = getNodesFromEdges(inEdges, "source");
  previousNodes.forEach((node) => {
    console.log(node._cfg?.model);
    node.setState("viewed", true);
  });

    checkAccesible(outEdges);
}

function checkAccesible(outEdges: IEdge[]) {
  const nodesToCheck = getNodesFromEdges(outEdges, "target");

  nodesToCheck.forEach((node) => {
    const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

    if (sourceNodes.every((node) => node.hasState("viewed"))) {
      node.setState("accesible", true);
    }
  });
}
