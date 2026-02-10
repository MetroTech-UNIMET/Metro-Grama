dev: start-db migrate 

migrate:
	surrealgo_migrate migrate up	

start-db:
	docker compose -f docker-compose.dev.yml up -d