DEFINE FIELD show_friends ON student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private' DEFAULT 'public';
DEFINE FIELD show_schedule ON student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private' DEFAULT 'public'; 
DEFINE FIELD show_subjects ON student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private' DEFAULT 'public' ;

REMOVE FIELD privacyPreferences.show_friends ON student_preferences;
REMOVE FIELD privacyPreferences.show_schedule ON student_preferences;
REMOVE FIELD privacyPreferences.show_subjects ON student_preferences;

REMOVE FIELD schedulePreferences ON student_preferences;

REMOVE FIELD schedulePreferences.default_order ON student_preferences;

REMOVE FIELD schedulePreferences.preferred_schedules ON student_preferences;

REMOVE FIELD schedulePreferences.prohibited_schedules ON student_preferences;

UPDATE student_preferences SET 
    show_friends = privacyPreferences.show_friends,
    show_schedule = privacyPreferences.show_schedule,
    show_subjects = privacyPreferences.show_subjects,
    schedulePreferences = NONE,
    privacyPreferences = NONE;
