BEGIN TRANSACTION;

LET $subjects = [
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN01,
		isElective: false,
		name: 'Principios de Procesos Industriales I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN02,
		isElective: false,
		name: 'Termodinámica I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN04,
		isElective: false,
		name: 'Principios de procesos industriales II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN07,
		isElective: false,
		name: 'Termodinámica II '
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN12,
		isElective: false,
		name: 'Arquitectura del Computador'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN13,
		isElective: false,
		name: 'Fenómenos de transferencia de calor'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN14,
		isElective: false,
		name: 'Mecánica de fluidos I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTEN15,
		isElective: false,
		name: 'Mecánica de Fluidos II '
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTFI01,
		isElective: false,
		name: 'Física I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTFI02,
		isElective: false,
		name: 'Física II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTFI03,
		isElective: false,
		name: 'Física III'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTFI04,
		isElective: false,
		name: 'Laboratorio de Física'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTFI05,
		isElective: false,
		name: 'Laboratorio de Física Aplicada'
	},
	{
		BPCredits: 0,
		credits: 1,
		id: subject:BPTMI01,
		isElective: false,
		name: 'Matemáticas I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI02,
		isElective: false,
		name: 'Matemáticas II '
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI03,
		isElective: false,
		name: 'Matemáticas III'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI04,
		isElective: false,
		name: 'Matemáticas IV'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI05,
		isElective: false,
		name: 'Matemáticas V'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI06,
		isElective: false,
		name: 'Estadística para Ingenieros I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI07,
		isElective: false,
		name: 'Estadística para Ingenieros II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI11,
		isElective: false,
		name: 'Ecuaciones Diferenciales'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI30,
		isElective: false,
		name: 'Matemáticas Discretas'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMI31,
		isElective: false,
		name: 'Algebra Lineal'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTMM91,
		isElective: false,
		name: 'Cálculo Numérico'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTPI01,
		isElective: false,
		name: 'Representación de Conj. Mecánicos'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTPI02,
		isElective: false,
		name: 'Mecánica I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTPI03,
		isElective: false,
		name: 'Mecánica II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTPI04,
		isElective: false,
		name: 'Mecánica de Sólidos I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTPI05,
		isElective: false,
		name: 'Mecánica de Sólidos II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTPI06,
		isElective: false,
		name: 'BPTPI06'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTPI07,
		isElective: false,
		name: 'Diseño asistido por computador'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTQI01,
		isElective: false,
		name: 'Laboratorio de Química General II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTQI02,
		isElective: false,
		name: 'Laboratorio de Química Orgánica'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTQI11,
		isElective: false,
		name: 'Química Orgánica I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTQI15,
		isElective: false,
		name: 'Química Orgánica II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTQI21,
		isElective: false,
		name: 'Química General I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTQI22,
		isElective: false,
		name: 'Laboratorio de Química General I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTQI23,
		isElective: false,
		name: 'Química General II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTSP03,
		isElective: false,
		name: 'Organización del Computador'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTSP04,
		isElective: false,
		name: 'Sistemas Operativos'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTSP05,
		isElective: false,
		name: 'Algoritmos y Programación'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:BPTSP06,
		isElective: false,
		name: 'Estructuras de Datos'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTEM01,
		isElective: false,
		name: 'Competencias para emprender'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTEM02,
		isElective: false,
		name: 'Ideas emprendedoras'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTHE05,
		isElective: false,
		name: 'Investigación y Sustentabilidad'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTIN04,
		isElective: false,
		name: 'Inglés IV'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTIN05,
		isElective: false,
		name: 'Inglés V'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTMM01,
		isElective: false,
		name: 'Matemática básica'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTSP03,
		isElective: false,
		name: 'Introducción a la Ingeniería'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FBTSP04,
		isElective: false,
		name: 'Pensamiento Computacional'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FGECC01,
		isElective: true,
		name: 'Psicología Positiva'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FGECS03,
		isElective: true,
		name: 'Gerencia Ambiental'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FGEDI02,
		isElective: true,
		name: 'Inteligencia Emocional'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FGEDI26,
		isElective: true,
		name: 'Mitología Griega'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FGESP03,
		isElective: true,
		name: 'Contenidos Digitales para el Metaverso'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FGESP04,
		isElective: true,
		name: 'Introducción a la Realidad Virtual'
	},
	{
		BPCredits: 57,
		credits: 150,
		id: subject:FPTCS16,
		isElective: false,
		name: 'Ingeniería Ambiental'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN03,
		isElective: false,
		name: 'Electromecánica'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN05,
		isElective: false,
		name: 'Lab. de Fluidos y Transferencias'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN11,
		isElective: false,
		name: 'Turbomáquinas'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN16,
		isElective: false,
		name: 'Procesos de separación I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN22,
		isElective: false,
		name: 'Control de Procesos Industriales'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN23,
		isElective: false,
		name: 'Sistemas de Redes'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN27,
		isElective: false,
		name: 'Robótica Indurstrial'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTEN28,
		isElective: false,
		name: 'Conversión y Almacen de Energía'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTMI21,
		isElective: false,
		name: 'Modelos Estocásticos'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI01,
		isElective: false,
		name: 'Diseño de Elem. de Máquinas I '
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI02,
		isElective: false,
		name: 'Mantenimiento'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI03,
		isElective: false,
		name: 'Diseño de Elem. de Máquinas II '
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI04,
		isElective: false,
		name: 'Vibraciones'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI05,
		isElective: false,
		name: 'Laboratorio de Vibraciones'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI06,
		isElective: false,
		name: 'Procesos de Fabricación I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI07,
		isElective: false,
		name: 'Procesos de Fabricación II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI09,
		isElective: false,
		name: 'Gestión Cadena Suministro I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI17,
		isElective: false,
		name: 'Lab. de Ensayos Mecánicos'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTPI18,
		isElective: false,
		name: 'Diseño Conceptual'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP01,
		isElective: false,
		name: 'Bases de Datos I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP04,
		isElective: false,
		name: 'Sistemas de Información'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP07,
		isElective: false,
		name: 'Ingeniería de Software'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP11,
		isElective: false,
		name: 'Gerencia de Proyectos TIC'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP14,
		isElective: false,
		name: 'Proyecto de Ingeniería'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP15,
		isElective: false,
		name: 'Ingeniería Económica'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP17,
		isElective: false,
		name: 'Optimización I'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP18,
		isElective: false,
		name: 'Seguridad de la información'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP19,
		isElective: false,
		name: 'Optimización II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP20,
		isElective: false,
		name: 'Simulación'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP21,
		isElective: false,
		name: 'Modelación Sist. en Redes'
	},
	{
		BPCredits: 57,
		credits: 120,
		id: subject:FPTSP22,
		isElective: false,
		name: 'Taller de Trabajo de Grado'
	},
	{
		BPCredits: 57,
		credits: 0,
		id: subject:FPTSP23,
		isElective: false,
		name: 'Sistemas de Apoyo'
	},
	{
		BPCredits: 57,
		credits: 0,
		id: subject:FPTSP25,
		isElective: false,
		name: 'Computación Emergente'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP26,
		isElective: false,
		name: 'Bases de Datos II'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP27,
		isElective: false,
		name: 'Análisis de Datos'
	},
	{
		BPCredits: 0,
		credits: 0,
		id: subject:FPTSP28,
		isElective: false,
		name: 'Sistemas Distribuidos'
	}
];

FOR $subject IN $subjects {
    CREATE $subject.id CONTENT $subject;
};

LET $precedes = [
	{
		id: precede:0vfc53r8jbsr868car3q,
		in: subject:BPTFI01,
		out: subject:BPTFI02
	},
	{
		id: precede:0xtz237l6x1rufiplevd,
		in: subject:BPTMI07,
		out: subject:FPTSP23
	},
	{
		id: precede:14elnvkii0gglbi6m4fo,
		in: subject:BPTEN15,
		out: subject:FPTEN11
	},
	{
		id: precede:1bn2vs8ykffsm46av5iw,
		in: subject:BPTEN14,
		out: subject:FPTEN11
	},
	{
		id: precede:1owix6oxgk0ha584n5nj,
		in: subject:FBTIN04,
		out: subject:FBTIN05
	},
	{
		id: precede:277waywhkyln5kdioa8v,
		in: subject:BPTFI02,
		out: subject:BPTFI03
	},
	{
		id: precede:27diprv2o4v5xq8f8w0z,
		in: subject:BPTPI02,
		out: subject:BPTPI04
	},
	{
		id: precede:2q0s2kut661xxwal25q4,
		in: subject:BPTSP05,
		out: subject:FPTEN27
	},
	{
		id: precede:336v6ve07i160r031j9g,
		in: subject:BPTMI03,
		out: subject:BPTMI06
	},
	{
		id: precede:37sw5ypowwf5yxx8brwi,
		in: subject:BPTMI02,
		out: subject:BPTMI03
	},
	{
		id: precede:3nh65e7ip82sifde0fog,
		in: subject:BPTFI04,
		out: subject:FPTEN22
	},
	{
		id: precede:3uvs2t7wa3ulnvz5rw57,
		in: subject:BPTMI04,
		out: subject:BPTMI11
	},
	{
		id: precede:45ieravrug28gnmb1wza,
		in: subject:BPTMI11,
		out: subject:BPTMM91
	},
	{
		id: precede:4q673u80i0s1lpdn0pxh,
		in: subject:BPTPI04,
		out: subject:BPTPI06
	},
	{
		id: precede:4re7umavnlyuqtypmu1w,
		in: subject:BPTSP05,
		out: subject:BPTSP06
	},
	{
		id: precede:54j973so9j1r7zo02brg,
		in: subject:BPTMI04,
		out: subject:BPTMI05
	},
	{
		id: precede:5jbgyrg1lsb3iwj6tvxw,
		in: subject:BPTEN14,
		out: subject:FPTEN05
	},
	{
		id: precede:5l9k4yukf2ty5m5t4c8v,
		in: subject:BPTEN02,
		out: subject:BPTEN01
	},
	{
		id: precede:5vdl1lbprd51xw541y04,
		in: subject:BPTMI01,
		out: subject:BPTFI01
	},
	{
		id: precede:6sfno4ruged4pqulsry1,
		in: subject:BPTEN02,
		out: subject:BPTEN07
	},
	{
		id: precede:70ldad06r8y11276hnul,
		in: subject:BPTMI01,
		out: subject:BPTMI30
	},
	{
		id: precede:8qk6hiy6aere4zll4m1a,
		in: subject:BPTFI02,
		out: subject:BPTFI05
	},
	{
		id: precede:91zbv51547qjb5bx833l,
		in: subject:BPTMI07,
		out: subject:FPTSP27
	},
	{
		id: precede:98q2v95pflnm86frn72j,
		in: subject:FPTSP04,
		out: subject:FPTSP07
	},
	{
		id: precede:9brselmcdk7p5hx4oeew,
		in: subject:FPTSP17,
		out: subject:FPTSP19
	},
	{
		id: precede:9mwhbmsaydctcisqjkz6,
		in: subject:BPTEN02,
		out: subject:BPTEN13
	},
	{
		id: precede:a6ir34cx3wfvc14la3wf,
		in: subject:BPTQI11,
		out: subject:BPTQI15
	},
	{
		id: precede:a72rgugdbf1ysu8hixwr,
		in: subject:BPTMI06,
		out: subject:FPTSP20
	},
	{
		id: precede:ahecwctw5dvsns25kvxo,
		in: subject:FPTPI01,
		out: subject:FPTPI03
	},
	{
		id: precede:am1awl2k3rzo11m10zau,
		in: subject:BPTQI11,
		out: subject:BPTEN13
	},
	{
		id: precede:at7rkeoybkpi7ne23l0w,
		in: subject:BPTQI21,
		out: subject:BPTQI22
	},
	{
		id: precede:b36wdy6a67w41o38dn87,
		in: subject:BPTEN14,
		out: subject:BPTEN15
	},
	{
		id: precede:b7h7d778ieyrixbfhv3y,
		in: subject:BPTQI01,
		out: subject:BPTQI02
	},
	{
		id: precede:baliyoc9nwth3o2ytk0g,
		in: subject:BPTQI22,
		out: subject:BPTQI01
	},
	{
		id: precede:bl9o23s9p93eynq4177z,
		in: subject:FBTMM01,
		out: subject:BPTQI21
	},
	{
		id: precede:blwkl66j0l97i3ax34vv,
		in: subject:FGESP03,
		out: subject:FGESP04
	},
	{
		id: precede:c1y8u2ofo5v0icx8bez2,
		in: subject:BPTMI04,
		out: subject:BPTEN14
	},
	{
		id: precede:c4sl8oy7hqwvpjp1jxd6,
		in: subject:BPTPI03,
		out: subject:FPTPI04
	},
	{
		id: precede:cl5c4wtm5g2dwqy70ytq,
		in: subject:BPTMI31,
		out: subject:FPTSP25
	},
	{
		id: precede:cr7wv2ijc5g6rliv8y5e,
		in: subject:BPTQI23,
		out: subject:BPTQI01
	},
	{
		id: precede:dcrkggo6ufu1mm1a06qr,
		in: subject:BPTMI06,
		out: subject:FPTMI21
	},
	{
		id: precede:ec4m7e6vx09igcjjuw2w,
		in: subject:BPTFI02,
		out: subject:FPTEN23
	},
	{
		id: precede:f5wmvc97mp95057065xz,
		in: subject:BPTPI01,
		out: subject:FPTPI01
	},
	{
		id: precede:gn213g4pd0oc4mrp9oen,
		in: subject:BPTSP06,
		out: subject:FPTSP01
	},
	{
		id: precede:h5q6yjs6b52q0ooh1b2j,
		in: subject:BPTFI01,
		out: subject:BPTPI02
	},
	{
		id: precede:h5xd5z7mtrifzk4r7dtn,
		in: subject:BPTEN01,
		out: subject:BPTEN04
	},
	{
		id: precede:hwiecrms5clmuhu20qx0,
		in: subject:BPTSP05,
		out: subject:BPTEN12
	},
	{
		id: precede:i4rlxoiln5xze5q1pf7w,
		in: subject:BPTMI01,
		out: subject:BPTMI02
	},
	{
		id: precede:i832d7onvvfig0ly14cl,
		in: subject:BPTEN13,
		out: subject:FPTEN05
	},
	{
		id: precede:ialmpy2r0ptr1wynmobj,
		in: subject:FPTEN23,
		out: subject:FPTSP18
	},
	{
		id: precede:j2ip27exkmq3o6s5zhn3,
		in: subject:FPTSP19,
		out: subject:FPTSP21
	},
	{
		id: precede:j3f3luc3p0k3igjlkw4x,
		in: subject:BPTPI07,
		out: subject:BPTPI01
	},
	{
		id: precede:jipsplk4n5t47nqnalyo,
		in: subject:BPTPI05,
		out: subject:FPTPI01
	},
	{
		id: precede:jmf0ibos1shyzmth86mt,
		in: subject:FPTPI04,
		out: subject:FPTPI05
	},
	{
		id: precede:kogqj3wmfpa7wa459kfa,
		in: subject:BPTMI02,
		out: subject:BPTFI02
	},
	{
		id: precede:kybx1ys2sk0fujye5qbf,
		in: subject:BPTQI15,
		out: subject:BPTQI02
	},
	{
		id: precede:m4lws5fmv3y9a0pxgpxw,
		in: subject:FPTSP17,
		out: subject:FPTPI09
	},
	{
		id: precede:mwbuogpbf2lvgzm76a5c,
		in: subject:BPTPI02,
		out: subject:BPTPI03
	},
	{
		id: precede:op42ccvs551us7l13dci,
		in: subject:BPTFI01,
		out: subject:BPTEN02
	},
	{
		id: precede:ops27tifkq3pihuyoteo,
		in: subject:FBTSP04,
		out: subject:BPTSP05
	},
	{
		id: precede:oqob2l0ihzmxw0gf85f9,
		in: subject:FPTPI06,
		out: subject:FPTPI07
	},
	{
		id: precede:ozhxtnlwrct3yxqpttw4,
		in: subject:BPTPI04,
		out: subject:BPTPI05
	},
	{
		id: precede:p0h26ec36lnavfp9xnmt,
		in: subject:BPTMI06,
		out: subject:BPTMI07
	},
	{
		id: precede:pgasdqmcisba1vrq05lt,
		in: subject:BPTMI11,
		out: subject:FPTSP17
	},
	{
		id: precede:povj41sm3t3q5r4vu2ek,
		in: subject:BPTFI03,
		out: subject:BPTFI04
	},
	{
		id: precede:q1qhbsd7587nuvjcdyar,
		in: subject:BPTQI23,
		out: subject:BPTQI11
	},
	{
		id: precede:qfa0ipitw4xgbs5szv2v,
		in: subject:BPTEN04,
		out: subject:FPTEN16
	},
	{
		id: precede:qnjf1sd0u5edu6qjyr9c,
		in: subject:BPTSP06,
		out: subject:FPTSP04
	},
	{
		id: precede:rpvaoowxltck37dk5wa2,
		in: subject:BPTEN12,
		out: subject:BPTSP03
	},
	{
		id: precede:sji1905oi0ba2bgiyxkh,
		in: subject:FPTSP04,
		out: subject:FPTSP11
	},
	{
		id: precede:svmaixhg8w7oun7m3ujv,
		in: subject:FPTSP01,
		out: subject:FPTSP26
	},
	{
		id: precede:t8156ehh9764wihw72oo,
		in: subject:BPTSP03,
		out: subject:BPTSP04
	},
	{
		id: precede:udo8cddtg2v02oyo1eny,
		in: subject:BPTMI03,
		out: subject:BPTMI31
	},
	{
		id: precede:upimpxs9qq05u7ewi9pm,
		in: subject:FBTMM01,
		out: subject:BPTMI01
	},
	{
		id: precede:v0ht0g2bm2bsjjh0x3bi,
		in: subject:BPTEN13,
		out: subject:FPTEN16
	},
	{
		id: precede:v0zqg43rrvhfihcxenkq,
		in: subject:BPTSP03,
		out: subject:FPTSP28
	},
	{
		id: precede:v5vhuz9jl65otqmhsxhx,
		in: subject:BPTMI06,
		out: subject:FPTPI02
	},
	{
		id: precede:vc2iubn0zp2ns4q5ubct,
		in: subject:BPTQI21,
		out: subject:BPTQI23
	},
	{
		id: precede:wwbk9rqlbicbr6qy4far,
		in: subject:FPTSP01,
		out: subject:FPTSP07
	},
	{
		id: precede:wz7jlo52tkfx8wjklftu,
		in: subject:BPTMI06,
		out: subject:FPTPI17
	},
	{
		id: precede:y0lptv58nay0h2nfo5ma,
		in: subject:FPTPI03,
		out: subject:FPTPI18
	},
	{
		id: precede:yblt7w7zmyaaahw2ahan,
		in: subject:BPTPI06,
		out: subject:FPTPI06
	},
	{
		id: precede:yhukbv1zt54i4oughsba,
		in: subject:BPTMI03,
		out: subject:BPTMI04
	},
	{
		id: precede:ynx6qmzehsxgucgre70k,
		in: subject:BPTEN07,
		out: subject:FPTEN11
	},
	{
		id: precede:zzwmw08tvv06c2w87ltx,
		in: subject:BPTQI22,
		out: subject:BPTEN01
	}
];

FOR $relation IN $precedes {
    RELATE ($relation.in)->belong->($relation.out);
};
COMMIT TRANSACTION;