import { GraphinContext, IG6GraphEvent } from "@antv/graphin";
import { useContext, useEffect, useRef, useState } from "react";
import { GraphinContextType } from "@antv/graphin";
import { INode } from "@antv/g6";

import { ListContent, ListHeader, ListItem } from "../../ui/list";
import { markNodeAsViewed } from "@/lib/utils/states/NodeStates";
import { cn } from "@/lib/utils/className";

interface MenuNodeProps {
  node: INode | null;
  close: () => void;
}

function MenuNode({ node, close }: MenuNodeProps) {
  if (!node) return null;

  //@ts-ignore
  const subjectCode = node._cfg?.model?.data.Data.Code;
  //@ts-ignore
  const subjectName = node._cfg?.model?.data.Data.Name;

  return (
    <ListContent className="max-w-64">
      <ListHeader>
        {subjectCode} - {subjectName}
      </ListHeader>
      <ListItem
        onClick={() => {
          markNodeAsViewed(node);
          close();
        }}
      >
        {node?.hasState("viewed")
          ? "Desmarcar como materia vista"
          : "Marcar como materia vista"}
      </ListItem>
    </ListContent>
  );
}

const longTouchDuration = 1000;
// TODO - Mejor manejo de posición como si fuera un tooltip
// TODO - Bloquear el mover el grafo cuando el menu está abierto
export default function MenuActions() {
  const { graph }: GraphinContextType = useContext(GraphinContext);
  const [node, setNode] = useState<INode | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleOpenContextMenu(e: IG6GraphEvent) {
      e.preventDefault();
      const { item } = e;

      setPosition({ x: e.canvasX, y: e.canvasY });
      setNode(item as INode);
    }

    function handleNodeTouchStart(e: IG6GraphEvent) {
      timerRef.current = setTimeout(() => {
        // FIXME - No funciona si está en silencio, tiene que haber otra manera
        window.navigator.vibrate(200);
        handleOpenContextMenu(e);
      }, longTouchDuration);
    }

    function handleNodeTouchMove(e: IG6GraphEvent) {
      clearTimerRef();
      handleNodeTouchStart(e);
    }

    graph.on("node:contextmenu", handleOpenContextMenu);

    graph.on("node:touchstart", handleNodeTouchStart);
    // FIXME - Touch move not firing
    graph.on("node:touchmove", handleNodeTouchMove);
    // FIXME - Touch end not firing
    graph.on("node:touchend", clearTimerRef);

    graph.on("canvas:click", close);
    graph.on("canvas:touchstart", close);

    return () => {
      graph.off("node:contextmenu", handleOpenContextMenu);

      graph.off("node:touchstart", handleNodeTouchStart);
      graph.off("node:touchend", clearTimerRef);
      graph.off("node:touchmove", handleNodeTouchMove);

      graph.off("canvas:click", close);
      graph.off("canvas:touchstart", close);
    };
  }, []);

  function clearTimerRef() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      console.log(timerRef.current);
    }
  }

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
