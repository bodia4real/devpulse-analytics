# DevPulse – Project Plan

> **Status:** Core app complete. Backend + Next.js frontend with auth, dashboard, repos, contributions, profile. Ready for deployment and polish.

---

## Phase 1: Backend Setup & Database

### Project Initialization
- [x] Create project structure (backend/src with config, routes, controllers, middleware, types folders)
- [x] Initialize Node.js project with TypeScript
- [x] Install dependencies: express, pg, dotenv, cors, typescript, @types packages
- [x] Configure tsconfig.json
- [x] Set up nodemon for development

### Database Setup
- [x] Create Supabase project
- [x] Get PostgreSQL connection string
- [x] Create users table (id, github_id, username, email, avatar_url, access_token, timestamps)
- [x] Create repos table (id, user_id, github_repo_id, name, full_name, description, language, stars, forks, open_issues, watchers, timestamps)
- [x] Create contributions table (id, user_id, date, commit_count, pr_count, issue_count, review_count, timestamp); if table already exists without review_count, add a DB migration to add the column
- [x] Add indexes for performance
- [x] Create database connection pool in src/config/database.ts
- [x] Test database connection

### Basic Server
- [x] Create Express server in src/server.ts
- [x] Add CORS configuration
- [x] Create health check endpoint (GET /api/health)
- [x] Test server runs and connects to DB

---

## Phase 2: Authentication (GitHub OAuth)

### GitHub OAuth Setup
- [x] Register GitHub OAuth App (get Client ID and Secret)
- [x] Set callback URL: http://localhost:5001/api/auth/github/callback
- [x] Store credentials in .env file

### Auth Implementation
- [x] Install jsonwebtoken and axios
- [x] Create auth routes file (src/routes/auth.router.ts)
- [x] Implement GET /api/auth/github (redirect to GitHub OAuth)
- [x] Implement GET /api/auth/github/callback:
  - [x] Receive code from GitHub
  - [x] Exchange code for access token
  - [x] Fetch user data from GitHub API
  - [x] Store/update user in database
  - [x] Generate JWT token
  - [x] Return JWT to frontend
- [x] Create auth middleware (src/middleware/auth.middleware.ts) to verify JWT
- [x] Implement GET /api/auth/me (protected endpoint to get current user)
- [x] Implement POST /api/auth/logout
- [x] Test full OAuth flow

---

## Phase 3: GitHub API Integration - Repositories

### GitHub Service
- [x] Create GitHub API client (src/services/github.service.ts)
- [x] Implement fetchUserRepos(accessToken) - fetch all repos from GitHub
- [x] Implement fetchRepoDetails(owner, repo, accessToken) - get single repo
- [x] Handle GitHub API rate limiting
- [x] Add error handling for API failures

### Repo Endpoints
- [x] Create repos routes (src/routes/repos.routes.ts)
- [x] Implement GET /api/repos (fetch all user repos from DB, protected)
- [x] Implement GET /api/repos/:id (get specific repo details, protected)
- [x] Implement POST /api/repos/sync (sync repos from GitHub to DB, protected):
  - [x] Fetch repos from GitHub API
  - [x] Compare with existing DB records
  - [x] Insert new repos
  - [x] Update existing repos (stars, forks, issues, etc.)
  - [x] Return sync result
- [x] Test repo endpoints

---

## Phase 4: Contributions Tracking

### Contributions Service (REST API only)
- [x] Research GitHub REST API endpoints for contribution data (4 types):
  - Commits: Search API `author:username committer-date:>=YYYY-MM-DD` (all repos); fallback to per-repo
  - Pull requests: `GET /search/issues?q=author:{username} type:pr created:>=YYYY-MM-DD`
  - Issues: `GET /search/issues?q=author:{username} type:issue created:>=YYYY-MM-DD`
  - Reviews: `GET /users/{username}/events` — filter `PullRequestReviewEvent`
- [x] Create contributions service (src/services/contributions.service.ts)
- [x] Implement fetchUserContributions(username, accessToken, days) using REST endpoints
- [x] Parse and structure contribution data (commits, PRs, issues, reviews per day); handle rate limits and pagination
- [x] Parallel batch commits (5 at a time) for faster sync

### Contributions Endpoints
- [x] Create contributions routes (src/routes/contributions.routes.ts)
- [x] Implement GET /api/contributions?days=30 (get last N days from DB, protected)
- [x] Implement POST /api/contributions/sync (sync from GitHub, protected):
  - [x] Fetch contribution data from GitHub
  - [x] Store daily stats in contributions table
  - [x] Handle duplicates (upsert)
- [x] Test contributions endpoints

---

## Phase 5: Additional Backend Features

### Repo Comparison
- [ ] Implement GET /api/repos/compare?ids=1,2,3 (compare multiple repos)
- [ ] Return comparative data (stars, forks, growth, etc.)

### Statistics Aggregation
- [ ] Create stats endpoint GET /api/stats/overview (total stars, total repos, languages, etc.)
- [ ] Implement language distribution calculation
- [ ] Add caching if needed for performance

---

## Phase 6: Frontend Setup

### Next.js Project Initialization
- [x] Create Next.js app with TypeScript (App Router)
- [x] Install dependencies: axios, @tanstack/react-query, recharts, shadcn/ui, tailwind
- [x] Set up project structure (components, hooks, lib, types, providers)
- [x] Configure environment variables (API base URL)

### Routing & Layout
- [x] Set up Next.js App Router
- [x] Create main Layout (sidebar, topbar, mobile nav)
- [x] Create route structure (/, /dashboard, /repos, /contributions, /profile)
- [x] Implement protected route wrapper

### Authentication Flow
- [x] Create API client with axios instance
- [x] Implement token storage (localStorage)
- [x] Create axios interceptor to attach JWT to requests
- [x] Create AuthProvider for auth state
- [x] Build landing page with "Login with GitHub" button
- [x] Handle OAuth callback (extract JWT from URL, store it, redirect)
- [x] Build logout functionality
- [x] Test login/logout flow

---

## Phase 7: Core Frontend Features

### Dashboard
- [x] Create Dashboard page component
- [x] Fetch user data (GET /api/auth/me)
- [x] Display user info (avatar, username)
- [x] Add "Sync Repos" and "Sync Contributions" buttons
- [x] Show loading states (skeleton loaders)
- [x] Handle errors and empty states

### Repo List View
- [x] Create RepoList / RepoGrid component
- [x] Fetch repos from API (GET /api/repos)
- [x] Display repos in a grid: Name, description; Stars, forks, issues; Language badge
- [x] Add sorting and filtering by language
- [x] Implement search functionality
- [ ] Add pagination if needed (optional for large repo counts)

### Repo Detail View
- [ ] Create RepoDetail page (GET /api/repos/:id) — optional enhancement

### Profile & Shareable Card
- [x] Create Profile page with developer stats
- [x] Shareable card: repos, stars, forks, contributions, streak, best streak
- [x] Top languages and activity highlights
- [x] Export as PNG (canvas-based, no overlap)

---

## Phase 8: Data Visualization

### Charts Library Setup
- [x] Install recharts
- [x] Create reusable Chart components

### Contribution Charts
- [x] Fetch contribution data (GET /api/contributions?days=30)
- [x] Create line chart: commits over time
- [x] Create bar chart: PRs, Issues, and Reviews
- [x] Create area chart: total contributions trend
- [x] Add date range selector (7, 30, 90 days)
- [x] Productivity insights (streak, velocity, best day, weekly avg)

### Repository Analytics
- [x] Create language distribution chart (top languages)
- [x] Display recent repos and stats
- [ ] Stars growth chart (if tracking history) — optional

---

## Phase 9: Repo Comparison Feature (Optional)

### Comparison UI
- [ ] Create Compare page (requires backend GET /api/repos/compare)
- [ ] Add repo multi-select from user's repos
- [ ] Display side-by-side comparison table
- [ ] Create comparison charts

---

## Phase 10: UI/UX Polish

### Design & Responsiveness
- [x] Apply consistent color scheme (slate/indigo, dark mode support)
- [x] Make responsive for mobile, tablet, desktop (sidebar, mobile nav)
- [x] Add loading spinners for async operations
- [x] Implement skeleton loaders for better UX
- [x] Add error messages and empty states
- [x] shadcn/ui components for consistent styling

### User Experience
- [x] Add toast notifications (sonner) for success/error
- [x] Theme toggle (light/dark)
- [x] Shareable profile card with Export as PNG
- [ ] Add keyboard shortcuts (optional)
- [ ] Ensure accessibility (ARIA labels, keyboard nav) — review

---

## Phase 11: Testing & Bug Fixes

### Backend Testing
- [x] Test all API endpoints manually (Postman)
- [x] Verify error handling
- [x] Check rate limiting behavior
- [ ] Test edge cases (no repos, new user, etc.) — ongoing

### Frontend Testing
- [x] Test auth flow, dashboard, repos, contributions, profile
- [ ] Test on different browsers
- [x] Test responsive design
- [x] Fix streak, velocity, export PNG overlap bugs

### Security Review
- [x] JWTs validated via auth middleware
- [x] Parameterized queries (no raw SQL concatenation)
- [ ] Verify env vars not exposed in client bundle — review
- [x] CORS configured

---

## Phase 12: Deployment

### Backend Deployment
- [ ] Choose hosting platform (Railway, Render, or Fly.io)
- [ ] Set up deployment configuration
- [ ] Add environment variables on hosting platform
- [ ] Update GitHub OAuth callback URL to production URL
- [ ] Deploy backend
- [ ] Test deployed API endpoints

### Frontend Deployment
- [ ] Choose hosting platform (Vercel, Netlify, or Cloudflare Pages)
- [ ] Update API base URL to production backend
- [ ] Build production bundle
- [ ] Deploy frontend
- [ ] Test deployed application

### Database
- [ ] Verify Supabase PostgreSQL is accessible from deployed backend
- [ ] Check connection limits and performance
- [ ] Set up database backups (optional)

---

## Phase 13: Documentation

### Code Documentation
- [ ] Add comments to complex logic
- [ ] Create inline documentation for functions
- [ ] Remove console.logs and debug code
- [ ] Ensure consistent code formatting

### README
- [ ] Write project description
- [ ] List features
- [ ] Document tech stack
- [ ] Add setup instructions (local development)
- [ ] Include environment variables template
- [ ] Add API documentation
- [ ] Include screenshots/GIFs of application
- [ ] Add deployment instructions
- [ ] Credit libraries and resources used

### Architecture Documentation
- [ ] Create architecture diagram (optional)
- [ ] Document database schema
- [ ] Explain key technical decisions
- [ ] List challenges faced and solutions

---

## Phase 14: Portfolio Preparation

### Demo Preparation
- [ ] Practice live demo walkthrough
- [ ] Prepare talking points for each feature
- [ ] Document interesting technical challenges solved
- [ ] Prepare answers for common questions:
  - [ ] Why these technologies?
  - [ ] How does OAuth work?
  - [ ] How do you handle rate limiting?
  - [ ] What would you improve given more time?

### Job Application Materials
- [ ] Update resume with this project
- [ ] Write project description for LinkedIn
- [ ] Prepare GitHub repo (ensure it's public and organized)
- [ ] Add project to portfolio website (if applicable)

---

## Suggested Improvements (Post-MVP)

### Quick wins
- [ ] Add repo detail page (GET /api/repos/:id) — link from repo cards
- [ ] Add "Most Active Week" to export card
- [ ] Improve accessibility (focus states, ARIA labels)

### Nice to have
- [ ] Repo comparison (Phase 5 backend + Phase 9 UI)
- [ ] Stats overview endpoint (GET /api/stats/overview)
- [ ] Background sync on login (optional, to pre-populate contributions)
