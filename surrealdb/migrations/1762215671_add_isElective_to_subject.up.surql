-- Add isElective field to subject with default false
DEFINE FIELD isElective ON TABLE subject TYPE bool DEFAULT false;

-- Optionally backfill existing records to ensure the field exists with default
UPDATE subject SET isElective = false;
