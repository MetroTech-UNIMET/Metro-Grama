DEFINE FIELD privacyPreferences.show_friends ON student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private' DEFAULT 'public';
DEFINE FIELD privacyPreferences.show_schedule ON student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private' DEFAULT 'public';
DEFINE FIELD privacyPreferences.show_subjects ON student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private' DEFAULT 'public';

DEFINE FIELD schedulePreferences ON student_preferences TYPE object DEFAULT {};
DEFINE FIELD schedulePreferences.default_order ON student_preferences TYPE 'alphabetical' | 'avg_difficulty' | 'avg_grade' | 'avg_workload' | 'prelations' |'differentFriends' DEFAULT 'alphabetical';
DEFINE FIELD schedulePreferences.preferred_schedules ON student_preferences TYPE array<object> FLEXIBLE DEFAULT [];
DEFINE FIELD schedulePreferences.prohibited_schedules ON student_preferences TYPE array<object> FLEXIBLE DEFAULT [];


REMOVE FIELD show_friends ON student_preferences;
REMOVE FIELD show_schedule ON student_preferences;
REMOVE FIELD show_subjects ON student_preferences;

UPDATE student_preferences SET privacyPreferences = {
  show_friends: show_friends,
  show_schedule: show_schedule,
  show_subjects: show_subjects
}, schedulePreferences = {
    default_order:  'alphabetical',
    preferred_schedules: [],
    prohibited_schedules: [],
},
show_friends = NONE,
show_schedule = NONE,
show_subjects = NONE;