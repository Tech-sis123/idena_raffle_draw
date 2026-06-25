# IDENA Raffle Web App

A full-stack raffle/giveaway application built with React, TailwindCSS, Express, and PostgreSQL (via Prisma).

## Architecture
This project is a monorepo containing:
- `client`: The frontend React application built with Vite and TailwindCSS.
- `server`: The backend Express server with Prisma ORM and Resend for emails.

## Setup Instructions

### 1. Database Setup
Ensure you have PostgreSQL installed and running. Create a database for the project.

### 2. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the variables:
   ```bash
   cp .env.example .env
   ```
   *Make sure to update `DATABASE_URL` with your actual Postgres connection string, and set `RESEND_API_KEY` and `ADMIN_KEY`.*
4. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma db push
   ```
   *(Or `npx prisma migrate dev --name init` if you want to use migration files).*
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will be running on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will typically run on `http://localhost:5173`.

---

## Admin Dashboard
Access the admin dashboard at `http://localhost:5173/admin`.
You will be prompted to enter the `ADMIN_KEY` defined in your backend `.env` file.

From the admin dashboard, you can:
- View all registered participants
- Draw winners (1, 5, or 10)
- Export participants to a CSV file

---

## Deployment Notes

### Frontend (Vercel)
The `client` directory can be deployed directly to Vercel.
1. Connect your GitHub repository to Vercel.
2. Set the Root Directory to `client`.
3. Vercel will automatically detect the Vite React app and use the correct build settings (`npm run build`, Output Directory: `dist`).

### Backend (Render)
The `server` directory can be deployed as a Web Service on Render.
1. Connect your GitHub repository to Render.
2. Set the Root Directory to `server`.
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`
5. In the Environment tab, add your `.env` variables (`DATABASE_URL`, `RESEND_API_KEY`, `ADMIN_KEY`).
6. You can also provision a PostgreSQL database directly on Render and connect it.
