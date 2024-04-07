# Metro-Grama

## Como compilar el proyecto

### Docker y mixto
Puedes ejecutar todos los servicios y estar en modo desarrollo:

1) Ejecutar todos los servicios `docker compose -d up`
2) Modo desarrollo del backend `docker compose watch`

Pero si solo quieres ejecutar la base de datos y los demas pasos manual:

1) Llenar la base de datos `make seed-surrealdb`
1) Iniciar surreal `make start-surrealdb`

### Manual

En este modo tendras que instalar las dependencias en tu computadora

#### frontend

1. Necesitas instalar nodejs LTS y npm.
2. Instalar dependencias `npm install`
3. Iniciar servidor de desarrollo `npm run dev`

  

#### backend

1. Installar la version de GO 1.21.1 o mayor
2. Instalar dependencias `go mod download`
3. Iniciar servidor `go run main.go`
4. Opcional, instalar `air` y iniciar un servidor de desarrollo

  

#### base de datos

1. Installar surrealdb

	- Más info [aquí](https://surrealdb.com/install)

2. Iniciar el servidor

	- Corre el siguiente comando: `surreal start -A --log debug --user root --pass root file:directorio_donde_quieres_el_archivo.db`

		- Escoge el directorio que prefieras

3. ejecutar el fichero semilla `seed.surql`

	- Corre el siguiente comando en el root del proyecto: `surreal import --conn http://localhost:8000 --user root --pass root --ns test --db test surrealdb/seed.surql`