# Project Setup Guide

Step-by-step commands to scaffold the monorepo: `backend`, `client`, `admin`. Follow in order — each section assumes the previous one is done.

---

## 0. Prerequisites

Check these are installed before starting:

```bash
node -v      # v18+ recommended
yarn -v
psql --version   # or confirm PostgreSQL is running via a GUI (pgAdmin/TablePlus)
git --version
```

Create a local database (name it whatever you like, `ecommerce_saas` used below):

```bash
psql -U postgres
CREATE DATABASE ecommerce_saas;
\q
```

---

## 1. Root folder

```bash
mkdir ecommerce-saas && cd ecommerce-saas
git init
```

Create a root `.gitignore`:

```bash
cat > .gitignore << 'EOF'
node_modules/
.env
dist/
build/
.DS_Store
EOF
```

You'll end up with:

```
ecommerce-saas/
├── backend/
├── client/
├── admin/
└── .gitignore
```

---

## 2. Backend setup

```bash
mkdir backend && cd backend
yarn init -y
```

Install dependencies:

```bash
yarn add express cors dotenv bcryptjs jsonwebtoken multer cookie-parser zod
yarn add -D nodemon prisma
```

Initialize Prisma:

```bash
yarn prisma init
```

This creates `prisma/schema.prisma` and a `.env` file. Set the `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecommerce_saas?schema=public"
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
PORT=5000
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

Create the folder structure:

```bash
mkdir -p src/config src/controllers src/routes src/middleware src/services src/validators src/utils
touch src/app.js src/server.js
```

Add dev script to `package.json`:

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

Minimal `src/app.js` to confirm things work:

```js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;
```

Minimal `src/server.js`:

```js
const app = require("./app");
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

Test it:

```bash
yarn dev
# visit http://localhost:5000/api/health -> should return {"status":"ok"}
```

---

## 3. Define the Prisma schema

Open `prisma/schema.prisma` and set the generator/datasource, then add your models (from the report's ER design — `User`, `SellerProfile`, `BuyerProfile`, `Product`, `Order`, `OrderItem`, etc.). Start minimal — just `User` — to confirm migrations work, then expand:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  seller
  buyer
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Run the first migration:

```bash
yarn prisma migrate dev --name init
```

This creates the table in Postgres and generates the Prisma Client. Verify visually:

```bash
yarn prisma studio
```

> Add the rest of the models (SellerProfile, Product, Order, etc.) incrementally, running `prisma migrate dev --name <change>` after each meaningful addition — don't try to write the entire schema in one shot.

---

## 4. Client setup (buyer + seller React app)

From the project root:

```bash
cd ..
yarn create vite client --template react
cd client
yarn install
```

Install Tailwind:

```bash
yarn add -D tailwindcss postcss autoprefixer
yarn tailwindcss init -p
```

Configure `tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Add to `src/index.css` (top of file):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Install routing and API libraries:

```bash
yarn add react-router-dom axios
```

Create the folder structure:

```bash
mkdir -p src/api src/components/common src/components/buyer src/components/seller
mkdir -p src/context src/pages/auth src/pages/buyer src/pages/seller src/routes src/hooks
```

Add `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Set the dev port explicitly in `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

Test it:

```bash
yarn dev
# visit http://localhost:5173
```

---

## 5. Admin setup (separate React app)

From the project root:

```bash
cd ..
yarn create vite admin --template react
cd admin
yarn install
yarn add -D tailwindcss postcss autoprefixer
yarn tailwindcss init -p
yarn add react-router-dom axios
```

Same Tailwind config/`index.css` changes as the client app.

Set a **different** port in `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
});
```

Add `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Folder structure:

```bash
mkdir -p src/api src/components/common src/components/charts src/components/tables
mkdir -p src/pages src/context src/routes
```

Test it:

```bash
yarn dev
# visit http://localhost:5174
```

---

## 6. Running everything together

You'll need three terminal tabs (or use a tool like `concurrently` in a root `package.json` later):

```bash
# Terminal 1
cd backend && yarn dev

# Terminal 2
cd client && yarn dev

# Terminal 3
cd admin && yarn dev
```

At this point you should have:
- `http://localhost:5000/api/health` → `{"status":"ok"}`
- `http://localhost:5173` → Vite React default page (client)
- `http://localhost:5174` → Vite React default page (admin)
- `yarn prisma studio` → showing your `User` table in Postgres

That's the skeleton wired up end to end. Next step from here is Phase 2 from the report: building the actual auth routes (register/login/JWT) — happy to scaffold that next when you're ready.