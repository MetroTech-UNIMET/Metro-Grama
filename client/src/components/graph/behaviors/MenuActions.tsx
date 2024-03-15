import { ContextMenuValue, GraphinContext, IG6GraphEvent } from "@antv/graphin";
import { useContext, useEffect, useRef, useState } from "react";
import { ContextMenu } from "@antv/graphin-components";
import { GraphinContextType } from "@antv/graphin";
import { INode, IEdge } from "@antv/g6";

import { ListContent, ListHeader, ListItem } from "../../ui/list";
import { markNodeAsViewed } from "@/lib/utils/states/NodeStates";
import { cn } from "@/lib/utils/className";


interface MenuNodeProps {
  node: INode | null;
  close: () => void;
}

function MenuNode({ node, close }: MenuNodeProps) {
  if (!node) return null;

  const subjectCode = node._cfg?.model?.data.Data.Code;
  const subjectName = node._cfg?.model?.data.Data.Name;

  return (
    <ListContent className="max-w-64">
      <ListHeader>
        {subjectCode} - {subjectName}
      </ListHeader>
      <ListItem
        onClick={() => {
          markNodeAsViewed(node);
          close()
        }}
      >
        {node?.hasState("viewed")
          ? "Desmarcar como materia vista"
          : "Marcar como materia vista"}
      </ListItem>
    </ListContent>
  );
}

// TODO - Mejor manejo de posición como si fuera un tooltip
// TODO - Bloquear el mover el grafo cuando el menu está abierto
export default function MenuActions() {
  const { graph }: GraphinContextType = useContext(GraphinContext);
  const [node, setNode] = useState<INode | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleOpenContextMenu(e: IG6GraphEvent) {
      e.preventDefault();
      const { item } = e;

      //   graph.set("contextmenu", {
      //   node: {
      //     visible: true,
      //     x: e.canvasX,
      //     y: e.canvasY,
      //     item,
      //   },
      // });

      setPosition({ x: e.canvasX, y: e.canvasY });
      setNode(item as INode);
    }

    graph.on("node:contextmenu", handleOpenContextMenu);
    graph.on("canvas:click", close);

    return () => {
      graph.off("node:contextmenu", handleOpenContextMenu);
      graph.off("canvas:click", close);
    };
  }, []);

  function close() {
    setNode(null);
    setPosition({ x: 0, y: 0 });
  }

  return (
    <div
      className={cn("absolute", !node && "hidden")}
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <MenuNode node={node} close={close} />
    </div>
  );
}
