import { useContext, useEffect, useRef, useState } from "react";
import {
  GraphinContext,
  IG6GraphEvent,
  GraphinContextType,
} from "@antv/graphin";
import { INode } from "@antv/g6";

import { ListContent, ListHeader, ListItem } from "@ui/list";
import { cn } from "@utils/className";
import { useSubjectSheet } from "@/components/SubjectSheet";
import { Subject } from "@/interfaces/Subject";
import { useStatusActions } from "./StatusActions";
import { enrollStudent, unenrollStudent } from "@/api/interactions/enrollApi";
import { toast } from "@ui/use-toast";
import { useAuth } from "@/contexts/AuthenticationContext";
import { GoogleLink } from "@ui/link";
import { useMutation } from "@tanstack/react-query";
import { ToastAction } from "@ui/toast";

interface MenuNodeProps {
  node: INode | null;
  close: () => void;
}

function MenuNode({ node, close }: MenuNodeProps) {
  const { selectSubject } = useSubjectSheet();
  const { nodeActions } = useStatusActions();
  const { student } = useAuth();

  const { graph } = useContext(GraphinContext);

  const enrollMutation = useMutation({
    mutationFn: (viewedNodes: string[]) => enrollStudent(viewedNodes),

    //@ts-ignore TODO - Agregar custom error
    onError: (error, viewedNodes) => {
      viewedNodes.reverse().forEach((id) => {
        const node = graph.findById(id) as INode;
        nodeActions.disableViewedNode(node, node.getOutEdges());
      });

      toast({
        title: "Error al marcar materia vista",
        description: "Intente de nuevo más tarde",
        variant: "destructive",
        action: (
          <ToastAction
            altText="Intente de nuevo"
            onClick={() => enrollMutation.mutateAsync(viewedNodes)}
          >
            Intente de nuevo
          </ToastAction>
        ),
      });
    },
    onSuccess: () => {
      toast({
        title: "Materias marcadas exitosamente",
        description: "Sus materias se guardaron en la base de datos",
        variant: "success",
      });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: (viewedNodes: string[]) => unenrollStudent(viewedNodes),

    //@ts-ignore TODO - Agregar custom error
    onError: (error, viewedNodes) => {
      viewedNodes.forEach((id) => {
        const node = graph.findById(id) as INode;
        nodeActions.enableViewedNode(node);
      });

      toast({
        title: "Error al desmarcar materia vista",
        description: "Intente de nuevo más tarde",
        variant: "destructive",
        action: (
          <ToastAction
            altText="Intente de nuevo"
            onClick={() => unenrollMutation.mutateAsync(viewedNodes)}
          >
            Intente de nuevo
          </ToastAction>
        ),
      });
    },
    onSuccess: () => {
      toast({
        title: "Materias desmarcadas exitosamente",
        description: "Sus materias se guardaron en la base de datos",
        variant: "success",
      });
    },
  });

  if (!node) return null;

  //@ts-ignore
  const subjectCode = node._cfg?.model?.data.data.code;
  //@ts-ignore
  const subjectName = node._cfg?.model?.data.data.name;

  async function markViewed(node: INode) {
    // TODO - Refactorizar logica de no cambiar el state a menos que haya sido exitoso
    const { nodes, enabled } = nodeActions.enableViewedNode(node);
    const viewedNodes = Array.from(nodes);

    if (student) {
      if (enabled) {
        await enrollMutation.mutateAsync(viewedNodes);
      } else {
        await unenrollMutation.mutateAsync(viewedNodes);
      }
    } else {
      toast({
        title: `Materias ${enabled ? "marcadas" : "desmarcadas"} exitosamente`,
        description: "Si quiere que persista al volver a abrir, inicie sesión",
        action: <GoogleLink className="mt-2" />,
        className: "flex flex-col items-baseline space-x-0",
      });
    }

    close();
  }

  return (
    <ListContent className="max-w-64">
      <ListHeader>
        {subjectCode} - {subjectName}
      </ListHeader>
      <ListItem onClick={() => markViewed(node)}>
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

// REVIEW - Considerar hacer focus en el nodo al abrir el menu
// TODO - Mejor manejo de posición como si fuera un tooltip
// TODO - Bloquear el mover el grafo cuando el menu está abierto
export default function MenuActions() {
  const { graph }: GraphinContextType = useContext(GraphinContext);
  const [node, setNode] = useState<INode | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function handleOpenContextMenu(e: IG6GraphEvent) {
      e.preventDefault();
      const { item } = e;

      if (!item) return;

      setPosition({ x: e.canvasX, y: e.canvasY });
      setNode(item as INode);
    }

    function handleNodeTouchStart(e: IG6GraphEvent) {
      globalBlur();

      timerRef.current = setTimeout(() => {
        handleOpenContextMenu(e);
      }, longTouchDuration);
    }

    function handleNodeTouchMove(e: IG6GraphEvent) {
      globalBlur();

      clearTimerRef();
      handleNodeTouchStart(e);
    }

    function handleNodeTouchEnd(shouldClose = false) {
      globalBlur();

      clearTimerRef();
      if (shouldClose) close();
    }

    function globalBlur() {
      (document.activeElement as HTMLElement)?.blur();
    }

    graph.on("node:contextmenu", handleOpenContextMenu);

    graph.on("node:touchstart", handleNodeTouchStart);
    graph.on("node:touchmove", handleNodeTouchMove);
    graph.on("node:touchend", handleNodeTouchEnd);

    graph.on("canvas:click", close);
    graph.on("canvas:drag", () => handleNodeTouchEnd(true));
    graph.on("canvas:touchstart", close);

    window.addEventListener("touchend", () => handleNodeTouchEnd(false));

    return () => {
      graph.off("node:contextmenu", handleOpenContextMenu);

      graph.off("node:touchstart", handleNodeTouchStart);
      graph.off("node:touchmove", handleNodeTouchMove);
      graph.off("node:touchend", handleNodeTouchEnd);

      graph.off("canvas:click", handleNodeTouchEnd);
      graph.off("canvas:drag", () => handleNodeTouchEnd(true));
      graph.off("canvas:touchstart", close);

      window.removeEventListener("touchend", () => handleNodeTouchEnd(false));
    };
  }, []);

  function clearTimerRef() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
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
