DELETE carrer;
DELETE student;
DELETE subject;
DELETE passed;
DELETE precede;
DELETE course;
DELETE belong;

-- Definir esquema de carreras
-- El id de la carrera tendra que ser una palabra sin espacios,
-- por que los id con espacios necesitan un caracter especial que
-- no esta en los teclados. Por eso que esta el field del nombre
DEFINE TABLE carrer SCHEMALESS;
DEFINE FIELD name ON carrer TYPE string
    ASSERT string::len($value) > 3 && string::len($value) < 100;
DEFINE INDEX nameIndex ON TABLE carrer COLUMNS name UNIQUE;

-- Estudiantes
DEFINE TABLE student SCHEMALESS;

-- Definir esquema de materias
DEFINE TABLE subject SCHEMALESS;
DEFINE FIELD name ON subject TYPE string
    ASSERT string::len($value) > 3 && string::len($value) < 100;
DEFINE INDEX nameIndex ON TABLE subject COLUMNS name UNIQUE;

-- Definir tabla de relacion estudiante -> materia
DEFINE TABLE passed SCHEMALESS;
DEFINE FIELD in ON passed TYPE record<student>;
DEFINE FIELD out ON passed TYPE record<subject>;
DEFINE FIELD trimester ON course TYPE string; 

-- Definir tabla de relacion studiante -> carrera 
DEFINE TABLE course SCHEMALESS;
DEFINE FIELD in ON course TYPE record<student>;
DEFINE FIELD out ON course TYPE record<carrer>;

-- Definir tabla de relacion carreras -> materias 
DEFINE TABLE belong SCHEMALESS;
DEFINE FIELD in ON belong TYPE record<subject>;
DEFINE FIELD out ON belong TYPE record<carrer>;
DEFINE FIELD trimester ON belong TYPE number
    ASSERT $value > 0;

-- Definir tabla de relacion materias -> materias 
DEFINE TABLE precede SCHEMALESS;
DEFINE FIELD in ON precede TYPE record<subject>;
DEFINE FIELD out ON precede TYPE record<subject>;

-- Popular carreras
CREATE carrer:sistemas SET name="Ingeniería de sistemas";
CREATE carrer:quimica SET name="Ingeniería quimica";

-- popular studientes de prueba
CREATE student:pepe;
RELATE student:pepe->course->carrer:sistemas SET trimester = "2024-1";

-- Popular carreras
-- Trimestre 1
CREATE subject:FBTMM01 SET name="Matemática básica";
CREATE subject:FBTSP03 SET name="Introducción a la Ingeniería";
CREATE subject:FBTSP04 SET name="Pensamiento Computacional";
CREATE subject:FBTEM01 SET name="Competencias para emprender" ;
CREATE subject:FBTIN04 SET name="Inglés IV";

RELATE subject:FBTMM01->belong->carrer:sistemas SET trimester = 1;
RELATE subject:FBTSP03->belong->carrer:sistemas SET trimester = 1;
RELATE subject:FBTSP04->belong->carrer:sistemas SET trimester = 1;
RELATE subject:FBTEM01->belong->carrer:sistemas SET trimester = 1;
RELATE subject:FBTIN04->belong->carrer:sistemas SET trimester = 1;

-- Trimestre 2
CREATE subject:BPTMI01 SET name="Matemáticas I";
CREATE subject:FBTHE05 SET name="Investigación y Sustentabilidad";
CREATE subject:BPTPI07 SET name="Diseño asistido por computador";
CREATE subject:BPTQI21 SET name="Química General I";
CREATE subject:FBTIN05 SET name="Inglés V";

RELATE subject:FBTMM01->precede->subject:BPTMI01;
RELATE subject:FBTMM01->precede->subject:BPTQI21;
RELATE subject:FBTIN04->precede->subject:FBTIN05;

RELATE subject:BPTMI01->belong->carrer:sistemas SET trimester = 2;
RELATE subject:FBTHE05->belong->carrer:sistemas SET trimester = 2;
RELATE subject:BPTPI07->belong->carrer:sistemas SET trimester = 2;
RELATE subject:BPTQI21->belong->carrer:sistemas SET trimester = 2;
RELATE subject:FBTIN05->belong->carrer:sistemas SET trimester = 2;

-- Trimestre 3
CREATE subject:BPTMI02 SET name="Matemáticas II";
CREATE subject:BPTFI01 SET name="Física I";
CREATE subject:BPTSP05 SET name="Algoritmos y Programación";
CREATE subject:BPTQI22 SET name="Laboratorio de Química General I";
CREATE subject:FBTEM02 SET name="Ideas emprendedoras";

RELATE subject:BPTMI01->precede->subject:BPTMI02; 
RELATE subject:BPTMI01->precede->subject:BPTFI01; 
RELATE subject:FBTSP04->precede->subject:BPTSP05; 
RELATE subject:BPTQI21->precede->subject:BPTQI22; 

RELATE subject:BPTMI02->belong->carrer:sistemas SET trimester=3;
RELATE subject:BPTFI01->belong->carrer:sistemas SET trimester=3;
RELATE subject:BPTSP05->belong->carrer:sistemas SET trimester=3;
RELATE subject:BPTQI22->belong->carrer:sistemas SET trimester=3;
RELATE subject:FBTEM02->belong->carrer:sistemas SET trimester=3;

-- Trimestre 4
CREATE subject:BPTMI03 SET name="Matemáticas III";
CREATE subject:BPTFI02 SET name="Física II";
CREATE subject:BPTSP06 SET name="Estructuras de Datos";
CREATE subject:BPTMI30 SET name="Matemáticas Discretas";

RELATE subject:BPTMI02->precede->subject:BPTMI03;
RELATE subject:BPTFI01->precede->subject:BPTFI02;
RELATE subject:BPTMI02->precede->subject:BPTFI02;
RELATE subject:BPTSP05->precede->subject:BPTSP06;
RELATE subject:BPTMI01->precede->subject:BPTMI30;

RELATE subject:BPTMI03->belong->carrer:sistemas SET trimester=4;
RELATE subject:BPTFI02->belong->carrer:sistemas SET trimester=4;
RELATE subject:BPTSP06->belong->carrer:sistemas SET trimester=4;
RELATE subject:BPTMI30->belong->carrer:sistemas SET trimester=4;

-- Trimestre 5
CREATE subject:BPTMI04 SET name="Matemáticas IV";
CREATE subject:BPTFI05 SET name="Laboratorio de Física Aplicada";
CREATE subject:FPTSP04 SET name="Sistemas de Información";
CREATE subject:BPTEN12 SET name="Arquitectura del Computador";
CREATE subject:BPTMI31 SET name="Algebra Lineal";

RELATE subject:BPTMI03->precede->subject:BPTMI04;
RELATE subject:BPTFI02->precede->subject:BPTFI05;
RELATE subject:BPTSP06->precede->subject:FPTSP04;
RELATE subject:BPTSP05->precede->subject:BPTEN12;
RELATE subject:BPTMI03->precede->subject:BPTMI31;

RELATE subject:BPTMI04->belong->carrer:sistemas SET trimester=5;
RELATE subject:BPTFI05->belong->carrer:sistemas SET trimester=5;
RELATE subject:FPTSP04->belong->carrer:sistemas SET trimester=5;
RELATE subject:BPTEN12->belong->carrer:sistemas SET trimester=5;
RELATE subject:BPTMI31->belong->carrer:sistemas SET trimester=5;

-- Trimestre 6
CREATE subject:BPTMI11 SET name="Ecuaciones Diferenciales";
CREATE subject:BPTMI06 SET name="Estadística para Ingenieros I";
CREATE subject:FPTSP01 SET name="Bases de Datos I";
CREATE subject:BPTSP03 SET name="Organización del Computador";

RELATE subject:BPTMI04->precede->subject:BPTMI11;
RELATE subject:BPTMI03->precede->subject:BPTMI06;
RELATE subject:BPTSP06->precede->subject:FPTSP01;
RELATE subject:BPTEN12->precede->subject:BPTSP03;

RELATE subject:BPTMI11->belong->carrer:sistemas SET trimester = 6;
RELATE subject:BPTMI06->belong->carrer:sistemas SET trimester = 6;
RELATE subject:FPTSP01->belong->carrer:sistemas SET trimester = 6;
RELATE subject:BPTSP03->belong->carrer:sistemas SET trimester = 6;

-- Trimestre 7
CREATE subject:BPTMI05 SET name="Matemáticas V";
CREATE subject:BPTMI07 SET name="Estadística para Ingenieros II";
CREATE subject:FPTSP26 SET name="Bases de Datos II";
CREATE subject:FPTSP17 SET name="Optimización I";
CREATE subject:BPTSP04 SET name="Sistemas Operativos";

RELATE subject:BPTMI04->precede->subject:BPTMI05;
RELATE subject:BPTMI06->precede->subject:BPTMI07;
RELATE subject:FPTSP01->precede->subject:FPTSP26;
RELATE subject:BPTMI11->precede->subject:FPTSP17;
RELATE subject:BPTMI03->precede->subject:BPTSP04;

RELATE subject:BPTMI05->belong->carrer:sistemas SET trimester = 7;
RELATE subject:BPTMI07->belong->carrer:sistemas SET trimester = 7;
RELATE subject:FPTSP26->belong->carrer:sistemas SET trimester = 7;
RELATE subject:FPTSP17->belong->carrer:sistemas SET trimester = 7;
RELATE subject:BPTSP04->belong->carrer:sistemas SET trimester = 7;