import { createContext, use } from 'react';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';

export interface PlannerSidebarContextValue {
  onAddSubject: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => void;
  onRemoveSubject: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => void;
  getIsSubjectSelected: (subjectOffer: SubjectOfferWithSections) => boolean;
  getIsSectionSelected: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => boolean;
  getWouldCauseTripleOverlap: (sections: SubjectSchedule[]) => boolean;
  getAdjustedStudentsPlanningToEnroll: (subjectOffer: SubjectOfferWithSections, sectionIndex: number) => number;
}

const PlannerSidebarContext = createContext<PlannerSidebarContextValue | undefined>(undefined);

export function usePlannerSidebarContext(): PlannerSidebarContextValue {
  const ctx = use(PlannerSidebarContext);
  if (!ctx) throw new Error('usePlannerSidebarContext must be used within PlannerSidebarProvider');
  return ctx;
}

export function PlannerSidebarProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PlannerSidebarContextValue;
}) {
  return <PlannerSidebarContext.Provider value={value}>{children}</PlannerSidebarContext.Provider>;
}
