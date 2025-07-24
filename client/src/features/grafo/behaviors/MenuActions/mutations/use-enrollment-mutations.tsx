import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useStatusActions } from "@/features/grafo/behaviors/StatusActions";
import { enrollStudent, unenrollStudent } from "@/api/interactions/enrollApi";

import type { INode } from "@antv/g6";
import { useLazyGraphinContext } from "@/hooks/lazy-loading/use-LazyGraphin";

export function useEnrollmentMutations() {
  const { nodeActions } = useStatusActions();
  const graphinContext = useLazyGraphinContext();

  const enrollMutation = useMutation({
    mutationFn: (viewedNodes: string[]) => enrollStudent(viewedNodes),

    onError: (_, viewedNodes) => {
      viewedNodes.reverse().forEach((id) => {
        if (!graphinContext) return;
        const { graph } = graphinContext;

        const node = graph.findById(id) as INode;
        nodeActions.disableViewedNode(node, node.getOutEdges());
      });

      toast.error("Error al marcar materia vista", {
        description: "Intente de nuevo más tarde",
        action: {
          label: "Intente de nuevo",
          onClick: () => enrollMutation.mutateAsync(viewedNodes),
        },
      });
    },
    onSuccess: () => {
      toast.success("Materias marcadas exitosamente", {
        description: "Sus materias se guardaron en la base de datos",
      });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: (viewedNodes: string[]) => unenrollStudent(viewedNodes),

    onError: (_, viewedNodes) => {
      viewedNodes.forEach((id) => {
        if (!graphinContext) return;
        const { graph } = graphinContext;

        const node = graph.findById(id) as INode;
        nodeActions.enableViewedNode(node);
      });

      toast.error("Error al desmarcar materia vista", {
        description: "Intente de nuevo más tarde",
        action: {
          label: "Intente de nuevo",
          onClick: () => unenrollMutation.mutateAsync(viewedNodes),
        },
      });
    },
    onSuccess: () => {
      toast("Materias desmarcadas exitosamente", {
        description: "Sus materias se guardaron en la base de datos",
      });
    },
  });

  return { enrollMutation, unenrollMutation };
}
