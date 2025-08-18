
DEFINE TABLE trimester SCHEMAFULL;

DEFINE FIELD starting_date ON trimester TYPE datetime;
DEFINE FIELD ending_date ON trimester TYPE datetime ASSERT $value > this.starting_date;
DEFINE FIELD id ON trimester TYPE string  ASSERT string::matches(record::id($value), '^[0-9]{4}-(1|2|3|INTENSIVO)$');-- Format XXXX-1, XXXX-2, XXXX-3, or XXXX-INTENSIVO
DEFINE FIELD intensive ON trimester TYPE bool DEFAULT false;