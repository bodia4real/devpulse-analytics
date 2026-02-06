# Database Schema Design

This document outlines the complete database schema for DevPulse Analytics.

---

## Table Relationships Overview

```
auth.users (Supabase built-in)
    ↓
profiles (extends auth.users)
    ↓
workspaces (user can belong to multiple)
    ↓
platform_connections (stores OAuth tokens)
    ↓
monitors (what user wants to track)
    ↓
[Platform-specific tables: github_repositories, youtube_videos, devto_articles]
    ↓
analytics_snapshots (aggregated data)
    ↓
goals (user-defined goals)
```

---

## Core Tables

### 1. profiles

Extends Supabase's `auth.users` table with additional user information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, REFERENCES auth.users(id) | User ID (matches auth.users) |
| display_name | text | | User's display name |
| avatar_url | text | NULLABLE | Profile picture URL |
| bio | text | NULLABLE | User biography |
| timezone | text | DEFAULT 'UTC' | User's timezone |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Account creation time |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `profiles_id_idx` on `id` (already indexed as PK)

**Relationships:**
- One-to-one with `auth.users`
- One-to-many with `workspaces` (via workspace_members)
- One-to-many with `platform_connections`
- One-to-many with `monitors`
- One-to-many with `goals`

---

### 2. workspaces

User workspaces/teams for organizing multiple users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Workspace ID |
| name | text | NOT NULL | Workspace name |
| slug | text | NOT NULL, UNIQUE | URL-friendly workspace identifier |
| description | text | NULLABLE | Workspace description |
| owner_id | uuid | NOT NULL, REFERENCES profiles(id) | Workspace owner |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation time |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `workspaces_slug_idx` on `slug` (UNIQUE)
- `workspaces_owner_id_idx` on `owner_id`

**Relationships:**
- Many-to-one with `profiles` (owner)
- One-to-many with `workspace_members` (junction table)
- One-to-many with `monitors`

**Additional Table: workspace_members**
Junction table for many-to-many relationship between workspaces and users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| workspace_id | uuid | PRIMARY KEY, REFERENCES workspaces(id) | Workspace ID |
| user_id | uuid | PRIMARY KEY, REFERENCES profiles(id) | User ID |
| role | text | NOT NULL, DEFAULT 'member' | Role: 'owner', 'admin', 'member' |
| joined_at | timestamptz | NOT NULL, DEFAULT now() | When user joined |

**Indexes:**
- Composite PRIMARY KEY on `(workspace_id, user_id)`
- `workspace_members_user_id_idx` on `user_id`

---

### 3. platform_connections

Stores OAuth tokens and connection info for GitHub, YouTube, and Dev.to.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Connection ID |
| user_id | uuid | NOT NULL, REFERENCES profiles(id) | User who owns this connection |
| platform | text | NOT NULL | Platform: 'github', 'youtube', 'devto' |
| platform_user_id | text | NOT NULL | User's ID on the platform |
| platform_username | text | NOT NULL | Username on the platform |
| access_token | text | NOT NULL | OAuth access token (encrypted) |
| refresh_token | text | NULLABLE | OAuth refresh token (encrypted) |
| token_expires_at | timestamptz | NULLABLE | When access token expires |
| is_active | boolean | NOT NULL, DEFAULT true | Whether connection is active |
| last_synced_at | timestamptz | NULLABLE | Last successful sync time |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Connection creation time |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `platform_connections_user_id_idx` on `user_id`
- `platform_connections_platform_idx` on `platform`
- `platform_connections_user_platform_idx` on `(user_id, platform)` UNIQUE (one connection per platform per user)

**Relationships:**
- Many-to-one with `profiles`
- One-to-many with platform-specific tables (github_repositories, youtube_videos, etc.)

---

### 4. monitors

Defines what users want to track (which repositories, channels, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Monitor ID |
| user_id | uuid | NOT NULL, REFERENCES profiles(id) | User who owns this monitor |
| workspace_id | uuid | NULLABLE, REFERENCES workspaces(id) | Optional workspace |
| platform | text | NOT NULL | Platform: 'github', 'youtube', 'devto' |
| platform_connection_id | uuid | NOT NULL, REFERENCES platform_connections(id) | Which connection to use |
| monitor_type | text | NOT NULL | Type: 'repository', 'channel', 'user', 'all' |
| platform_resource_id | text | NULLABLE | ID of resource on platform (repo ID, channel ID, etc.) |
| is_active | boolean | NOT NULL, DEFAULT true | Whether monitoring is active |
| sync_frequency | integer | NOT NULL, DEFAULT 15 | Sync frequency in minutes |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation time |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `monitors_user_id_idx` on `user_id`
- `monitors_platform_idx` on `platform`
- `monitors_platform_connection_id_idx` on `platform_connection_id`
- `monitors_active_idx` on `is_active` WHERE `is_active = true`

**Relationships:**
- Many-to-one with `profiles`
- Many-to-one with `workspaces` (optional)
- Many-to-one with `platform_connections`

---

## Platform-Specific Tables

### 5. github_repositories

Stores GitHub repository information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Internal ID |
| platform_connection_id | uuid | NOT NULL, REFERENCES platform_connections(id) | Connection that owns this repo |
| github_repo_id | bigint | NOT NULL | GitHub repository ID |
| name | text | NOT NULL | Repository name |
| full_name | text | NOT NULL | Full name (owner/repo) |
| description | text | NULLABLE | Repository description |
| language | text | NULLABLE | Primary programming language |
| stars_count | integer | NOT NULL, DEFAULT 0 | Number of stars |
| forks_count | integer | NOT NULL, DEFAULT 0 | Number of forks |
| watchers_count | integer | NOT NULL, DEFAULT 0 | Number of watchers |
| open_issues_count | integer | NOT NULL, DEFAULT 0 | Open issues count |
| is_private | boolean | NOT NULL, DEFAULT false | Is repository private |
| is_fork | boolean | NOT NULL, DEFAULT false | Is it a fork |
| default_branch | text | NOT NULL, DEFAULT 'main' | Default branch name |
| html_url | text | NOT NULL | GitHub URL |
| created_at | timestamptz | NOT NULL | Repository creation time on GitHub |
| updated_at | timestamptz | NOT NULL | Last update time on GitHub |
| synced_at | timestamptz | NOT NULL, DEFAULT now() | When we last synced this data |

**Indexes:**
- `github_repositories_platform_connection_id_idx` on `platform_connection_id`
- `github_repositories_github_repo_id_idx` on `github_repo_id` UNIQUE
- `github_repositories_full_name_idx` on `full_name`

**Relationships:**
- Many-to-one with `platform_connections`

---

### 6. github_contributions

Daily GitHub contribution statistics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Contribution ID |
| platform_connection_id | uuid | NOT NULL, REFERENCES platform_connections(id) | Connection |
| date | date | NOT NULL | Contribution date |
| commits_count | integer | NOT NULL, DEFAULT 0 | Number of commits |
| pull_requests_count | integer | NOT NULL, DEFAULT 0 | Number of PRs |
| issues_count | integer | NOT NULL, DEFAULT 0 | Number of issues |
| repositories_contributed_to | integer | NOT NULL, DEFAULT 0 | Number of repos |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation time |

**Indexes:**
- `github_contributions_platform_connection_id_idx` on `platform_connection_id`
- `github_contributions_date_idx` on `date`
- `github_contributions_connection_date_idx` on `(platform_connection_id, date)` UNIQUE (one record per connection per day)

**Relationships:**
- Many-to-one with `platform_connections`

---

### 7. youtube_videos

Stores YouTube video information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Internal ID |
| platform_connection_id | uuid | NOT NULL, REFERENCES platform_connections(id) | Connection |
| youtube_video_id | text | NOT NULL | YouTube video ID |
| title | text | NOT NULL | Video title |
| description | text | NULLABLE | Video description |
| thumbnail_url | text | NULLABLE | Thumbnail image URL |
| duration_seconds | integer | NULLABLE | Video duration in seconds |
| view_count | bigint | NOT NULL, DEFAULT 0 | View count |
| like_count | integer | NOT NULL, DEFAULT 0 | Like count |
| comment_count | integer | NOT NULL, DEFAULT 0 | Comment count |
| published_at | timestamptz | NOT NULL | When video was published |
| synced_at | timestamptz | NOT NULL, DEFAULT now() | When we last synced |

**Indexes:**
- `youtube_videos_platform_connection_id_idx` on `platform_connection_id`
- `youtube_videos_youtube_video_id_idx` on `youtube_video_id` UNIQUE
- `youtube_videos_published_at_idx` on `published_at`

**Relationships:**
- Many-to-one with `platform_connections`

---

### 8. youtube_channel_stats

Daily YouTube channel statistics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Stats ID |
| platform_connection_id | uuid | NOT NULL, REFERENCES platform_connections(id) | Connection |
| date | date | NOT NULL | Stats date |
| subscriber_count | bigint | NOT NULL, DEFAULT 0 | Subscriber count |
| total_views | bigint | NOT NULL, DEFAULT 0 | Total channel views |
| video_count | integer | NOT NULL, DEFAULT 0 | Total video count |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation time |

**Indexes:**
- `youtube_channel_stats_platform_connection_id_idx` on `platform_connection_id`
- `youtube_channel_stats_date_idx` on `date`
- `youtube_channel_stats_connection_date_idx` on `(platform_connection_id, date)` UNIQUE

**Relationships:**
- Many-to-one with `platform_connections`

---

### 9. devto_articles

Stores Dev.to article information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Internal ID |
| platform_connection_id | uuid | NOT NULL, REFERENCES platform_connections(id) | Connection |
| devto_article_id | integer | NOT NULL | Dev.to article ID |
| title | text | NOT NULL | Article title |
| description | text | NULLABLE | Article description |
| published_at | timestamptz | NULLABLE | Publication date |
| reading_time_minutes | integer | NULLABLE | Estimated reading time |
| view_count | integer | NOT NULL, DEFAULT 0 | View count |
| reaction_count | integer | NOT NULL, DEFAULT 0 | Reaction count (likes) |
| comment_count | integer | NOT NULL, DEFAULT 0 | Comment count |
| url | text | NOT NULL | Article URL |
| tags | text[] | NULLABLE | Article tags array |
| synced_at | timestamptz | NOT NULL, DEFAULT now() | Last sync time |

**Indexes:**
- `devto_articles_platform_connection_id_idx` on `platform_connection_id`
- `devto_articles_devto_article_id_idx` on `devto_article_id` UNIQUE
- `devto_articles_published_at_idx` on `published_at`
- `devto_articles_tags_idx` on `tags` USING GIN (for array searches)

**Relationships:**
- Many-to-one with `platform_connections`

---

## Analytics Tables

### 10. analytics_snapshots

Pre-aggregated analytics data for faster queries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Snapshot ID |
| user_id | uuid | NOT NULL, REFERENCES profiles(id) | User |
| workspace_id | uuid | NULLABLE, REFERENCES workspaces(id) | Optional workspace |
| platform | text | NOT NULL | Platform: 'github', 'youtube', 'devto', 'all' |
| snapshot_type | text | NOT NULL | Type: 'daily', 'weekly', 'monthly' |
| snapshot_date | date | NOT NULL | Snapshot date |
| metrics | jsonb | NOT NULL | Aggregated metrics (flexible structure) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation time |

**Indexes:**
- `analytics_snapshots_user_id_idx` on `user_id`
- `analytics_snapshots_workspace_id_idx` on `workspace_id`
- `analytics_snapshots_platform_idx` on `platform`
- `analytics_snapshots_date_idx` on `snapshot_date`
- `analytics_snapshots_user_platform_date_idx` on `(user_id, platform, snapshot_date, snapshot_type)` UNIQUE

**Relationships:**
- Many-to-one with `profiles`
- Many-to-one with `workspaces` (optional)

**Example metrics JSONB structure:**
```json
{
  "github": {
    "total_stars": 1500,
    "total_forks": 200,
    "total_commits": 5000,
    "repositories_count": 25
  },
  "youtube": {
    "total_views": 100000,
    "total_subscribers": 5000,
    "total_videos": 50
  },
  "devto": {
    "total_views": 50000,
    "total_reactions": 2000,
    "total_articles": 30
  }
}
```

---

### 11. goals

User-defined goals for tracking progress.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Goal ID |
| user_id | uuid | NOT NULL, REFERENCES profiles(id) | User who owns this goal |
| workspace_id | uuid | NULLABLE, REFERENCES workspaces(id) | Optional workspace |
| platform | text | NOT NULL | Platform: 'github', 'youtube', 'devto', 'all' |
| goal_type | text | NOT NULL | Type: 'stars', 'subscribers', 'views', 'commits', etc. |
| target_value | numeric | NOT NULL | Target value to achieve |
| current_value | numeric | NOT NULL, DEFAULT 0 | Current progress |
| unit | text | NOT NULL | Unit: 'count', 'percentage', etc. |
| start_date | date | NOT NULL | Goal start date |
| end_date | date | NULLABLE | Goal end date (optional) |
| is_achieved | boolean | NOT NULL, DEFAULT false | Whether goal is achieved |
| achieved_at | timestamptz | NULLABLE | When goal was achieved |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation time |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update time |

**Indexes:**
- `goals_user_id_idx` on `user_id`
- `goals_workspace_id_idx` on `workspace_id`
- `goals_platform_idx` on `platform`
- `goals_is_achieved_idx` on `is_achieved`
- `goals_user_active_idx` on `(user_id, is_achieved)` WHERE `is_achieved = false`

**Relationships:**
- Many-to-one with `profiles`
- Many-to-one with `workspaces` (optional)

---

## Summary

### Total Tables: 11 (+ 1 junction table)

**Core (4):**
1. profiles
2. workspaces (+ workspace_members junction)
3. platform_connections
4. monitors

**Platform-Specific (5):**
5. github_repositories
6. github_contributions
7. youtube_videos
8. youtube_channel_stats
9. devto_articles

**Analytics (2):**
10. analytics_snapshots
11. goals

### Key Design Decisions

1. **UUIDs for all primary keys** - Better for distributed systems, no sequential ID leaks
2. **Timestamps with timezone** - All dates use `timestamptz` for proper timezone handling
3. **Platform IDs stored separately** - Keep platform-specific IDs separate from internal UUIDs
4. **JSONB for flexible metrics** - Analytics snapshots use JSONB for flexible metric storage
5. **Soft deletes via is_active** - Don't hard delete, use flags for recovery
6. **Indexes on foreign keys** - All foreign keys are indexed for join performance
7. **Composite unique constraints** - Prevent duplicate records (e.g., one contribution per day per connection)

---

*Last Updated: 2024-12-19*
