import { ContextMenuValue, GraphinContext } from "@antv/graphin";
import { useContext, useEffect } from "react";
import { ContextMenu } from "@antv/graphin-components";
import { GraphinContextType } from "@antv/graphin";
import { INode, IEdge } from "@antv/g6";

import { ListContent, ListItem } from "../../ui/list";
import { markNodeAsViewed } from "@/lib/utils/graphStates";

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
      <ListItem
        onClick={() => {
          markNodeAsViewed(node.item as INode);
        }}
      >
        Marcar como materia vista
      </ListItem>
    </ListContent>
  );
}
