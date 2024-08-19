-- Definir tabla de relacion studiante -> careera 
DEFINE TABLE course SCHEMAFULL;
DEFINE FIELD in ON course TYPE record<student>;
DEFINE FIELD out ON course TYPE record<career>;

