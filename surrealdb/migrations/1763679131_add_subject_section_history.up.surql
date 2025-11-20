DEFINE TABLE OVERWRITE subject_section_history SCHEMAFULL;

DEFINE FIELD OVERWRITE subject_section ON subject_section_history TYPE record<subject_section>;
DEFINE FIELD OVERWRITE user_id            ON subject_section_history TYPE record<user>;
DEFINE FIELD OVERWRITE new_data           ON subject_section_history FLEXIBLE TYPE object;
DEFINE FIELD OVERWRITE start_date         ON subject_section_history TYPE option<datetime>;
DEFINE FIELD OVERWRITE end_date           ON subject_section_history TYPE option<datetime>;
DEFINE FIELD OVERWRITE schedules          ON subject_section_history TYPE array<record<subject_schedule>> DEFAULT [];

DEFINE EVENT OVERWRITE subject_section_audit ON TABLE subject_section
    WHEN $event = "CREATE" OR $event = "UPDATE"
    THEN {
        IF $event = "UPDATE" {
            UPDATE subject_section_history
                SET end_date = time::now()
                WHERE subject_section = $after.id AND end_date = NONE;
        };

        CREATE subject_section_history CONTENT {
            subject_section: $after.id,
            user_id: $input.updated_by,       -- Assumes you pass an updated_by field in your UPDATE/CREATE
            new_data: $after,
            start_date: time::now(),
            end_date: NONE
        };
    };
