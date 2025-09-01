# Makefile for TrailBlazer Project

# Variables
DOCKER_COMPOSE = docker-compose
DB_VOLUME = postgres_data
BACKEND_DIR = ./backend

# Default target
.PHONY: help
help:
	@echo "TrailBlazer Project Commands:"
	@echo "  setup  - Setup environment files and create database volume"
	@echo "  start  - Build and start all services"
	@echo "  stop   - Stop all services"
	@echo "  logs   - View logs from all services"
	@echo "  clean  - Remove all containers, volumes, and networks"
	@echo "  db-migrate        - Run database migrations"
	@echo "  db-migrate-down   - Rollback the last migration"
	@echo "  db-migrate-create - Create a new migration file"
	@echo "  db-auto-migrate   - Auto-detect changes and create/run migrations"
	@echo "  create-admin      - Create an admin account (email=admin@example.com password=adminpass)"

# Setup environment and create database volume
.PHONY: setup
setup:
	@echo "Setting up environment..."
	@if [ ! -f ./backend/.env ]; then \
		cp ./backend/.env.template ./backend/.env; \
		echo "Created backend .env file"; \
	fi
	@docker volume create $(DB_VOLUME)
	@echo "Created database volume: $(DB_VOLUME)"
	@echo "Setup complete!"

# Main commands
.PHONY: start
start:
	@docker volume inspect $(DB_VOLUME) >/dev/null 2>&1 || docker volume create $(DB_VOLUME)
	$(DOCKER_COMPOSE) up -d --build

.PHONY: stop
stop:
	$(DOCKER_COMPOSE) down

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker volume rm $(DB_VOLUME) 2>/dev/null || true
	@echo "Cleaned up all resources"

# Development mode
.PHONY: dev
dev:
	@docker volume inspect $(DB_VOLUME) >/dev/null 2>&1 || docker volume create $(DB_VOLUME)
	$(DOCKER_COMPOSE) up

# Database migration commands
.PHONY: db-migrate db-migrate-down db-migrate-create

db-migrate:
	@echo "Running database migrations..."
	$(DOCKER_COMPOSE) exec backend npm run migrate
	@echo "Migrations completed successfully!"

db-migrate-down:
	@echo "Rolling back the last migration..."
	$(DOCKER_COMPOSE) exec backend npm run migrate:down
	@echo "Rollback completed!"

db-migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "Error: Migration name is required. Usage: make db-migrate-create name=migration_name"; \
		exit 1; \
	fi
	@echo "Creating new migration: $(name)"
	$(DOCKER_COMPOSE) exec backend npm run migrate:create $(name)
	@echo "Migration file created!"

# Create a new migration and run it immediately
.PHONY: db-add
db-add:
	@if [ -z "$(name)" ]; then \
		echo "Error: Migration name is required. Usage: make db-add name=migration_name"; \
		exit 1; \
	fi
	@echo "Creating and running migration: $(name)"
	$(DOCKER_COMPOSE) exec backend npm run migrate:create $(name)
	$(DOCKER_COMPOSE) exec backend npm run migrate
	@echo "Migration created and applied successfully!"

# Auto-detect changes and create/run migrations
.PHONY: db-auto-migrate
db-auto-migrate:
	@echo "Auto-detecting schema changes and creating migrations..."
	$(DOCKER_COMPOSE) exec backend node scripts/detect-schema-changes.js
	$(DOCKER_COMPOSE) exec backend npm run migrate:create auto_migration_$(shell date +%Y%m%d%H%M%S)
	@echo "Running migrations..."
	$(DOCKER_COMPOSE) exec backend npm run migrate
	@echo "Auto-migration completed successfully!"

# Check for schema changes without creating migrations
.PHONY: db-check-changes
db-check-changes:
	@echo "Checking for schema changes..."
	$(DOCKER_COMPOSE) exec backend node scripts/detect-schema-changes.js

# Create admin account
.PHONY: create-admin
create-admin:
	@echo "Creating admin account..."
	$(eval EMAIL ?= admin@example.com)
	$(eval PASSWORD ?= admin123)
	$(DOCKER_COMPOSE) exec backend node scripts/create-admin.js "$(EMAIL)" "$(PASSWORD)"
	@echo "Admin account created successfully with email: $(EMAIL) and the provided password."
	@echo "You can now login at /admin/login with these credentials."
