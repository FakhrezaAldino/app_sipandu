# PKH Backend

Backend API server for Manajemen Data KPM application.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (recommended) or PostgreSQL installed locally

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Default credentials work with Docker Compose, no changes needed for dev
```

### Database Setup with Docker Compose (Recommended)

```bash
# Start PostgreSQL and Adminer
docker compose up -d

# PostgreSQL runs on localhost:5432
# Adminer (DB admin UI) runs on localhost:8080
```

### Database Migrations

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Running the Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/sign-up/email` - Register
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get session

### Users (`/api/users`) - Admin only
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PATCH /api/users/:id/role` - Update role
- `DELETE /api/users/:id` - Delete user

### Kelompok (`/api/kelompok`)
- `GET /api/kelompok` - List kelompok
- `POST /api/kelompok` - Create kelompok
- `GET /api/kelompok/:id` - Get kelompok
- `PATCH /api/kelompok/:id` - Update kelompok
- `DELETE /api/kelompok/:id` - Delete kelompok
- `GET /api/kelompok/:id/stats` - Get statistics

### KPM (`/api/kpm`)
- `GET /api/kelompok/:kelompokId/kpm` - List KPM in kelompok
- `POST /api/kelompok/:kelompokId/kpm` - Add KPM
- `GET /api/kpm/:id` - Get KPM
- `PATCH /api/kpm/:id` - Update KPM
- `DELETE /api/kpm/:id` - Delete KPM

### Absensi, Usaha, Prestasi, Permasalahan, Graduasi
Similar CRUD endpoints following the same pattern.

### Reports (`/api/reports`)
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/kelompok/:id` - Kelompok report
- `GET /api/reports/kelompok/:id/pdf` - Export PDF

## Project Structure

```
src/
├── config/         # Environment configuration
├── db/             # Database connection & schema
│   └── schema/     # Drizzle schema files
├── lib/            # Shared libraries (auth, utils)
├── middleware/     # Express middleware
├── modules/        # Feature modules
│   ├── kelompok/
│   ├── kpm/
│   ├── absensi/
│   ├── usaha/
│   ├── prestasi/
│   ├── permasalahan/
│   ├── graduasi/
│   ├── reports/
│   └── users/
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | Environment (development/production) |
| `BETTER_AUTH_SECRET` | Auth secret key |
| `BETTER_AUTH_URL` | Auth base URL |
| `FRONTEND_URL` | Frontend URL for CORS |
