DEFINE TABLE precede TYPE RELATION IN subject OUT subject SCHEMAFULL;
DEFINE INDEX unique_relationships 
    ON TABLE precede 
    COLUMNS in, out UNIQUE;

