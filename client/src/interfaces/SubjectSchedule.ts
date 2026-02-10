import type { Id } from './surrealDb';

export interface SubjectSchedule {
  id: Id;

  starting_hour: number;
  starting_minute: number;

  ending_hour: number;
  ending_minute: number;

  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Represents days of the week from Sunday (0) to Saturday (6)

  subject_section: Id;
}
