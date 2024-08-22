-- Step 1: Recreate the `student` table with the original structure
DEFINE TABLE student SCHEMAFULL;

DEFINE FIELD firstName ON student TYPE string;
DEFINE FIELD lastName ON student TYPE string;
DEFINE FIELD email ON student TYPE string ASSERT string::is::email($value);
DEFINE FIELD pictureUrl ON student TYPE string;
DEFINE FIELD password ON student TYPE string;
DEFINE FIELD verified ON student TYPE bool DEFAULT false;
DEFINE FIELD role ON student TYPE record<role> DEFAULT role:user;
DEFINE FIELD created ON student DEFAULT time::now() READONLY;
DEFINE INDEX studentEmailIndex ON TABLE student COLUMNS email UNIQUE;

-- Step 2: Migrate data back from `user` to `student`
INSERT INTO student SELECT * FROM user;

-- Step 3: Update any references back to the `student` table
DEFINE FIELD in ON enroll TYPE record<student>;
DEFINE TABLE course SCHEMAFULL;
-- REVIEW - There is no shcema yet

-- Step 5: Drop the `user` table
REMOVE TABLE user;