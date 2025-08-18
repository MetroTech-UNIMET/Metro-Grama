BEGIN TRANSACTION;

-- Drop study index and table
REMOVE INDEX unique_relationships ON TABLE study;
REMOVE TABLE study;

-- Drop student indexes and table
REMOVE INDEX unique_id_card ON TABLE student;
REMOVE INDEX unique_user ON TABLE student;
REMOVE TABLE student;

-- Remove added field from user table
REMOVE FIELD phone ON TABLE user;

COMMIT TRANSACTION;