import { INode, IEdge } from "@antv/g6";
import { getNodesFromEdges } from "../graph";

export function markNodeAsViewed(node: INode, firstNode = true) {
  const outEdges = node.getOutEdges();

  if (firstNode && node.hasState("viewed")) {
    disableViewedNode(node, outEdges);
    return;
  }

  node.setState("accesible", false);
  node.setState("viewed", true);

  const inEdges = node.getInEdges();

  const previousNodes = getNodesFromEdges(inEdges, "source");
  previousNodes.forEach((node) => markNodeAsViewed(node, false));

  checkAccesible(outEdges);
}

function disableViewedNode(node: INode, outEdges: IEdge[]) {
  node.setState("viewed", false);

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
      if (!node.hasState("viewed")) node.setState("accesible", true);
    }
  });
}
