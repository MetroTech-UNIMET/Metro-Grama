-- Definir esquema de materias
BEGIN TRANSACTION;
DEFINE TABLE subjects SCHEMALESS;
DEFINE FIELD name ON subjects TYPE string
    ASSERT string::len($value) > 3 && string::len($value) < 100;
DEFINE FIELD careers ON subjects TYPE array<string>
    ASSERT array::len($value) > 0;
DEFINE FIELD trimester ON subjects TYPE number
    ASSERT $value > 0 && $value < 20;
DEFINE FIELD precedesSubjects ON subjects TYPE array<record(subjects)>;
COMMIT TRANSACTION;

-- Populate subjects
-- Trimestre 1
CREATE subjects:FBTMM01 SET name="Matemática básica", careers=["Ingeniería de sistemas"], trimester=1, precedesSubjects=[];
CREATE subjects:FBTSP03 SET name="Introducción a la Ingeniería", careers=["Ingeniería de sistemas"], trimester=1, precedesSubjects=[];
CREATE subjects:FBTSP04 SET name="Pensamiento Computacional", careers=["Ingeniería de sistemas"], trimester=1, precedesSubjects=[];
CREATE subjects:FBTEM01 SET name="Competencias para emprender", careers=["Ingeniería de sistemas"], trimester=1, precedesSubjects=[];
CREATE subjects:FBTIN04 SET name="Inglés IV", careers=["Ingeniería de sistemas"], trimester=1, precedesSubjects=[];

-- Trimestre 2
CREATE subjects:BPTMI01 SET name="Matemáticas I", careers=["Ingeniería de sistemas"], trimester=2, precedesSubjects=["subjects:FBTMM01"];
CREATE subjects:FBTHE05 SET name="Investigación y Sustentabilidad", careers=["Ingeniería de sistemas"], trimester=2, precedesSubjects=[];
CREATE subjects:BPTPI07 SET name="Diseño asistido por computador", careers=["Ingeniería de sistemas"], trimester=2, precedesSubjects=[];
CREATE subjects:BPTQI21 SET name="Química General I", careers=["Ingeniería de sistemas"], trimester=2, precedesSubjects=["subjects:FBTMM01"];
CREATE subjects:FBTIN05 SET name="Inglés V", careers=["Ingeniería de sistemas"], trimester=2, precedesSubjects=["subjects:FBTIN04"];

-- Trimestre 3
CREATE subjects:BPTMI02 SET name="Matemáticas II", careers=["Ingeniería de sistemas"], trimester=3, precedesSubjects=["subjects:BPTMI01"];
CREATE subjects:BPTFI01 SET name="Física I", careers=["Ingeniería de sistemas"], trimester=3, precedesSubjects=["subjects:BPTMI01"];
CREATE subjects:BPTSP05 SET name="Algoritmos y Programación", careers=["Ingeniería de sistemas"], trimester=3, precedesSubjects=["subjects:FBTSP04"];
CREATE subjects:BPTQI22 SET name="Laboratorio de Química General I", careers=["Ingeniería de sistemas"], trimester=3, precedesSubjects=["subjects:BPTQI21"];
CREATE subjects:FBTEM02 SET name="Ideas emprendedoras", careers=["Ingeniería de sistemas"], trimester=3, precedesSubjects=[];

-- Trimestre 4
CREATE subjects:BPTMI03 SET name="Matemáticas III", careers=["Ingeniería de sistemas"], trimester=4, precedesSubjects=["subjects:BPTMI02"];
CREATE subjects:BPTFI02 SET name="Física II", careers=["Ingeniería de sistemas"], trimester=4, precedesSubjects=["subjects:BPTFI01", "subjects:BPTMI02"];
CREATE subjects:BPTSP06 SET name="Estructuras de Datos", careers=["Ingeniería de sistemas"], trimester=4, precedesSubjects=["subjects:BPTSP05"];
CREATE subjects:BPTMI30 SET name="Matemáticas Discretas", careers=["Ingeniería de sistemas"], trimester=4, precedesSubjects=["subjects:BPTMI01"];

-- Trimestre 5
CREATE subjects:BPTMI04 SET name="Matemáticas IV", careers=["Ingeniería de sistemas"], trimester=5, precedesSubjects=["subjects:BPTMI03"];
CREATE subjects:BPTFI05 SET name="Laboratorio de Física Aplicada", careers=["Ingeniería de sistemas"], trimester=5, precedesSubjects=["subjects:BPTFI02"];
CREATE subjects:FPTSP04 SET name="Sistemas de Información", careers=["Ingeniería de sistemas"], trimester=5, precedesSubjects=["subjects:BPTSP06"];
CREATE subjects:BPTEN12 SET name="Arquitectura del Computador", careers=["Ingeniería de sistemas"], trimester=5, precedesSubjects=["subjects:BPTSP05"];
CREATE subjects:BPTMI31 SET name="Algebra Lineal", careers=["Ingeniería de sistemas"], trimester=5, precedesSubjects=["subjects:BPTMI03"];

-- Trimestre 6
CREATE subjects:BPTMI11 SET name="Ecuaciones Diferenciales", careers=["Ingeniería de sistemas"], trimester=6, precedesSubjects=["subjects:BPTMI04"];
CREATE subjects:BPTMI06 SET name="Estadística para Ingenieros I", careers=["Ingeniería de sistemas"], trimester=6, precedesSubjects=["subjects:BPTMI03"];
CREATE subjects:FPTSP01 SET name="Bases de Datos I", careers=["Ingeniería de sistemas"], trimester=6, precedesSubjects=["subjects:BPTSP06"];
CREATE subjects:BPTSP03 SET name="Organización del Computador", careers=["Ingeniería de sistemas"], trimester=6, precedesSubjects=["subjects:BPTEN12"];

-- Trimestre 7
CREATE subjects:BPTMI05 SET name="Matemáticas V", careers=["Ingeniería de sistemas"], trimester=7, precedesSubjects=["subjects:BPTMI04"];
CREATE subjects:BPTMI07 SET name="Estadística para Ingenieros II", careers=["Ingeniería de sistemas"], trimester=7, precedesSubjects=["subjects:BPTMI06"];
CREATE subjects:FPTSP26 SET name="Bases de Datos II", careers=["Ingeniería de sistemas"], trimester=7, precedesSubjects=["subjects:FPTSP01"];
CREATE subjects:FPTSP17 SET name="Optimización I", careers=["Ingeniería de sistemas"], trimester=7, precedesSubjects=["subjects:BPTMI11"];
CREATE subjects:BPTMI31 SET name="Sistemas Operativos", careers=["Ingeniería de sistemas"], trimester=7, precedesSubjects=["subjects:BPTMI03"];
BEGIN TRANSACTION;