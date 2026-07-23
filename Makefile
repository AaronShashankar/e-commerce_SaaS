.PHONY: dev backend-dev client-dev admin-dev db-migrate db-deploy db-seed db-studio prisma-generate build

# Starts the API, buyer/seller app, and admin app together. Press Ctrl+C to stop them.
dev:
	@$(MAKE) --no-print-directory -j 3 backend-dev client-dev admin-dev

backend-dev:
	@echo Starting backend at http://localhost:5000
	@cd backend && yarn dev

client-dev:
	@echo Starting client at http://localhost:5173
	@cd client && yarn dev

admin-dev:
	@echo Starting admin at http://localhost:5174
	@cd admin && yarn dev

prisma-generate:
	@cd backend && yarn prisma:generate

db-migrate:
	@cd backend && yarn prisma:migrate

db-deploy:
	@cd backend && yarn prisma migrate deploy

db-seed:
	@cd backend && yarn prisma:seed

db-studio:
	@cd backend && yarn prisma:studio

build:
	@cd client && yarn build
	@cd admin && yarn build
