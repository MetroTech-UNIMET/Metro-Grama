DEFINE TABLE friend TYPE RELATION IN student OUT student ENFORCED SCHEMAFULL PERMISSIONS NONE;


DEFINE FIELD created ON friend TYPE datetime READONLY VALUE time::now() PERMISSIONS FULL;
DEFINE FIELD status ON friend TYPE 'pending' | 'accepted' | 'blocked' DEFAULT 'pending' PERMISSIONS FULL;

DEFINE INDEX unique_relationships ON friend FIELDS in, out UNIQUE;