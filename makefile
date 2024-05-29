dev: start-db seed-db

seed-db:
	docker compose -f docker-compose.dev.yml up db_seed

start-db:
	docker compose -f docker-compose.dev.yml up -d