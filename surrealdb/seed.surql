DELETE carrer;
DELETE career;
DELETE student;
DELETE subject;
DELETE passed;
DELETE precede;
DELETE course;
DELETE belong;

-- Definir esquema de careeras
-- El id de la careera tendra que ser una palabra sin espacios,
-- por que los id con espacios necesitan un caracter especial que
-- no esta en los teclados. Por eso que esta el field del nombre
DEFINE TABLE career SCHEMAFULL;
DEFINE FIELD name ON career TYPE string;
DEFINE INDEX careerNameIndex ON TABLE career COLUMNS name UNIQUE;

-- Roles
DEFINE TABLE role SCHEMAFULL;
CREATE role:user;
CREATE role:admin;

-- Estudiantes
DEFINE TABLE student SCHEMAFULL;
DEFINE FIELD firstName ON student TYPE string;
DEFINE FIELD lastName ON student TYPE string;
DEFINE FIELD email ON student TYPE string ASSERT string::is::email($value);
DEFINE FIELD password ON student TYPE string;
DEFINE FIELD verified ON student TYPE bool DEFAULT false;
DEFINE FIELD role ON student TYPE record<role> DEFAULT role:user;
DEFINE FIELD created ON student DEFAULT time::now() READONLY;
DEFINE INDEX studentEmailIndex ON TABLE student COLUMNS email UNIQUE;

-- Definir esquema de materias
DEFINE TABLE subject SCHEMAFULL;
DEFINE FIELD name ON subject TYPE string;
DEFINE INDEX subjectNameIndex ON TABLE subject COLUMNS name UNIQUE;

-- Definir tabla de relacion estudiante -> materia
DEFINE TABLE passed SCHEMAFULL;
DEFINE FIELD in ON passed TYPE record<student>;
DEFINE FIELD out ON passed TYPE record<subject>;
DEFINE FIELD trimester ON passed TYPE number; 

-- Definir tabla de relacion studiante -> careera 
DEFINE TABLE course SCHEMAFULL;
DEFINE FIELD in ON course TYPE record<student>;
DEFINE FIELD out ON course TYPE record<career>;

-- Definir tabla de relacion careeras -> materias 
DEFINE TABLE belong SCHEMAFULL;
DEFINE FIELD in ON belong TYPE record<subject>;
DEFINE FIELD out ON belong TYPE record<career>;
DEFINE FIELD trimester ON belong TYPE number;

-- Definir tabla de relacion materias -> materias 
DEFINE TABLE precede SCHEMAFULL;
DEFINE FIELD in ON precede TYPE record<subject>;
DEFINE FIELD out ON precede TYPE record<subject>;

-- Popular careeras
CREATE career:sistemas SET name="Ingeniería de sistemas";
CREATE career:quimica SET name="Ingeniería quimica";

-- Popular careeras
-- Trimestre 1
CREATE subject:FBTMM01 SET name="Matemática básica";
CREATE subject:FBTSP03 SET name="Introducción a la Ingeniería";
CREATE subject:FBTSP04 SET name="Pensamiento Computacional";
CREATE subject:FBTEM01 SET name="Competencias para emprender" ;
CREATE subject:FBTIN04 SET name="Inglés IV";

RELATE subject:FBTMM01->belong->career:sistemas SET trimester = 1;
RELATE subject:FBTSP03->belong->career:sistemas SET trimester = 1;
RELATE subject:FBTSP04->belong->career:sistemas SET trimester = 1;
RELATE subject:FBTEM01->belong->career:sistemas SET trimester = 1;
RELATE subject:FBTIN04->belong->career:sistemas SET trimester = 1;

-- Trimestre 2
CREATE subject:BPTMI01 SET name="Matemáticas I";
CREATE subject:FBTHE05 SET name="Investigación y Sustentabilidad";
CREATE subject:BPTPI07 SET name="Diseño asistido por computador";
CREATE subject:BPTQI21 SET name="Química General I";
CREATE subject:FBTIN05 SET name="Inglés V";

RELATE subject:FBTMM01->precede->subject:BPTMI01;
RELATE subject:FBTMM01->precede->subject:BPTQI21;
RELATE subject:FBTIN04->precede->subject:FBTIN05;

RELATE subject:BPTMI01->belong->career:sistemas SET trimester = 2;
RELATE subject:FBTHE05->belong->career:sistemas SET trimester = 2;
RELATE subject:BPTPI07->belong->career:sistemas SET trimester = 2;
RELATE subject:BPTQI21->belong->career:sistemas SET trimester = 2;
RELATE subject:FBTIN05->belong->career:sistemas SET trimester = 2;

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

RELATE subject:BPTMI02->belong->career:sistemas SET trimester=3;
RELATE subject:BPTFI01->belong->career:sistemas SET trimester=3;
RELATE subject:BPTSP05->belong->career:sistemas SET trimester=3;
RELATE subject:BPTQI22->belong->career:sistemas SET trimester=3;
RELATE subject:FBTEM02->belong->career:sistemas SET trimester=3;

CREATE subject:BPTMI02 SET name="Matemáticas II";
CREATE subject:BPTFI01 SET name="Física I";
CREATE subject:BPTSP05 SET name="Algoritmos y Programación";
CREATE subject:BPTQI22 SET name="Laboratorio de Química General I";
CREATE subject:FBTEM02 SET name="Ideas emprendedoras";

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

RELATE subject:BPTMI03->belong->career:sistemas SET trimester=4;
RELATE subject:BPTFI02->belong->career:sistemas SET trimester=4;
RELATE subject:BPTSP06->belong->career:sistemas SET trimester=4;
RELATE subject:BPTMI30->belong->career:sistemas SET trimester=4;

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

RELATE subject:BPTMI04->belong->career:sistemas SET trimester=5;
RELATE subject:BPTFI05->belong->career:sistemas SET trimester=5;
RELATE subject:FPTSP04->belong->career:sistemas SET trimester=5;
RELATE subject:BPTEN12->belong->career:sistemas SET trimester=5;
RELATE subject:BPTMI31->belong->career:sistemas SET trimester=5;

-- Trimestre 6
CREATE subject:BPTMI11 SET name="Ecuaciones Diferenciales";
CREATE subject:BPTMI06 SET name="Estadística para Ingenieros I";
CREATE subject:FPTSP01 SET name="Bases de Datos I";
CREATE subject:BPTSP03 SET name="Organización del Computador";

RELATE subject:BPTMI04->precede->subject:BPTMI11;
RELATE subject:BPTMI03->precede->subject:BPTMI06;
RELATE subject:BPTSP06->precede->subject:FPTSP01;
RELATE subject:BPTEN12->precede->subject:BPTSP03;

RELATE subject:BPTMI11->belong->career:sistemas SET trimester = 6;
RELATE subject:BPTMI06->belong->career:sistemas SET trimester = 6;
RELATE subject:FPTSP01->belong->career:sistemas SET trimester = 6;
RELATE subject:BPTSP03->belong->career:sistemas SET trimester = 6;

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

RELATE subject:BPTMI05->belong->career:sistemas SET trimester = 7;
RELATE subject:BPTMI07->belong->career:sistemas SET trimester = 7;
RELATE subject:FPTSP26->belong->career:sistemas SET trimester = 7;
RELATE subject:FPTSP17->belong->career:sistemas SET trimester = 7;
RELATE subject:BPTSP04->belong->career:sistemas SET trimester = 7;

-- Trimestre 8
CREATE subject:FPTPI09 SET name="Gestión Cadena Suministro I";
CREATE subject:BPTMM91 SET name="Cálculo Numérico";
CREATE subject:FPTSP07 SET name="Ingeniería de Software";
CREATE subject:FPTSP19 SET name="Optimización II";

RELATE subject:FPTSP17->precede->subject:FPTPI09;
RELATE subject:BPTMI11->precede->subject:BPTMM91;
RELATE subject:FPTSP01->precede->subject:FPTSP07;
RELATE subject:FPTSP04->precede->subject:FPTSP07;
RELATE subject:FPTSP17->precede->subject:FPTSP19;

RELATE subject:FPTPI09->belong->career:sistemas SET trimester = 8;
RELATE subject:BPTMM91->belong->career:sistemas SET trimester = 8;
RELATE subject:FPTSP07->belong->career:sistemas SET trimester = 8;
RELATE subject:FPTSP19->belong->career:sistemas SET trimester = 8;

-- Trimestre 9
CREATE subject:FPTSP28 SET name="Sistemas Distribuidos";
CREATE subject:FPTSP21 SET name="Modelación Sist. en Redes";
CREATE subject:FPTSP20 SET name="Simulación";
CREATE subject:FPTMI21 SET name="Modelos Estocásticos";

RELATE subject:BPTSP03->precede->subject:FPTSP28;
RELATE subject:FPTSP19->precede->subject:FPTSP21;
RELATE subject:BPTMI06->precede->subject:FPTSP20;
RELATE subject:BPTMI06->precede->subject:FPTMI21;

RELATE subject:FPTSP28->belong->career:sistemas SET trimester = 9;
RELATE subject:FPTSP21->belong->career:sistemas SET trimester = 9;
RELATE subject:FPTSP20->belong->career:sistemas SET trimester = 9;
RELATE subject:FPTMI21->belong->career:sistemas SET trimester = 9;

-- Trimestre 10
CREATE subject:FPTEN23 SET name="Sistemas de Redes";
CREATE subject:FPTSP27 SET name="Análisis de Datos";
CREATE subject:FPTSP23 SET name="Sistemas de Apoyo";

RELATE subject:BPTFI02->precede->subject:FPTEN23;
RELATE subject:BPTMI07->precede->subject:FPTSP27;
RELATE subject:BPTMI07->precede->subject:FPTSP23;

RELATE subject:FPTEN23->belong->career:sistemas SET trimester = 10;
RELATE subject:FPTSP27->belong->career:sistemas SET trimester = 10;
RELATE subject:FPTSP23->belong->career:sistemas SET trimester = 10;

-- Trimestre 11
CREATE subject:FPTSP18 SET name="Seguridad de la información";
CREATE subject:FPTSP11 SET name="Gerencia de Proyectos TIC";
CREATE subject:FPTSP25 SET name="Computación Emergente";
CREATE subject:FPTEN27 SET name="Robótica Indurstrial";

RELATE subject:FPTEN23->precede->subject:FPTSP18;
RELATE subject:FPTSP04->precede->subject:FPTSP11;
RELATE subject:BPTMI31->precede->subject:FPTSP25;
RELATE subject:BPTSP05->precede->subject:FPTEN27;

RELATE subject:FPTSP18->belong->career:sistemas SET trimester=11;
RELATE subject:FPTSP11->belong->career:sistemas SET trimester=11;
RELATE subject:FPTSP25->belong->career:sistemas SET trimester=11;
RELATE subject:FPTEN27->belong->career:sistemas SET trimester=11;

-- Trimestre 12
CREATE subject:FPTSP14 SET name="Proyecto de Ingeniería";
CREATE subject:FPTSP15 SET name="Ingeniería Económica";
CREATE subject:FPTCS16 SET name="Ingeniería Ambiental";

RELATE subject:FPTSP14->belong->career:sistemas SET trimester=12;
RELATE subject:FPTSP15->belong->career:sistemas SET trimester=12;
RELATE subject:FPTCS16->belong->career:sistemas SET trimester=12;

-- Carrera Ing Quimica

-- Trimestre 1
RELATE subject:FBTMM01->belong->career:quimica SET trimester = 1;
RELATE subject:FBTSP03->belong->career:quimica SET trimester = 1;
RELATE subject:FBTSP04->belong->career:quimica SET trimester = 1;
RELATE subject:FBTEM01->belong->career:quimica SET trimester = 1;
RELATE subject:FBTIN04->belong->career:quimica SET trimester = 1;

-- Trimestre 2
RELATE subject:BPTMI01->belong->career:quimica SET trimester = 2;
RELATE subject:FBTHE05->belong->career:quimica SET trimester = 2;
RELATE subject:BPTPI07->belong->career:quimica SET trimester = 2;
RELATE subject:BPTQI21->belong->career:quimica SET trimester = 2;
RELATE subject:FBTIN05->belong->career:quimica SET trimester = 2;

-- Trimestre 3
CREATE subject:BPTQI23 SET name="Química General II";

RELATE subject:BPTQI21->precede->subject:BPTQI23;

RELATE subject:BPTMI02->belong->career:quimica SET trimester=3;
RELATE subject:BPTFI01->belong->career:quimica SET trimester=3;
RELATE subject:BPTQI22->belong->career:quimica SET trimester=3;
RELATE subject:FBTEM02->belong->career:quimica SET trimester=3;
RELATE subject:BPTQI23->belong->career:quimica SET trimester=3;

-- Trimestre 4
CREATE subject:BPTEN02 SET name="Termodinámica I";
CREATE subject:BPTQI01 SET name="Laboratorio de Química General II";

RELATE subject:BPTFI01->precede->subject:BPTEN02;
RELATE subject:BPTQI23->precede->subject:BPTQI01;
RELATE subject:BPTQI22->precede->subject:BPTQI01;

RELATE subject:BPTMI03->belong->career:quimica SET trimester=4;
RELATE subject:BPTFI02->belong->career:quimica SET trimester=4;
RELATE subject:BPTEN02->belong->career:quimica SET trimester=4;
RELATE subject:BPTSP05->belong->career:quimica SET trimester=4;
RELATE subject:BPTQI01->belong->career:quimica SET trimester=4;

-- Trimestre 5
CREATE subject:BPTFI03 SET name="Física III";
CREATE subject:BPTEN01 SET name="Principios de Procesos Industriales I";
CREATE subject:BPTQI11 SET name="Química Orgánica I";

RELATE subject:BPTFI02->precede->subject:BPTFI03;
RELATE subject:BPTEN02->precede->subject:BPTEN01;
RELATE subject:BPTQI22->precede->subject:BPTEN01;
RELATE subject:BPTQI23->precede->subject:BPTQI11;

RELATE subject:BPTMI04->belong->career:quimica SET trimester=5;
RELATE subject:BPTFI03->belong->career:quimica SET trimester=5;
RELATE subject:BPTEN01->belong->career:quimica SET trimester=5;
RELATE subject:BPTQI11->belong->career:quimica SET trimester=5;

-- Trimestre 6
CREATE subject:BPTFI04 SET name="Laboratorio de Física";
CREATE subject:BPTEN04 SET name="Principios de procesos industriales II";
CREATE subject:BPTQI15 SET name="Química Orgánica II";
CREATE subject:BPTEN13 SET name="Fenómenos de transferencia de calor";

RELATE subject:BPTFI03->precede->subject:BPTFI04;
RELATE subject:BPTEN01->precede->subject:BPTEN04;
RELATE subject:BPTQI11->precede->subject:BPTQI15;
RELATE subject:BPTQI11->precede->subject:BPTEN13;

RELATE subject:BPTMI11->belong->career:quimica SET trimester = 6;
RELATE subject:BPTFI04->belong->career:quimica SET trimester=6;
RELATE subject:BPTEN04->belong->career:quimica SET trimester=6;
RELATE subject:BPTQI15->belong->career:quimica SET trimester=6;
RELATE subject:BPTEN13->belong->career:quimica SET trimester=6;

-- Trimestre 7
CREATE subject:BPTEN14 SET name="Mecánica de fluidos I";
CREATE subject:FPTEN16 SET name="Procesos de separación I";
CREATE subject:BPTQI02 SET name="Laboratorio de Química Orgánica";

RELATE subject:BPTMI04->precede->subject:BPTEN14;
RELATE subject:BPTEN13->precede->subject:FPTEN16;
RELATE subject:BPTEN04->precede->subject:FPTEN16;
RELATE subject:BPTQI15->precede->subject:BPTQI02;
RELATE subject:BPTQI01->precede->subject:BPTQI02;

RELATE subject:BPTMI05->belong->career:quimica SET trimester = 7;
RELATE subject:BPTEN14->belong->career:quimica SET trimester = 7;
RELATE subject:FPTEN16->belong->career:quimica SET trimester = 7;
RELATE subject:BPTQI02->belong->career:quimica SET trimester = 7;