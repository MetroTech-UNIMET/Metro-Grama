-- Definir esquema de materias
DEFINE TABLE subject SCHEMAFULL;
DEFINE FIELD name ON subject TYPE string;
DEFINE INDEX subjectNameIndex ON TABLE subject COLUMNS name UNIQUE;
