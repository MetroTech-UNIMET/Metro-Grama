import { useEffect, useMemo } from "react";

import { useStatusActions } from "@/features/grafo/behaviors/StatusActions";

import type { Subject } from "@/interfaces/Subject";
import type { IGraph, INode } from "@antv/g6";

export default function useCountCredits(graph: IGraph) {
  const { nodeStatuses, subjectWithCredits, changeNodeState } =
    useStatusActions();

  const [credits, BPCredits] = useMemo(() => {
    let credits = 0;
    let BPCredits = 0;

    nodeStatuses.viewed.forEach((subject) => {
      credits += 3;

      if (getSubjectType(subject) === "BP") {
        BPCredits += 4;
      }
    });

    return [credits, BPCredits];
  }, [nodeStatuses.viewed]);

  // TODO - Hacer un toast que desbloquearon materias por créditos si mínimo una materia se desbloquea
  useEffect(() => {
    subjectWithCredits.forEach((subject) => {
      const needCredits = subject.credits !== 0;
      const needBPCredits = subject.BPCredits !== 0;

      const hasEnoughBP = BPCredits >= subject.BPCredits;
      const hasEnoughCredits = credits >= subject.credits;

      if (
        (!needCredits && hasEnoughBP) ||
        (!needBPCredits && hasEnoughCredits) ||
        (needCredits && needBPCredits && (hasEnoughBP || hasEnoughCredits))
      ) {
        const node = graph.findById(`subject:${subject.code}`) as INode;
        changeNodeState({
          node,
          newState: { state: "accesible", value: true },
        });

        return;
      }

      const hasLessCredits = subject.credits > 0 && credits < subject.credits;
      const hasLessBPCredits =
        subject.BPCredits > 0 && BPCredits < subject.BPCredits;

      const nodeId = `subject:${subject.code}`;
      if (
        nodeStatuses.accesible.has(nodeId) &&
        (hasLessCredits || hasLessBPCredits)
      ) {
        const node = graph.findById(nodeId) as INode;

        changeNodeState({
          node,
          newState: { state: "accesible", value: false },
        });
      }
    });
  }, [credits, subjectWithCredits]);

  return {
    credits,
    BPCredits,
  };
}

function getSubjectType(subject: Subject) {
  return subject.code.ID.slice(0, 2);
}
