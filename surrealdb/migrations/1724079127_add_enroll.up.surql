-- Definir tabla de relacion estudiante -> materia
DEFINE TABLE enroll SCHEMAFULL;
DEFINE FIELD in ON enroll TYPE record<student>;
DEFINE FIELD out ON enroll TYPE record<subject>;
DEFINE FIELD trimester ON enroll TYPE number
DEFAULT 1;
DEFINE FIELD passed ON enroll TYPE bool
DEFAULT true;
DEFINE INDEX unique_relationships 
    ON TABLE enroll 
    COLUMNS in, out UNIQUE;
