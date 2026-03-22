import type { Id } from '../surrealDb';
import type { DatabaseSchedule } from '../common/time';

export type Visibility = 'public' | 'friendsFriends' | 'onlyFriends' | 'private';

export enum OrderBySubjectOffers {
  Alphabetical = 'alphabetical',
  Difficulty = 'avg_difficulty',
  Grade = 'avg_grade',
  Workload = 'avg_workload',
  Prelations = 'prelations',
  Friends = 'differentFriends',
}



export interface SchedulePreferences {
  default_order: OrderBySubjectOffers;
  preferred_schedules: DatabaseSchedule[];
  prohibited_schedules: DatabaseSchedule[];
}

export interface PrivacyPreferences {
  show_friends: Visibility;
  show_schedule: Visibility;
  show_subjects: Visibility;
}

export interface StudentPreferencesEntity {
  id: Id<'student_preferences'>;
  student: Id<'students'>;

  privacyPreferences: PrivacyPreferences;
  schedulePreferences: SchedulePreferences;
}
