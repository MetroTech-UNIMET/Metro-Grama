DEFINE TABLE student_preferences SCHEMAFULL;

DEFINE FIELD student ON TABLE student_preferences TYPE record<student>
    ASSERT $value != NONE;

DEFINE FIELD show_friends ON TABLE student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private'
    DEFAULT 'public';

DEFINE FIELD show_schedule ON TABLE student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private'
    DEFAULT 'public';

DEFINE FIELD show_subjects ON TABLE student_preferences TYPE 'public' | 'friendsFriends' | 'onlyFriends' | 'private'
    DEFAULT 'public';

DEFINE INDEX unique_student_preferences ON TABLE student_preferences COLUMNS student UNIQUE;
