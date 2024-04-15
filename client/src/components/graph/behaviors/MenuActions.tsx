import { GraphinContext, IG6GraphEvent } from "@antv/graphin";
import { useContext, useEffect, useRef, useState } from "react";
import { GraphinContextType } from "@antv/graphin";
import { INode } from "@antv/g6";

import { ListContent, ListHeader, ListItem } from "../../ui/list";
import { enableViewedNode } from "@utils/states/NodeStates";
import { cn } from "@utils/className";
import { useSubjectSheet } from "@/components/SubjectSheet";
import { Subject } from "@/interfaces/Subject";

interface MenuNodeProps {
  node: INode | null;
  close: () => void;
}

function MenuNode({ node, close }: MenuNodeProps) {
  const { selectSubject } = useSubjectSheet();
  if (!node) return null;

  //@ts-ignore
  const subjectCode = node._cfg?.model?.data.data.code;
  //@ts-ignore
  const subjectName = node._cfg?.model?.data.data.name;

  return (
    <ListContent className="max-w-64">
      <ListHeader>
        {subjectCode} - {subjectName}
      </ListHeader>
      <ListItem
        onClick={() => {
          enableViewedNode(node);
          close();
        }}
      >
        {node?.hasState("viewed")
          ? "Desmarcar como materia vista"
          : "Marcar como materia vista"}
      </ListItem>
      <ListItem
        onClick={() => {
          const subject = (node._cfg?.model?.data as Node4j<Subject>).data;
          selectSubject(subject);
          close();
        }}
      >
        Ver detalles
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
      console.log("Touch start");

      timerRef.current = setTimeout(() => {
        handleOpenContextMenu(e);
      }, longTouchDuration);
    }

    function handleNodeTouchMove(e: IG6GraphEvent) {
      console.log("Touch move");
      clearTimerRef();
      handleNodeTouchStart(e);
    }

    function handleNodeTouchEnd() {
      console.log("Touch end");
      clearTimerRef();
      close()
    }

    graph.on("node:contextmenu", handleOpenContextMenu);

    graph.on("node:touchstart", handleNodeTouchStart);
    graph.on("node:touchmove", handleNodeTouchMove);
    graph.on("node:touchend", handleNodeTouchEnd);

    graph.on("canvas:click", close);
    graph.on("canvas:touchstart", handleNodeTouchEnd);

    return () => {
      graph.off("node:contextmenu", handleOpenContextMenu);

      graph.off("node:touchstart", handleNodeTouchStart);
      graph.off("node:touchmove", handleNodeTouchMove);
      graph.off("node:touchend", handleNodeTouchEnd);

      graph.off("canvas:click", close);
      graph.off("canvas:touchstart", handleNodeTouchEnd);
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
    clearTimerRef();
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
