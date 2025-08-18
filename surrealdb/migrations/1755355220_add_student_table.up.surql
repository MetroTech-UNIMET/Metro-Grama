BEGIN TRANSACTION;

DEFINE FIELD phone ON TABLE user TYPE string DEFAULT null;

DEFINE TABLE student SCHEMAFULL;
    DEFINE FIELD id_card on TABLE student TYPE string  
      ASSERT string::is::numeric($value) AND string::len($value) = 11;

    DEFINE FIELD user ON TABLE student TYPE record<user>;

    DEFINE INDEX unique_id_card ON student FIELDS id_card UNIQUE;
    DEFINE INDEX unique_user ON student FIELDS user UNIQUE;

DEFINE TABLE study SCHEMAFULL;
    DEFINE FIELD in ON study TYPE record<student>;
    DEFINE FIELD out ON study TYPE record<career>;
    DEFINE FIELD startingTrimester ON study TYPE record<trimester>;

    DEFINE INDEX unique_relationships ON study FIELDS in, out UNIQUE;

COMMIT TRANSACTION;