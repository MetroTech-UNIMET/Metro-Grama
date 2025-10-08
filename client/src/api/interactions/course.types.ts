import type { SubjectEntity } from '@/interfaces/Subject';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';
import type { SubjectSection } from '@/interfaces/SubjectSection';

export type SubjectSectionWithSubject = SubjectSection & { subject: SubjectEntity; subject_schedule: SubjectSchedule[] };
export interface GetCourseByTrimesterResponse {
  trimesterId: string;
  is_principal: boolean;
  sections: SubjectSectionWithSubject[];
}
