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
DEFINE FIELD precedes_subjects ON subjects TYPE array<record(subjects)>;
----------------------------------------------

-- Populate subjects
CREATE subjects:FBTMM01 SET name="Matemática básica", careers=["INGENIERÍA DE SISTEMAS"], trimester=1, precedes_subjects=[];

COMMIT TRANSACTION;