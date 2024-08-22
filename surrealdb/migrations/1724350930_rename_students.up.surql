-- Step 1: Create a new table named `user` with the same structure as `student`
DEFINE TABLE user SCHEMAFULL;

DEFINE FIELD firstName ON student TYPE string;
DEFINE FIELD lastName ON student TYPE string;
DEFINE FIELD email ON student TYPE string ASSERT string::is::email($value);
DEFINE FIELD pictureUrl ON student TYPE string;
DEFINE FIELD password ON student TYPE string;
DEFINE FIELD verified ON student TYPE bool DEFAULT false;
DEFINE FIELD role ON student TYPE record<role> DEFAULT role:user;
DEFINE FIELD created ON student DEFAULT time::now() READONLY;
DEFINE INDEX studentEmailIndex ON TABLE student COLUMNS email UNIQUE;

-- Step 2: Migrate data from `student` to `user`
INSERT INTO user SELECT * FROM student;

-- Step 4: Update any references to the old table name (this step is manual, update your application code if necessary)
DEFINE FIELD in ON enroll TYPE record<user>;
REMOVE TABLE course;

-- Step 5: Drop the old `student` table
REMOVE TABLE student;