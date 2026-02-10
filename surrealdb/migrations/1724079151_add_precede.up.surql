-- Definir tabla de relacion materias -> materias 
DEFINE TABLE precede SCHEMAFULL;
DEFINE FIELD in ON precede TYPE record<subject>;
DEFINE FIELD out ON precede TYPE record<subject>;
DEFINE INDEX unique_relationships 
    ON TABLE precede 
    COLUMNS in, out UNIQUE;

