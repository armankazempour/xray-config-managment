# Xray Config Repository Manager

A lightweight, self-hosted web application for managing access to an Xray VPN configuration repository.

## Features

- **Admin Panel** — Modern glassmorphism dark UI with dashboard, user management, and file repository
- **User Management** — Create, edit, delete, suspend, and reactivate users with time-limited subscriptions
- **Repository** — Upload and manage Xray config files (.json, .txt, .conf, .yaml, etc.)
- **Token-Based Access** — Each user gets a unique URL to access repository files
- **Auto-Expiry** — Users automatically lose access when their subscription expires
- **Password Protection** — All passwords are hashed with bcrypt
- **JWT Authentication** — Secure API endpoints with JSON Web Tokens

## Quick Install

```bash
git clone <repo-url>
cd xray-config-manager
bash install.sh
```

The install script will:
1. Install Docker if not present
2. Build the application
3. Start all services
4. Display access credentials

## Default Credentials

- **URL:** `http://SERVER_IP:8080`
- **Username:** `admin`
- **Password:** `admin123`

> ⚠️ Change the default password after first login!

## User Access

Each user receives a unique access URL:

```
GET /api/repo/{user_token}
```

This returns a list of available files. To download a specific file:

```
GET /api/repo/{user_token}?file={filename}
```

Access is denied (HTTP 403) if:
- Token is invalid
- Subscription has expired
- Account is suspended

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** JWT + bcrypt
- **UI:** TailwindCSS 4 + Lucide Icons
- **Deployment:** Docker + Docker Compose

## API Endpoints

### Auth
- `POST /api/auth/login` — Admin login
- `POST /api/auth/change-password` — Change admin password

### Users (Admin only)
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `GET /api/users/:id` — Get user details
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user
- `POST /api/users/:id/action` — Suspend/Reactivate/Extend/Expire

### Repository (Admin only)
- `GET /api/files` — List uploaded files
- `POST /api/files` — Upload file
- `GET /api/files/:id` — Download file
- `DELETE /api/files/:id` — Delete file

### Public Access
- `GET /api/repo/:token` — List files (user token required)
- `GET /api/repo/:token?file=name` — Download file (user token required)

## Docker Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Rebuild
docker compose up -d --build
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/app_db` | PostgreSQL connection string |
| `JWT_SECRET` | `xray-repo-manager-jwt-secret-change-me` | JWT signing secret |
| `ADMIN_USERNAME` | `admin` | Default admin username |
| `ADMIN_PASSWORD` | `admin123` | Default admin password |

## License

MIT
