# DevPulse Analytics

A full-stack GitHub analytics dashboard that lets developers track their contributions, repositories, and coding activity — all in one place.

![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20Next.js%20%7C%20PostgreSQL-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

DevPulse Analytics connects to the GitHub API via OAuth and aggregates a developer's activity data — commits, pull requests, issues, and reviews — into a clean, interactive dashboard. Users can visualize their coding streaks, language distribution, weekly velocity, and more. A shareable profile card can be exported as a PNG image.

---

## Features

- **GitHub OAuth 2.0 Authentication** — Secure login flow using OAuth authorization code grant
- **Repository Browser** — Sync, search, filter, and sort all your GitHub repositories
- **Contribution Tracker** — Daily breakdown of commits, PRs, issues, and code reviews over 7, 30, or 90-day windows
- **Analytics & Insights** — Current streak, longest streak, weekly averages, velocity trends, best day of week
- **Data Visualization** — Area charts, bar charts, and language distribution charts using Recharts
- **Shareable Profile Card** — Export a developer summary as a downloadable PNG image
- **Dark Mode** — Full light/dark theme support
- **Rate-Limit Handling** — Automatic retry with backoff when GitHub API limits are hit

---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| Node.js + Express 5 | REST API server |
| TypeScript | Type safety across the entire backend |
| PostgreSQL (Supabase) | Persistent data storage |
| JWT (jsonwebtoken) | Stateless authentication |
| Axios | HTTP client for GitHub API requests |
| Helmet + CORS | Security headers and cross-origin policy |

### Frontend
| Technology | Role |
|---|---|
| Next.js 16 (App Router) | React framework with file-based routing |
| TypeScript | End-to-end type safety |
| TanStack React Query 5 | Server state management and caching |
| Tailwind CSS 4 + shadcn/ui | Styling and component library |
| Recharts | Data visualization (charts) |
| html2canvas | Profile card PNG export |
| Sonner | Toast notifications |
| next-themes | Light/dark mode |

### Infrastructure
| Service | Role |
|---|---|
| Railway | Backend deployment |
| Vercel | Frontend deployment |
| Supabase | Managed PostgreSQL database |
| GitHub OAuth App | Authentication provider |

---

## Architecture

```
┌─────────────────────────────────────┐
│            Frontend (Next.js)        │
│  Landing → OAuth Callback → Dashboard│
│  React Query ←→ Axios API Client     │
└──────────────────┬──────────────────┘
                   │ HTTP (JWT Bearer)
┌──────────────────▼──────────────────┐
│           Backend (Express)          │
│  /api/auth  /api/repos  /api/contributions
│  Controllers → Services → DB (pg)   │
└──────┬──────────────────────────────┘
       │
┌──────▼───────┐    ┌──────────────────┐
│  PostgreSQL   │    │   GitHub REST     │
│  (Supabase)   │    │   API v3 / OAuth  │
└──────────────┘    └──────────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Supabase free tier works)
- A GitHub OAuth App ([create one here](https://github.com/settings/applications/new))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/devpulse-analytics.git
cd devpulse-analytics
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5001
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5001/api/auth/github/callback
JWT_SECRET=your_random_secret_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
```

### 3. Set up the database

Run the SQL schema against your Supabase (or any PostgreSQL) database:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id INT UNIQUE NOT NULL,
  username VARCHAR NOT NULL,
  email VARCHAR,
  avatar_url VARCHAR,
  access_token VARCHAR NOT NULL,
  github_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id INT NOT NULL,
  name VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  description TEXT,
  language VARCHAR,
  stars INT DEFAULT 0,
  forks INT DEFAULT 0,
  open_issues INT DEFAULT 0,
  watchers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, github_repo_id)
);

CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  commit_count INT DEFAULT 0,
  pr_count INT DEFAULT 0,
  issue_count INT DEFAULT 0,
  review_count INT DEFAULT 0,
  UNIQUE(user_id, date)
);
```

### 4. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5001`.

### 5. Configure and start the frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3001`.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/github` | Redirect to GitHub OAuth |
| GET | `/api/auth/github/callback` | OAuth callback, issues JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/logout` | Logout |

### Repositories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/repos` | List all repos for current user |
| GET | `/api/repos/:id` | Get single repo by ID |
| POST | `/api/repos/sync` | Sync repos from GitHub |

### Contributions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/contributions?days=30` | Get contribution stats |
| POST | `/api/contributions/sync?days=30` | Sync contributions from GitHub |

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Project Structure

```
devpulse-analytics/
├── backend/
│   └── src/
│       ├── config/          # env config, DB connection pool
│       ├── controllers/     # auth, repos, contributions
│       ├── middleware/      # JWT auth, global error handler
│       ├── routes/          # Express routers
│       ├── services/        # GitHub API integration
│       ├── errors/          # Custom AppError classes
│       ├── utils/           # ctrlWrapper, dateRange
│       └── server.ts        # App entry point
│
└── frontend/
    └── src/
        ├── app/             # Next.js App Router pages
        │   ├── (auth)/      # OAuth callback route
        │   └── (dashboard)/ # Protected dashboard pages
        ├── components/      # UI, dashboard, profile, repos
        ├── hooks/           # useRepos, useContributions, useAuth
        ├── providers/       # AuthProvider, QueryProvider
        ├── lib/             # api-client, contribution-insights
        └── types/           # TypeScript interfaces
```

---

## Deployment

The application is deployed on:

- **Backend**: [Railway](https://railway.app) — builds and deploys from the `/backend` directory
- **Frontend**: [Vercel](https://vercel.com) — deploys from the `/frontend` directory
- **Database**: [Supabase](https://supabase.com) — managed PostgreSQL

Set the same environment variables in your Railway and Vercel project dashboards.

---

## License

MIT
