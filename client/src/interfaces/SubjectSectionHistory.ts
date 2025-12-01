import type { Id } from './surrealDb';
import type { SubjectSection } from './SubjectSection';
import type { SubjectSchedule } from './SubjectSchedule';

export interface SubjectSectionHistory {
  id: Id<'subject_section_history'>;

  schedules: Id<'subject_section'>[];
  subject_section: Id<'subject_section'>;
  user_id: Id<'user'>;

  start_date: string;
  end_date: string | null;

  new_data: SubjectSection;
}

export interface SubjectSectionHistoryWithSchedules extends Omit<SubjectSectionHistory, 'schedules'> {
  schedules: SubjectSchedule[];
}
