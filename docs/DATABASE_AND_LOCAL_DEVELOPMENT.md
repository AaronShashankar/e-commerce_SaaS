# Database and local development report

## What database this project uses

The backend uses PostgreSQL through Prisma. The schema is in `backend/prisma/schema.prisma` and defines:

| Table | Purpose |
| --- | --- |
| `User` | Login identity, password hash, role, active status, and timestamps. |
| `SellerProfile` | Seller business details and approval status (`pending`, `approved`, or `rejected`). |
| `BuyerProfile` | Buyer-specific profile linked one-to-one with a user. |

The initial migration is committed at `backend/prisma/migrations/20260718000000_initial_auth/migration.sql`.

## Connect the backend to PostgreSQL

1. Ensure PostgreSQL is running.
2. Create a database called `ecommerce_saas`:

   ```powershell
   psql -U postgres -c "CREATE DATABASE ecommerce_saas;"
   ```

3. Open `backend/.env` and use a normal PostgreSQL URL. Replace `YOUR_PASSWORD` with your actual PostgreSQL password:

   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecommerce_saas?schema=public"
   JWT_ACCESS_SECRET="use_a_long_random_value"
   JWT_REFRESH_SECRET="use_a_different_long_random_value"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="a_password_with_at_least_8_characters"
   PORT=5000
   CLIENT_URL="http://localhost:5173"
   ADMIN_URL="http://localhost:5174"
   ```

4. Create the tables and the admin account:

   ```powershell
   cd backend
   yarn prisma:generate
   yarn prisma migrate deploy
   yarn prisma:seed
   ```

## How to view the database

### Recommended: Prisma Studio

Prisma Studio gives you a browser interface for all project tables:

```powershell
cd backend
yarn prisma:studio
```

It normally opens `http://localhost:5555`. Select `User`, `SellerProfile`, or `BuyerProfile` in the left sidebar to view and edit data.

### PostgreSQL command line

```powershell
psql -U postgres -d ecommerce_saas
```

Inside the PostgreSQL shell:

```sql
\dt
SELECT id, email, role, "isActive", "createdAt" FROM "User";
SELECT "businessName", "approvalStatus" FROM "SellerProfile";
```

You can also use pgAdmin or TablePlus. Connect with the same host, port, username, password, and database name from `DATABASE_URL`.

## Run the backend only

First install packages once:

```powershell
cd backend
yarn install
```

Then start the API:

```powershell
yarn dev
```

The API is running when `http://localhost:5000/api/health` returns:

```json
{ "status": "ok" }
```

## Run all apps with Make

This project includes a root `Makefile`. It starts the API, client, and admin app concurrently:

```powershell
make dev
```

The apps use these addresses:

- Backend: `http://localhost:5000`
- Buyer/seller client: `http://localhost:5173`
- Admin: `http://localhost:5174`

Useful database commands:

```powershell
make prisma-generate
make db-migrate
make db-deploy
make db-seed
make db-studio
make build
```

`make` is not currently installed on this Windows machine. Install GNU Make first, for example with Chocolatey:

```powershell
choco install make
```

Close and reopen PowerShell after installation. If you do not want to install Make, run the three commands below in separate terminals:

```powershell
cd backend; yarn dev
cd client; yarn dev
cd admin; yarn dev
```

## Important checks before running

- Do not use the placeholder database URL or JWT values from `.env.example`.
- Do not commit `backend/.env`, `client/.env`, or `admin/.env`.
- Run migrations before starting the API for the first time.
- Run the seed command once to create the admin login account.
