BEGIN TRANSACTION;

-----------------------------------------------
-- Definir esquema de materias
DEFINE TABLE subjects SCHEMALESS;
DEFINE FIELD name ON subjects TYPE string
    ASSERT string::len($value) > 3 && string::len($value) < 100;
DEFINE FIELD careers ON subjects TYPE array<string>
    ASSERT array::len($value) > 0;
DEFINE FIELD trimester ON subjects TYPE number
    ASSERT $value > 0 && $value < 20;
DEFINE FIELD precedesSubjects ON subjects TYPE array<record(subjects)>;
----------------------------------------------

-- Populate subjects
CREATE subjects:FBTMM01 SET name="Matemática básica", careers=["Ingeniería de sistemas"], trimester=1, precedesSubjects=[];

COMMIT TRANSACTION;