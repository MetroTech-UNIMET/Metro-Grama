import { ContextMenuValue, GraphinContext } from "@antv/graphin";
import { useContext, useEffect } from "react";
import { ContextMenu } from "@antv/graphin-components";
import { GraphinContextType } from "@antv/graphin";
import { INode, IEdge } from "@antv/g6";

import { ListContent, ListItem } from "../../ui/list";
import { getNodesFromEdges } from "@/lib/utils/graph";

export default function MenuActions() {
  return (
    <ContextMenu
      bindType="node"
      style={{
        background: " ",
        width: " ",
      }}
    >
      <MenuNode />
    </ContextMenu>
  );
}

function MenuNode() {
  // @ts-ignore Error de typeo de la librería de Graphini
  const {
    contextmenu: { node },
    graph,
  }: GraphinContextType & {
    contextmenu: { node: ContextMenuValue };
  } = useContext(GraphinContext);
  const hola = useContext(GraphinContext);
  console.log(hola);

  function markAsViewed() {
    const nodeItem = node.item as INode;
    if (!nodeItem) return;

    graph.setItemState(nodeItem, "viewed", true);
    checkAccesible(nodeItem);

    console.log("Marcar como vista", node);
  }

  function checkAccesible(nodeViewed: INode) {
    const nodesToCheck = getNodesFromEdges(nodeViewed.getOutEdges(), "target");

    console.log(nodesToCheck, nodeViewed.getOutEdges())
    // debugger;
    nodesToCheck.forEach((node) => {
      const sourceNodes = getNodesFromEdges(node.getInEdges(), "source");

      if (sourceNodes.every((node) => node.hasState("viewed"))) {
        graph.setItemState(node, "accesible", true); 
      }
    });
  }

  return (
    // <DropdownMenuContent>
    //   <DropdownMenuLabel>My Account</DropdownMenuLabel>
    //   <DropdownMenuSeparator />
    //   <DropdownMenuItem>Profile</DropdownMenuItem>
    //   <DropdownMenuItem>Billing</DropdownMenuItem>
    //   <DropdownMenuItem>Team</DropdownMenuItem>
    //   <DropdownMenuItem>Subscription</DropdownMenuItem>
    // </DropdownMenuContent>
    <ListContent>
      <ListItem onClick={markAsViewed}>Marcar como materia vista</ListItem>
    </ListContent>
  );
}
