-- Definir tabla de relacion careeras -> materias 
DEFINE TABLE belong SCHEMAFULL;
DEFINE FIELD in ON belong TYPE record<subject>;
DEFINE FIELD out ON belong TYPE record<career>;
DEFINE FIELD trimester ON belong TYPE number;
DEFINE INDEX unique_relationships 
    ON TABLE belong 
    COLUMNS in, out UNIQUE;
