-- Definir esquema de careeras
-- El id de la careera tendra que ser una palabra sin espacios,
-- por que los id con espacios necesitan un caracter especial que
-- no esta en los teclados. Por eso que esta el field del nombre
DEFINE TABLE career SCHEMAFULL;
DEFINE FIELD name ON career TYPE string;
DEFINE INDEX careerNameIndex ON TABLE career COLUMNS name UNIQUE;