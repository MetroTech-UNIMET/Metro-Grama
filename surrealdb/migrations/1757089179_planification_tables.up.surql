DEFINE TABLE course TYPE RELATION IN student OUT trimester SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD principal_sections ON course TYPE set<record<subject_section>, 7> ASSERT { IF ($value.subject_offer.out.all(|$t: record<trimester>| $t = out)) = false { THROW 'All the sections from principal_sections must belong to the same trimester of the schedule'; } ELSE { RETURN true; }; } PERMISSIONS FULL;
DEFINE FIELD secondary_sections ON course TYPE set<record<subject_section>, 7> DEFAULT [] ASSERT { IF ($value.subject_offer.out.all(|$t: record<trimester>| $t = out)) = false { THROW 'All the sections from secondary_sections must belong to the same trimester of the schedule'; } ELSE { RETURN true; }; } PERMISSIONS FULL;

DEFINE INDEX unique_relationships ON course FIELDS in, out UNIQUE;



DEFINE TABLE subject_offer TYPE RELATION IN subject OUT trimester SCHEMAFULL PERMISSIONS NONE;

DEFINE INDEX unique_relationships ON subject_offer FIELDS in, out UNIQUE;


DEFINE TABLE subject_schedule TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD day_of_week ON subject_schedule TYPE 0 | 1 | 2 | 3 | 4 | 5 | 6 PERMISSIONS FULL;
DEFINE FIELD ending_hour ON subject_schedule TYPE int ASSERT $value >= 0 AND $value <= 23 PERMISSIONS FULL;
DEFINE FIELD ending_minute ON subject_schedule TYPE int ASSERT $value >= 0 AND $value <= 59 PERMISSIONS FULL;
DEFINE FIELD starting_hour ON subject_schedule TYPE int ASSERT $value >= 0 AND $value <= 23 PERMISSIONS FULL;
DEFINE FIELD starting_minute ON subject_schedule TYPE int ASSERT $value >= 0 AND $value <= 59 PERMISSIONS FULL;
DEFINE FIELD subject_section ON subject_schedule TYPE record<subject_section> DEFAULT NULL PERMISSIONS FULL;


DEFINE TABLE subject_section TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD classroom_code ON subject_section TYPE option<string> PERMISSIONS FULL;
DEFINE FIELD section_number ON subject_section TYPE int ASSERT $value >= 1 AND $value <= 10 PERMISSIONS FULL;
DEFINE FIELD subject_offer ON subject_section TYPE record<subject_offer> PERMISSIONS FULL;

DEFINE FUNCTION fn::is_subject_enrollable($subjectId: record<subject>, $studentId: record<student>, $enrolled: set<record<subject>> ) -> bool | 'already_seen' {
  LET $subject = (SELECT * FROM ONLY $subjectId);
  LET $studentCredits = fn::get_student_credits($studentId, $enrolled);

  LET $has_credits = $subject.credits <= $studentCredits.total_credits OR $subject.BPCredits <= $studentCredits.total_bp_credits;
  
  LET $is_enrollable = (SELECT VALUE id INSIDE $enrolled 
    FROM (SELECT VALUE <-precede.in FROM ONLY $subjectId))
    .all(|$wasEnrolled: any| $wasEnrolled);
  
  RETURN IF $subjectId NOTINSIDE $enrolled
    { $is_enrollable AND $has_credits }
  ELSE
    { 'already_seen' };
};

DEFINE FUNCTION fn::get_student_credits($studentId: record<student>, $enrolled: set<record<subject>>) -> object {
  LET $results = (
    SELECT 
      math::sum(3) AS total_credits, 
      math::sum(IF string::starts_with(<string>out.id, 'BP') { 3 } ELSE { 0 }) AS total_bp_credits 
    FROM enroll 
    WHERE in = $studentId AND out IN $enrolled AND grade >= 10
    GROUP ALL
  );

  RETURN IF array::len($results) > 0 { array::first($results) } ELSE { { total_credits: 0, total_bp_credits: 0 } };
};