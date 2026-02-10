DEFINE TABLE enroll TYPE RELATION IN student OUT subject SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- FIELDS
-- ------------------------------ 

DEFINE FIELD difficulty ON enroll TYPE int DEFAULT NONE ASSERT {
IF !($value >= 1 AND $value <= 5) { THROW 'Difficulty must be on the range [1,5]. Value passsed: ' + <string> $value; };
RETURN true;
} PERMISSIONS FULL;
DEFINE FIELD grade ON enroll TYPE int ASSERT {
IF !($value >= 0 AND $value <= 20) { THROW 'Difficulty must be on the range [0,20]. Value passsed: ' + <string> $value; };
RETURN true;
} PERMISSIONS FULL;
DEFINE FIELD in ON enroll TYPE record<student> PERMISSIONS FULL;
DEFINE FIELD out ON enroll TYPE record<subject> PERMISSIONS FULL;
DEFINE FIELD trimester ON enroll TYPE record<trimester> PERMISSIONS FULL;
DEFINE FIELD workload ON enroll TYPE int DEFAULT NONE ASSERT {
IF !($value >= 1 AND $value <= 5) { THROW 'Workload must be on the range [1,5]. Value passsed: ' + <string> $value; };
RETURN true;
} PERMISSIONS FULL;
-- ------------------------------
-- INDEXES
-- ------------------------------ 

DEFINE INDEX unique_relationships_by_trimester ON enroll FIELDS in, out, trimester UNIQUE;