import type { Id } from './surrealDb';
import type { SubjectSchedule } from './SubjectSchedule';

export interface SubjectSection {
  id: Id;

  classroom_code: string | null;
  section_number: number;

  subject_offer: Id;
}

export interface SubjectSectionWithSchedules extends SubjectSection {
  schedules: SubjectSchedule[];
}
