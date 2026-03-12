# fashop
Fashion shop

## Deploy on Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/from-repo?repo=https%3A%2F%2Fgithub.com%2Fmaithanhduyan%2Ffashop)

### Monorepo Setup

This project contains 2 services that need to be deployed separately on Railway:

| Service | Root Directory | Description |
|---------|---------------|-------------|
| **API** | `apps/api` | Go backend (port 8080) |
| **Web** | `apps/web` | Next.js frontend (port 3000) |

### Steps to deploy:

1. Click the **Deploy on Railway** button above
2. Railway will create a project — by default it picks up the root `railway.json`
3. **Add a second service** for the web app:
   - In Railway dashboard → **New Service** → select the same repo
   - Set **Root Directory** to `apps/web`
4. **Update the first service** (API):
   - Set **Root Directory** to `apps/api`
5. Set environment variables for each service:

   **API** (`apps/api`):
   - `DATABASE_URL` — PostgreSQL connection string
   - `REDIS_URL` — Redis connection string
   - `JWT_SECRET` — Secret for JWT tokens
   - `PORT` — `8080`

   **Web** (`apps/web`):
   - `NEXT_PUBLIC_API_URL` — Public URL of the API service
