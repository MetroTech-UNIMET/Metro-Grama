import type { Id } from '../surrealDb';

export type Visibility = 'public' | 'friendsFriends' | 'onlyFriends' | 'private';

export interface PreferencesVisibility {
  show_friends: Visibility;
  show_schedule: Visibility;
  show_subjects: Visibility;
}

export interface StudentPreferencesEntity extends PreferencesVisibility {
  id: Id<'student_preferences'>;
  student: Id<'students'>;
}
