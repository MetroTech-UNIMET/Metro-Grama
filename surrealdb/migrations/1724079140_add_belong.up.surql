DEFINE TABLE belong TYPE RELATION IN subject OUT career SCHEMAFULL;
DEFINE FIELD trimester ON belong TYPE number;
DEFINE INDEX unique_relationships 
    ON TABLE belong 
    COLUMNS in, out UNIQUE;
