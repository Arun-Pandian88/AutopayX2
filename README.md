# AutoPayX

**Accept UPI Payments Instantly.**

AutoPayX is a multi-tenant, self-serve SaaS UPI payment gateway for Indian merchants. Merchants sign up, connect their payment provider account (Razorpay), get API keys, and accept UPI payments via hosted checkout pages.

## Quick Start (Development)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)

### Setup

```bash
# Clone and enter the repo
git clone <repo-url> AutoPayX && cd AutoPayX

# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start all services
docker compose up -d

# Run Laravel migrations and seed
docker compose exec api php artisan migrate --seed

# Generate API types for the frontend
docker compose exec web npm run generate-types
```

### Services

| Service | URL | Purpose |
|---|---|---|
| Marketing / Dashboard | http://localhost:3000 | Next.js frontend |
| API | http://localhost:8000 | Laravel API |
| Admin Panel | http://localhost:8000/admin | Filament admin |
| PostgreSQL | localhost:5432 | Database |
| Mailpit | http://localhost:8025 | Email testing |

### Useful Commands

```bash
# Run API tests
docker compose exec api php artisan test

# Run frontend type check
docker compose exec web npm run typecheck

# Run frontend lint
docker compose exec web npm run lint

# View API logs
docker compose logs -f api

# View worker logs
docker compose logs -f worker

# Laravel artisan
docker compose exec api php artisan <command>

# Access PostgreSQL
docker compose exec postgres psql -U autopayx -d autopayx
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture document including ERD, sequence diagrams, and design decisions.

## Project Structure

```
apps/api/       Laravel 12 (API + Filament admin + workers)
apps/web/       Next.js (marketing, dashboard, checkout)
packages/sdk/   PHP and Node SDKs (Phase 4)
docs/           Architecture, security, runbooks
docker/         Docker Compose, Caddyfile, Supervisor configs
```

## License

Proprietary — All rights reserved.
