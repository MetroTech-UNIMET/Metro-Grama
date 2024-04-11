containers:
	docker compose up --no-start

db-containers:
	docker compose up --no-start db
	docker compose up --no-start db_seed

seed-db:
	docker compose start db_seed

start-db:
	docker compose start db