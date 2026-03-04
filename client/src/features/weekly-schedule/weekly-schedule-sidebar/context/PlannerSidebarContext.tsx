import { createContext, use, useMemo } from 'react';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';
import type { SubjectEvent } from '@/routes/_navLayout/horario';
import type { Event } from '../../weekly-planner/types';

export interface PlannerSidebarContextInput {
  onAddSubject: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => void;
  onRemoveSubject: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => void;
  getIsSubjectSelected: (subjectOffer: SubjectOfferWithSections) => boolean;
  getIsSectionSelected: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => boolean;
  getWouldCauseTripleOverlap: (sections: SubjectSchedule[]) => boolean;
  getAdjustedStudentsPlanningToEnroll: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => number;

  subjectEvents: Event<SubjectEvent>[];
}

export type Summary = {
  total: number;
  avg: number;
} | null;

export type PlannerSidebarSummary = {
  difficultySummary: Summary;
  workloadSummary: Summary;
  gradeSummary: Summary;
};

export type PlannerSidebarContextWithSummary = PlannerSidebarContextInput & {
  summary: PlannerSidebarSummary;
};

const PlannerSidebarContext = createContext<PlannerSidebarContextWithSummary | undefined>(undefined);

export function usePlannerSidebarContext(): PlannerSidebarContextWithSummary {
  const ctx = use(PlannerSidebarContext);
  if (!ctx) throw new Error('usePlannerSidebarContext must be used within PlannerSidebarProvider');
  return ctx;
}

export function PlannerSidebarProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PlannerSidebarContextInput;
}) {
  const summary: PlannerSidebarSummary = useMemo(() => {
    let totalDifficulty = 0;
    let totalWorkload = 0;
    let totalGrade = 0;

    const seenSubjectIds = new Set<string>();

    for (const ev of value.subjectEvents) {
      const subjectId = ev.data.id.ID;
      if (seenSubjectIds.has(subjectId) || !ev.data.avg_grade) continue;

      seenSubjectIds.add(subjectId);
      totalDifficulty += ev.data.avg_difficulty ?? 0;
      totalWorkload += ev.data.avg_workload ?? 0;
      totalGrade += ev.data.avg_grade ?? 0;
    }

    const subjectCount = seenSubjectIds.size;

    const toSummary = (total: number): Summary =>
      total !== 0
        ? {
            total,
            avg: subjectCount > 0 ? total / subjectCount : 0,
          }
        : null;

    return {
      difficultySummary: toSummary(totalDifficulty),
      workloadSummary: toSummary(totalWorkload),
      gradeSummary: toSummary(totalGrade),
    };
  }, [value.subjectEvents]);

  const contextValue = useMemo(
    () => ({
      ...value,
      summary,
    }),
    [value, summary],
  );

  return <PlannerSidebarContext.Provider value={contextValue}>{children}</PlannerSidebarContext.Provider>;
}
