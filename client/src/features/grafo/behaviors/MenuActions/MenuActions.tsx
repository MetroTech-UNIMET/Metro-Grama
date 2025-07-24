import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useEnrollmentMutations } from "./mutations/use-enrollment-mutations";
import { useStatusActions } from "../StatusActions";

import { useSubjectSheet } from "@/features/grafo/SubjectSheet";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useLazyGraphinContext } from "@/hooks/lazy-loading/use-LazyGraphin";

import { GoogleLink } from "@ui/link";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@ui/context-menu";
import { CardTitle } from "@ui/card";

import type { INode } from "@antv/g6";
import type { Subject } from "@/interfaces/Subject";
import type { IG6GraphEvent } from "@antv/graphin";
import type { Node4j } from "@/interfaces/Graph";
import { Spinner } from "@ui/spinner";

interface SubjectNode extends INode {
  _cfg: {
    model: {
      data: Node4j<Subject>;
    };
  };
}

interface MenuNodeProps {
  node: SubjectNode;
}

function MenuNode({ node }: MenuNodeProps) {
  const { selectSubject } = useSubjectSheet();
  const { nodeActions } = useStatusActions();
  const { user } = useAuth();
  const { enrollMutation, unenrollMutation } = useEnrollmentMutations();

  const subjectCode = node._cfg?.model?.data.data.code.ID;
  const subjectName = node._cfg?.model?.data.data.name;

  function markViewed(node: INode) {
    // TODO - Refactorizar logica de no cambiar el state a menos que haya sido exitoso
    const { nodes, enabled } = nodeActions.enableViewedNode(node);
    const viewedNodes = Array.from(nodes);

    if (user) {
      if (enabled) {
        enrollMutation.mutate(viewedNodes);
      } else {
        unenrollMutation.mutate(viewedNodes);
      }
    } else {
      toast(`Materias ${enabled ? "marcadas" : "desmarcadas"} exitosamente`, {
        description: "Si quiere que persista al volver a abrir, inicie sesión",
        action: <GoogleLink className="mt-2" />,
        className: "flex flex-col items-baseline space-x-0",
      });
    }
  }

  return (
    <ContextMenuContent className="max-w-64">
      <CardTitle className="px-2 py-1 text-sm font-semibold border-b border-muted">
        {subjectCode} - {subjectName}
      </CardTitle>
      <ContextMenuItem
        onClick={() => markViewed(node)}
        disabled={enrollMutation.isPending || unenrollMutation.isPending}
      >
        <Spinner
          size="small"
          show={enrollMutation.isPending || unenrollMutation.isPending}
        />

        {node?.hasState("viewed")
          ? "Desmarcar como materia vista"
          : "Marcar como materia vista"}
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => {
          const subject = (node._cfg?.model?.data as Node4j<Subject>).data;
          selectSubject(subject);
          // close();
        }}
      >
        Ver detalles
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

const longTouchDuration = 1000;

export function MenuActions() {
  const graphinContext = useLazyGraphinContext();

  const [node, setNode] = useState<SubjectNode | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!graphinContext) return;
    const { graph } = graphinContext;

    async function handleOpenContextMenu(e: IG6GraphEvent) {
      e.preventDefault();
      const { item } = e;

      if (!item) return;

      const x = e.canvasX;
      const y = e.canvasY;

      const contextMenuEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: x,
        clientY: y,
      });
      hiddenTriggerRef.current?.dispatchEvent(contextMenuEvent);

      setNode(item as SubjectNode);
    }

    function handleNodeTouchStart(e: IG6GraphEvent) {
      timerRef.current = setTimeout(() => {
        handleOpenContextMenu(e);
      }, longTouchDuration);
    }

    function handleNodeTouchMove(e: IG6GraphEvent) {
      clearTimerRef();
      handleNodeTouchStart(e);
    }

    function handleNodeTouchEnd(shouldClose = false) {
      clearTimerRef();
      if (shouldClose) close();
    }

    graph.on("node:contextmenu", handleOpenContextMenu);

    graph.on("node:touchstart", handleNodeTouchStart);
    graph.on("node:touchmove", handleNodeTouchMove);
    graph.on("node:touchend", handleNodeTouchEnd);

    graph.on("canvas:click", close);
    graph.on("canvas:drag", close);
    graph.on("canvas:touchstart", close);

    return () => {
      graph.off("node:contextmenu", handleOpenContextMenu);

      graph.off("node:touchstart", handleNodeTouchStart);
      graph.off("node:touchmove", handleNodeTouchMove);
      graph.off("node:touchend", handleNodeTouchEnd);

      graph.off("canvas:click", handleNodeTouchEnd);
      graph.off("canvas:drag", close);
      graph.off("canvas:touchstart", close);
    };
  }, [graphinContext]);

  function clearTimerRef() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function close() {
    setNode(null);
    clearTimerRef();
  }

  const hiddenTriggerRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <ContextMenuTrigger asChild>
        <div ref={hiddenTriggerRef} />
      </ContextMenuTrigger>

      {node && <MenuNode node={node} />}
    </>
  );
}
