
DEFINE FIELD phone ON user TYPE option<string> ASSERT {
    IF $value = NULL { RETURN true; };
    IF string::matches($value, '^[+]?[0-9]{5,}[0-9]{7}$') { RETURN true; } ELSE { THROW 'The phone does not have the correct format: +XXXXX1234567'; };
};
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
