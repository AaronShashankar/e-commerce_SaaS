# Running and deploying the project

## Local prerequisites

- Node.js 20 or later and Yarn
- PostgreSQL 15 or later, running locally

Create a database named `ecommerce_saas` in pgAdmin or with:

```powershell
psql -U postgres -c "CREATE DATABASE ecommerce_saas;"
```

## First-time setup

From the repository root, install packages separately for each app:

```powershell
cd backend; yarn install
cd ../client; yarn install
cd ../admin; yarn install
```

Create the environment files from the examples. On PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item client/.env.example client/.env
Copy-Item admin/.env.example admin/.env
```

Edit `backend/.env` and set the PostgreSQL password in `DATABASE_URL`. Replace both JWT secrets with long, unique random values and choose an `ADMIN_EMAIL` and an `ADMIN_PASSWORD` of at least eight characters. Do not commit any `.env` file.

Create the tables, generate Prisma Client, and create the sole admin account:

```powershell
cd backend
yarn prisma:generate
yarn prisma migrate deploy
yarn prisma:seed
```

`prisma migrate deploy` applies the committed initial migration. During schema development, use `yarn prisma:migrate --name your_change` instead.

## Start locally

Open three terminals from the repository root:

```powershell
cd backend; yarn dev
cd client; yarn dev
cd admin; yarn dev
```

Open these URLs:

- API health check: `http://localhost:5000/api/health`
- Buyer/seller application: `http://localhost:5173`
- Admin application: `http://localhost:5174`

## Quick auth test

Register a buyer or seller from the client at `/register`. Sellers receive `pending` approval and are directed to the pending page after login. Use the seeded credentials only in the admin app. The API can also be tested with curl:

```powershell
curl.exe -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"email":"buyer@example.com","password":"password123","role":"buyer"}'
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"buyer@example.com","password":"password123"}'
```

## Put it on the web

Deploy three services: the Express API, client static site, and admin static site. A simple combination is Render for the API/PostgreSQL and Vercel or Netlify for the two Vite sites.

1. Push this repository to GitHub. Never push `.env` files.
2. Provision a managed PostgreSQL database. Put its full connection string in the API service's `DATABASE_URL` environment variable.
3. Deploy `backend` as a Node web service. Set build command `yarn install && yarn prisma:generate && yarn prisma migrate deploy`; set start command `yarn start`.
4. Set API environment variables: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NODE_ENV=production`, `PORT` (if the host requires it), plus the two front-end URLs for `CLIENT_URL` and `ADMIN_URL`. Run `yarn prisma:seed` once from the host shell or as a controlled release task.
5. Deploy `client` and `admin` separately as static sites. Each uses build command `yarn install && yarn build` and output directory `dist`. Set `VITE_API_BASE_URL` to `https://YOUR-API-DOMAIN/api` before building.
6. Update `CLIENT_URL` and `ADMIN_URL` on the API to the final HTTPS deployment URLs, then redeploy the API.

The API sets refresh-token cookies with `Secure` and `SameSite=None` in production, which allows the two HTTPS front ends to use the API cross-origin. All three sites must use HTTPS in production.

## Before demonstration or deployment

- Verify `/api/health` returns `{ "status": "ok" }`.
- Test buyer registration/login, seller registration/login (pending page), and admin login.
- Change the default example values in `backend/.env`.
- Add an admin-only seller approval endpoint and product/order features before presenting the full marketplace workflow; this scaffold intentionally covers the requested authentication foundation.
