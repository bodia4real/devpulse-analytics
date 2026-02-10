# DevPulse – Project Plan

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
- [x] Create contributions table (id, user_id, date, commit_count, pr_count, issue_count, timestamp)
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
- [ ] Register GitHub OAuth App (get Client ID and Secret)
- [ ] Set callback URL: http://localhost:5000/api/auth/github/callback
- [ ] Store credentials in .env file

### Auth Implementation
- [ ] Install jsonwebtoken and axios
- [ ] Create auth routes file (src/routes/auth.routes.ts)
- [ ] Implement GET /api/auth/github (redirect to GitHub OAuth)
- [ ] Implement GET /api/auth/github/callback:
  - [ ] Receive code from GitHub
  - [ ] Exchange code for access token
  - [ ] Fetch user data from GitHub API
  - [ ] Store/update user in database
  - [ ] Generate JWT token
  - [ ] Return JWT to frontend
- [ ] Create JWT generation utility (src/utils/jwt.ts)
- [ ] Create auth middleware (src/middleware/auth.middleware.ts) to verify JWT
- [ ] Implement GET /api/auth/me (protected endpoint to get current user)
- [ ] Implement POST /api/auth/logout
- [ ] Test full OAuth flow

---

## Phase 3: GitHub API Integration - Repositories

### GitHub Service
- [ ] Create GitHub API client (src/services/github.service.ts)
- [ ] Implement fetchUserRepos(accessToken) - fetch all repos from GitHub
- [ ] Implement fetchRepoDetails(owner, repo, accessToken) - get single repo
- [ ] Handle GitHub API rate limiting
- [ ] Add error handling for API failures

### Repo Endpoints
- [ ] Create repos routes (src/routes/repos.routes.ts)
- [ ] Implement GET /api/repos (fetch all user repos from DB, protected)
- [ ] Implement GET /api/repos/:id (get specific repo details, protected)
- [ ] Implement POST /api/repos/sync (sync repos from GitHub to DB, protected):
  - [ ] Fetch repos from GitHub API
  - [ ] Compare with existing DB records
  - [ ] Insert new repos
  - [ ] Update existing repos (stars, forks, issues, etc.)
  - [ ] Return sync result
- [ ] Test repo endpoints

---

## Phase 4: Contributions Tracking

### Contributions Service
- [ ] Research GitHub GraphQL API for contribution data
- [ ] Create contributions service (src/services/contributions.service.ts)
- [ ] Implement fetchUserContributions(username, accessToken, days)
- [ ] Parse and structure contribution data (commits, PRs, issues per day)

### Contributions Endpoints
- [ ] Create contributions routes (src/routes/contributions.routes.ts)
- [ ] Implement GET /api/contributions?days=30 (get last N days from DB, protected)
- [ ] Implement POST /api/contributions/sync (sync from GitHub, protected):
  - [ ] Fetch contribution data from GitHub
  - [ ] Store daily stats in contributions table
  - [ ] Handle duplicates (upsert)
- [ ] Test contributions endpoints

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

### React Project Initialization
- [ ] Create React app with TypeScript (create-react-app or Vite)
- [ ] Install dependencies: axios, react-router-dom
- [ ] Set up project structure (components, hooks, services, types, utils)
- [ ] Configure environment variables (API base URL)

### Routing & Layout
- [ ] Set up React Router
- [ ] Create main Layout component (header, navigation, footer)
- [ ] Create route structure (/, /dashboard, /repos, /repos/:id, /compare)
- [ ] Implement protected route wrapper

### Authentication Flow
- [ ] Create auth service (src/services/auth.service.ts) with axios instance
- [ ] Implement token storage (localStorage)
- [ ] Create axios interceptor to attach JWT to requests
- [ ] Create AuthContext/hook for managing auth state
- [ ] Build landing page with "Login with GitHub" button
- [ ] Handle OAuth callback (extract JWT from URL, store it, redirect)
- [ ] Build logout functionality
- [ ] Test login/logout flow

---

## Phase 7: Core Frontend Features

### Dashboard
- [ ] Create Dashboard page component
- [ ] Fetch user data (GET /api/auth/me)
- [ ] Display user info (avatar, username, email)
- [ ] Add "Sync Repos" button
- [ ] Show loading states
- [ ] Handle errors

### Repo List View
- [ ] Create RepoList component
- [ ] Fetch repos from API (GET /api/repos)
- [ ] Display repos in a grid/list: Name, description; Stars, forks, issues; Language badge; Last updated
- [ ] Add sorting (by stars, forks, updated date)
- [ ] Add filtering by language
- [ ] Implement search functionality
- [ ] Add pagination if needed

### Repo Detail View
- [ ] Create RepoDetail component
- [ ] Fetch single repo (GET /api/repos/:id)
- [ ] Display detailed stats
- [ ] Show repo description, README preview (optional)
- [ ] Link to GitHub repo

---

## Phase 8: Data Visualization

### Charts Library Setup
- [ ] Install recharts (or chart.js)
- [ ] Create reusable Chart components

### Contribution Charts
- [ ] Fetch contribution data (GET /api/contributions?days=30)
- [ ] Create line chart: commits over time
- [ ] Create bar chart: PRs and Issues per week
- [ ] Create area chart: total contributions trend
- [ ] Add date range selector (7, 30, 90 days)

### Repository Analytics
- [ ] Create language distribution pie chart
- [ ] Create stars growth chart (if tracking history)
- [ ] Display top repositories by stars/forks

---

## Phase 9: Repo Comparison Feature

### Comparison UI
- [ ] Create Compare page component
- [ ] Add repo selection interface (multi-select from user's repos)
- [ ] Fetch comparison data (GET /api/repos/compare?ids=1,2,3)
- [ ] Display side-by-side comparison table: Stars, forks, issues; Language; Created/updated dates
- [ ] Create comparison charts (bar chart comparing metrics)
- [ ] Add ability to share comparison (optional)

---

## Phase 10: UI/UX Polish

### Design & Responsiveness
- [ ] Apply consistent color scheme and typography
- [ ] Make responsive for mobile, tablet, desktop
- [ ] Add loading spinners for async operations
- [ ] Implement skeleton loaders for better UX
- [ ] Add error messages and empty states
- [ ] Improve button and form styles

### User Experience
- [ ] Add toast notifications for success/error messages
- [ ] Implement smooth transitions and animations
- [ ] Add keyboard shortcuts (optional)
- [ ] Ensure accessibility (ARIA labels, keyboard navigation)

---

## Phase 11: Testing & Bug Fixes

### Backend Testing
- [ ] Test all API endpoints manually (Postman/Insomnia)
- [ ] Verify error handling
- [ ] Check rate limiting behavior
- [ ] Test edge cases (no repos, new user, etc.)

### Frontend Testing
- [ ] Test all user flows end-to-end
- [ ] Test on different browsers
- [ ] Test responsive design on different devices
- [ ] Fix any bugs found

### Security Review
- [ ] Ensure JWTs are properly validated
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify environment variables are not exposed
- [ ] Review CORS configuration

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
