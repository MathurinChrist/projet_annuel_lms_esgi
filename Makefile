# Makefile for LMS Backend - Nuxt.js & Prisma Platform

# Define colors for beautiful console output
BLUE   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
RED    := \033[31m
RESET  := \033[0m

# Detect environment variables
ENV_FILE := .env

.PHONY: help install setup-env init-db dev build preview \
	docker-up docker-db-up docker-down docker-build docker-logs docker-status docker-clean \
	db-migrate db-push db-generate db-seed db-studio db-reset \
	checkout-dev feature commit

# Default target: display help
help:
	@echo "$(BLUE)======================================================================$(RESET)"
	@echo "                  LMS NUXT API - MAKEFILE CONSOLE                     "
	@echo "$(BLUE)======================================================================$(RESET)"
	@echo "Usage: make $(GREEN)[target]$(RESET)"
	@echo ""
	@echo "$(YELLOW)Project Setup & Installation:$(RESET)"
	@echo "  $(GREEN)install$(RESET)          Setup env, install dependencies, generate Prisma client"
	@echo "  $(GREEN)setup-env$(RESET)        Copy .env.example to .env (does not overwrite)"
	@echo "  $(GREEN)init-db$(RESET)          Run migrations and seed the database"
	@echo ""
	@echo "$(YELLOW)Docker Operations:$(RESET)"
	@echo "  $(GREEN)docker-up$(RESET)        Start the entire stack (App, DB, pgAdmin)"
	@echo "  $(GREEN)docker-db-up$(RESET)     Start DB & pgAdmin only (useful for local dev)"
	@echo "  $(GREEN)docker-down$(RESET)       Stop all services"
	@echo "  $(GREEN)docker-build$(RESET)      Rebuild all service containers"
	@echo "  $(GREEN)docker-logs$(RESET)       Stream logs of running containers"
	@echo "  $(GREEN)docker-status$(RESET)     Display current container statuses"
	@echo "  $(GREEN)docker-clean$(RESET)      Stop services and delete all persistent volumes"
	@echo ""
	@echo "$(YELLOW)Local Development:$(RESET)"
	@echo "  $(GREEN)dev$(RESET)               Start the Nuxt local development server"
	@echo "  $(GREEN)build$(RESET)             Build the Nuxt application for production"
	@echo "  $(GREEN)preview$(RESET)           Preview production build"
	@echo ""
	@echo "$(YELLOW)Database & Prisma (Local):$(RESET)"
	@echo "  $(GREEN)db-migrate$(RESET)       Create and run Prisma migrations"
	@echo "  $(GREEN)db-push$(RESET)          Directly push schema changes without migration history"
	@echo "  $(GREEN)db-generate$(RESET)      Regenerate Prisma client files"
	@echo "  $(GREEN)db-seed$(RESET)          Generate seed data"
	@echo "  $(GREEN)db-studio$(RESET)        Open Prisma Studio GUI in browser"
	@echo "  $(GREEN)db-reset$(RESET)         Wipe database, run migrations, and re-seed"
	@echo ""
	@echo "$(YELLOW)Git Helpers:$(RESET)"
	@echo "  $(GREEN)checkout-dev$(RESET)     Checkout to develop and pull latest changes"
	@echo "  $(GREEN)feature name=x$(RESET)    Create and switch to feature/<name> branch"
	@echo "  $(GREEN)commit$(RESET)           View commit styling conventions"

# Setup & Installation
setup-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		cp .env.example $(ENV_FILE); \
		echo "$(GREEN)Created .env from .env.example$(RESET)"; \
	else \
		echo "$(YELLOW).env already exists, skipping copy.$(RESET)"; \
	fi

install: setup-env
	@echo "$(BLUE)Installing npm dependencies...$(RESET)"
	npm install
	@echo "$(BLUE)Generating Prisma Client...$(RESET)"
	npx prisma generate

init-db: setup-env
	@echo "$(BLUE)Running db-migrate...$(RESET)"
	npx prisma migrate dev --name init
	@echo "$(BLUE)Running db-seed...$(RESET)"
	npx prisma db seed

# Docker Operations
docker-up:
	@echo "$(BLUE)Starting all containers...$(RESET)"
	docker compose up -d
	@echo "$(GREEN)App: http://localhost:3000$(RESET)"
	@echo "$(GREEN)pgAdmin: http://localhost:5050$(RESET)"

docker-db-up:
	@echo "$(BLUE)Starting Database & pgAdmin...$(RESET)"
	docker compose up -d db pgadmin
	@echo "$(GREEN)Database ready. pgAdmin: http://localhost:5050$(RESET)"

docker-down:
	@echo "$(BLUE)Stopping all containers...$(RESET)"
	docker compose down

docker-build:
	@echo "$(BLUE)Building containers...$(RESET)"
	docker compose build

docker-logs:
	@echo "$(BLUE)Streaming docker logs...$(RESET)"
	docker compose logs -f

docker-status:
	@echo "$(BLUE)Container status:$(RESET)"
	docker compose ps

docker-clean:
	@echo "$(RED)Cleaning up Docker assets (stopping and purging database volumes)...$(RESET)"
	docker compose down -v

# Local Development
dev: setup-env
	@echo "$(BLUE)Starting local development server...$(RESET)"
	npm run dev

build:
	@echo "$(BLUE)Building production bundle...$(RESET)"
	npm run build

preview:
	@echo "$(BLUE)Previewing production server...$(RESET)"
	npm run preview

# Database & Prisma (Local)
db-migrate: setup-env
	@echo "$(BLUE)Creating migration...$(RESET)"
	npx prisma migrate dev

db-push: setup-env
	@echo "$(BLUE)Pushing schema changes...$(RESET)"
	npx prisma db push

db-generate:
	@echo "$(BLUE)Generating Prisma Client...$(RESET)"
	npx prisma generate

db-seed: setup-env
	@echo "$(BLUE)Seeding database...$(RESET)"
	npx prisma db seed

db-studio: setup-env
	@echo "$(BLUE)Launching Prisma Studio...$(RESET)"
	npx prisma studio

db-reset: setup-env
	@echo "$(RED)Resetting database (this will delete all data)...$(RESET)"
	npx prisma migrate reset --force
	@echo "$(GREEN)Database successfully reset and seeded.$(RESET)"

# Git Helpers
checkout-dev:
	@echo "$(BLUE)Switching to develop and pulling latest updates...$(RESET)"
	git checkout develop
	git pull origin develop

feature:
	@if [ -z "$(name)" ]; then \
		echo "$(RED)Error: You must specify a branch name, e.g. make feature name=login-form$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Switching to develop branch...$(RESET)"
	git checkout develop
	@echo "$(BLUE)Pulling latest changes...$(RESET)"
	git pull origin develop
	@echo "$(BLUE)Creating and switching to branch feature/$(name)...$(RESET)"
	git checkout -b feature/$(name)
	@echo "$(GREEN)Successfully switched to feature/$(name)$(RESET)"

commit:
	@echo "$(BLUE)=========================================$(RESET)"
	@echo "      GIT COMMIT CONVENTIONS (ENGLISH)   "
	@echo "$(BLUE)=========================================$(RESET)"
	@echo "Format: $(YELLOW)<type>(<scope>): <short description>$(RESET)"
	@echo ""
	@echo "$(YELLOW)Types:$(RESET)"
	@echo "  $(GREEN)feat$(RESET)      : New feature"
	@echo "  $(GREEN)fix$(RESET)       : Bug fix"
	@echo "  $(GREEN)refactor$(RESET)  : Code optimization/reorganization"
	@echo "  $(GREEN)style$(RESET)     : Formatting, minor styling updates"
	@echo "  $(GREEN)docs$(RESET)      : Documentation changes"
	@echo "  $(GREEN)chore$(RESET)     : Build config, devDependencies, updates"
	@echo ""
	@echo "$(YELLOW)Examples:$(RESET)"
	@echo "  feat(user-auth): add JWT login endpoint"
	@echo "  fix(sidebar): restore active state after locale change"
	@echo "  refactor(course-list): extract CourseCard component"
	@echo "  docs(readme): add troubleshooting section"
