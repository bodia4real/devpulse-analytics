-- Migration: 001_initial_schema.sql
-- Description: Creates initial database schema for DevPulse Analytics
-- Created: 2024-12-19
-- Best Practices Applied:
--   - Proper constraints (CHECK, NOT NULL, UNIQUE)
--   - Optimized indexes (including partial indexes)
--   - Comprehensive RLS policies
--   - Data validation (non-negative counts, date ranges, etc.)
--   - Idempotent migrations (IF NOT EXISTS)

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID extension (for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions (for storing tokens securely)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate slug format (lowercase, alphanumeric, hyphens, underscores)
CREATE OR REPLACE FUNCTION is_valid_slug(slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN slug ~ '^[a-z0-9_-]+$' AND LENGTH(slug) BETWEEN 1 AND 100;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent duplicate owners in workspace_members
CREATE OR REPLACE FUNCTION prevent_duplicate_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'owner' THEN
        IF EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = NEW.workspace_id 
            AND role = 'owner' 
            AND user_id != NEW.user_id
        ) THEN
            RAISE EXCEPTION 'A workspace can only have one owner';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- profiles: User profiles extending Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT CHECK (LENGTH(display_name) <= 100),
    avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'),
    bio TEXT CHECK (bio IS NULL OR LENGTH(bio) <= 1000),
    timezone TEXT NOT NULL DEFAULT 'UTC' CHECK (timezone ~ '^[A-Za-z/_]+$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for automatic updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- workspaces: User workspaces/teams
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (LENGTH(name) BETWEEN 1 AND 100),
    slug TEXT NOT NULL UNIQUE CHECK (is_valid_slug(slug)),
    description TEXT CHECK (description IS NULL OR LENGTH(description) <= 500),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspaces_slug_idx ON workspaces(slug);
CREATE INDEX IF NOT EXISTS workspaces_owner_id_idx ON workspaces(owner_id);

CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- workspace_members: Junction table for workspace membership
CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
    -- Note: Preventing duplicate owners should be handled in application logic or via trigger
    -- PostgreSQL CHECK constraints cannot use subqueries
);

CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS workspace_members_workspace_id_idx ON workspace_members(workspace_id);

-- Trigger to prevent duplicate owners
CREATE TRIGGER prevent_duplicate_workspace_owner_trigger
    BEFORE INSERT OR UPDATE ON workspace_members
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_workspace_owner();

-- platform_connections: OAuth tokens for platforms
CREATE TABLE IF NOT EXISTS platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('github', 'youtube', 'devto')),
    platform_user_id TEXT NOT NULL CHECK (LENGTH(platform_user_id) > 0),
    platform_username TEXT NOT NULL CHECK (LENGTH(platform_username) BETWEEN 1 AND 100),
    access_token TEXT NOT NULL CHECK (LENGTH(access_token) > 0), -- Should be encrypted in application layer
    refresh_token TEXT CHECK (refresh_token IS NULL OR LENGTH(refresh_token) > 0), -- Should be encrypted in application layer
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS platform_connections_user_id_idx ON platform_connections(user_id);
CREATE INDEX IF NOT EXISTS platform_connections_platform_idx ON platform_connections(platform);
CREATE INDEX IF NOT EXISTS platform_connections_active_idx ON platform_connections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS platform_connections_user_platform_idx ON platform_connections(user_id, platform);

CREATE TRIGGER update_platform_connections_updated_at
    BEFORE UPDATE ON platform_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- monitors: What users want to track
CREATE TABLE IF NOT EXISTS monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('github', 'youtube', 'devto')),
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    monitor_type TEXT NOT NULL CHECK (monitor_type IN ('repository', 'channel', 'user', 'all')),
    platform_resource_id TEXT CHECK (platform_resource_id IS NULL OR LENGTH(platform_resource_id) > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sync_frequency INTEGER NOT NULL DEFAULT 15 CHECK (sync_frequency BETWEEN 1 AND 1440), -- 1 minute to 24 hours
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS monitors_user_id_idx ON monitors(user_id);
CREATE INDEX IF NOT EXISTS monitors_platform_idx ON monitors(platform);
CREATE INDEX IF NOT EXISTS monitors_platform_connection_id_idx ON monitors(platform_connection_id);
CREATE INDEX IF NOT EXISTS monitors_active_idx ON monitors(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS monitors_user_active_idx ON monitors(user_id, is_active) WHERE is_active = true;

CREATE TRIGGER update_monitors_updated_at
    BEFORE UPDATE ON monitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PLATFORM-SPECIFIC TABLES
-- ============================================================================

-- github_repositories: GitHub repository information
CREATE TABLE IF NOT EXISTS github_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    github_repo_id BIGINT NOT NULL UNIQUE CHECK (github_repo_id > 0),
    name TEXT NOT NULL CHECK (LENGTH(name) BETWEEN 1 AND 255),
    full_name TEXT NOT NULL CHECK (LENGTH(full_name) BETWEEN 1 AND 255),
    description TEXT CHECK (description IS NULL OR LENGTH(description) <= 2000),
    language TEXT CHECK (language IS NULL OR LENGTH(language) <= 50),
    stars_count INTEGER NOT NULL DEFAULT 0 CHECK (stars_count >= 0),
    forks_count INTEGER NOT NULL DEFAULT 0 CHECK (forks_count >= 0),
    watchers_count INTEGER NOT NULL DEFAULT 0 CHECK (watchers_count >= 0),
    open_issues_count INTEGER NOT NULL DEFAULT 0 CHECK (open_issues_count >= 0),
    is_private BOOLEAN NOT NULL DEFAULT false,
    is_fork BOOLEAN NOT NULL DEFAULT false,
    default_branch TEXT NOT NULL DEFAULT 'main' CHECK (LENGTH(default_branch) BETWEEN 1 AND 255),
    html_url TEXT NOT NULL CHECK (html_url ~ '^https?://'),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS github_repositories_platform_connection_id_idx ON github_repositories(platform_connection_id);
CREATE INDEX IF NOT EXISTS github_repositories_github_repo_id_idx ON github_repositories(github_repo_id);
CREATE INDEX IF NOT EXISTS github_repositories_full_name_idx ON github_repositories(full_name);
CREATE INDEX IF NOT EXISTS github_repositories_stars_idx ON github_repositories(stars_count DESC);

-- github_contributions: Daily GitHub contribution statistics
CREATE TABLE IF NOT EXISTS github_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    date DATE NOT NULL CHECK (date >= '2020-01-01' AND date <= CURRENT_DATE + INTERVAL '1 day'),
    commits_count INTEGER NOT NULL DEFAULT 0 CHECK (commits_count >= 0),
    pull_requests_count INTEGER NOT NULL DEFAULT 0 CHECK (pull_requests_count >= 0),
    issues_count INTEGER NOT NULL DEFAULT 0 CHECK (issues_count >= 0),
    repositories_contributed_to INTEGER NOT NULL DEFAULT 0 CHECK (repositories_contributed_to >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform_connection_id, date)
);

CREATE INDEX IF NOT EXISTS github_contributions_platform_connection_id_idx ON github_contributions(platform_connection_id);
CREATE INDEX IF NOT EXISTS github_contributions_date_idx ON github_contributions(date DESC);
CREATE INDEX IF NOT EXISTS github_contributions_connection_date_idx ON github_contributions(platform_connection_id, date DESC);

-- youtube_videos: YouTube video information
CREATE TABLE IF NOT EXISTS youtube_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL UNIQUE CHECK (LENGTH(youtube_video_id) BETWEEN 1 AND 50),
    title TEXT NOT NULL CHECK (LENGTH(title) BETWEEN 1 AND 200),
    description TEXT CHECK (description IS NULL OR LENGTH(description) <= 5000),
    thumbnail_url TEXT CHECK (thumbnail_url IS NULL OR thumbnail_url ~ '^https?://'),
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    view_count BIGINT NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
    comment_count INTEGER NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
    published_at TIMESTAMPTZ NOT NULL CHECK (published_at <= NOW()),
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS youtube_videos_platform_connection_id_idx ON youtube_videos(platform_connection_id);
CREATE INDEX IF NOT EXISTS youtube_videos_youtube_video_id_idx ON youtube_videos(youtube_video_id);
CREATE INDEX IF NOT EXISTS youtube_videos_published_at_idx ON youtube_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS youtube_videos_views_idx ON youtube_videos(view_count DESC);

-- youtube_channel_stats: Daily YouTube channel statistics
CREATE TABLE IF NOT EXISTS youtube_channel_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    date DATE NOT NULL CHECK (date >= '2020-01-01' AND date <= CURRENT_DATE + INTERVAL '1 day'),
    subscriber_count BIGINT NOT NULL DEFAULT 0 CHECK (subscriber_count >= 0),
    total_views BIGINT NOT NULL DEFAULT 0 CHECK (total_views >= 0),
    video_count INTEGER NOT NULL DEFAULT 0 CHECK (video_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform_connection_id, date)
);

CREATE INDEX IF NOT EXISTS youtube_channel_stats_platform_connection_id_idx ON youtube_channel_stats(platform_connection_id);
CREATE INDEX IF NOT EXISTS youtube_channel_stats_date_idx ON youtube_channel_stats(date DESC);
CREATE INDEX IF NOT EXISTS youtube_channel_stats_connection_date_idx ON youtube_channel_stats(platform_connection_id, date DESC);

-- devto_articles: Dev.to article information
CREATE TABLE IF NOT EXISTS devto_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    devto_article_id INTEGER NOT NULL UNIQUE CHECK (devto_article_id > 0),
    title TEXT NOT NULL CHECK (LENGTH(title) BETWEEN 1 AND 200),
    description TEXT CHECK (description IS NULL OR LENGTH(description) <= 1000),
    published_at TIMESTAMPTZ CHECK (published_at IS NULL OR published_at <= NOW()),
    reading_time_minutes INTEGER CHECK (reading_time_minutes IS NULL OR reading_time_minutes >= 0),
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    reaction_count INTEGER NOT NULL DEFAULT 0 CHECK (reaction_count >= 0),
    comment_count INTEGER NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
    url TEXT NOT NULL CHECK (url ~ '^https?://'),
    tags TEXT[] CHECK (tags IS NULL OR array_length(tags, 1) <= 10),
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS devto_articles_platform_connection_id_idx ON devto_articles(platform_connection_id);
CREATE INDEX IF NOT EXISTS devto_articles_devto_article_id_idx ON devto_articles(devto_article_id);
CREATE INDEX IF NOT EXISTS devto_articles_published_at_idx ON devto_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS devto_articles_tags_idx ON devto_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS devto_articles_views_idx ON devto_articles(view_count DESC);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- analytics_snapshots: Pre-aggregated analytics data
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('github', 'youtube', 'devto', 'all')),
    snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('daily', 'weekly', 'monthly')),
    snapshot_date DATE NOT NULL CHECK (snapshot_date >= '2020-01-01' AND snapshot_date <= CURRENT_DATE + INTERVAL '1 day'),
    metrics JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metrics) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform, snapshot_date, snapshot_type)
);

CREATE INDEX IF NOT EXISTS analytics_snapshots_user_id_idx ON analytics_snapshots(user_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_workspace_id_idx ON analytics_snapshots(workspace_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_platform_idx ON analytics_snapshots(platform);
CREATE INDEX IF NOT EXISTS analytics_snapshots_date_idx ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS analytics_snapshots_user_platform_date_idx ON analytics_snapshots(user_id, platform, snapshot_date DESC, snapshot_type);
CREATE INDEX IF NOT EXISTS analytics_snapshots_metrics_idx ON analytics_snapshots USING GIN(metrics);

-- goals: User-defined goals
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('github', 'youtube', 'devto', 'all')),
    goal_type TEXT NOT NULL CHECK (LENGTH(goal_type) BETWEEN 1 AND 50),
    target_value NUMERIC NOT NULL CHECK (target_value > 0),
    current_value NUMERIC NOT NULL DEFAULT 0 CHECK (current_value >= 0),
    unit TEXT NOT NULL DEFAULT 'count' CHECK (LENGTH(unit) BETWEEN 1 AND 20),
    start_date DATE NOT NULL CHECK (start_date >= '2020-01-01'),
    end_date DATE CHECK (end_date IS NULL OR (end_date >= start_date AND end_date <= CURRENT_DATE + INTERVAL '10 years')),
    is_achieved BOOLEAN NOT NULL DEFAULT false,
    achieved_at TIMESTAMPTZ CHECK (achieved_at IS NULL OR achieved_at <= NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure achieved_at is set when is_achieved is true
    CONSTRAINT achieved_check CHECK (
        (is_achieved = false AND achieved_at IS NULL) OR
        (is_achieved = true AND achieved_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_workspace_id_idx ON goals(workspace_id);
CREATE INDEX IF NOT EXISTS goals_platform_idx ON goals(platform);
CREATE INDEX IF NOT EXISTS goals_is_achieved_idx ON goals(is_achieved);
CREATE INDEX IF NOT EXISTS goals_user_active_idx ON goals(user_id, is_achieved) WHERE is_achieved = false;
CREATE INDEX IF NOT EXISTS goals_date_range_idx ON goals(start_date, end_date) WHERE end_date IS NOT NULL;

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_channel_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE devto_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    
    -- Workspaces policies
    DROP POLICY IF EXISTS "Users can view workspace if member" ON workspaces;
    DROP POLICY IF EXISTS "Users can create workspace" ON workspaces;
    DROP POLICY IF EXISTS "Owners can update workspace" ON workspaces;
    DROP POLICY IF EXISTS "Owners can delete workspace" ON workspaces;
    
    -- Workspace members policies
    DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
    DROP POLICY IF EXISTS "Workspace owners can manage members" ON workspace_members;
    
    -- Platform connections policies
    DROP POLICY IF EXISTS "Users can view own connections" ON platform_connections;
    DROP POLICY IF EXISTS "Users can create own connections" ON platform_connections;
    DROP POLICY IF EXISTS "Users can update own connections" ON platform_connections;
    DROP POLICY IF EXISTS "Users can delete own connections" ON platform_connections;
    
    -- Monitors policies
    DROP POLICY IF EXISTS "Users can view own monitors" ON monitors;
    DROP POLICY IF EXISTS "Users can create own monitors" ON monitors;
    DROP POLICY IF EXISTS "Users can update own monitors" ON monitors;
    DROP POLICY IF EXISTS "Users can delete own monitors" ON monitors;
    
    -- GitHub repositories policies
    DROP POLICY IF EXISTS "Users can view own github repos" ON github_repositories;
    
    -- GitHub contributions policies
    DROP POLICY IF EXISTS "Users can view own github contributions" ON github_contributions;
    
    -- YouTube videos policies
    DROP POLICY IF EXISTS "Users can view own youtube videos" ON youtube_videos;
    
    -- YouTube channel stats policies
    DROP POLICY IF EXISTS "Users can view own youtube stats" ON youtube_channel_stats;
    
    -- Dev.to articles policies
    DROP POLICY IF EXISTS "Users can view own devto articles" ON devto_articles;
    
    -- Analytics snapshots policies
    DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_snapshots;
    DROP POLICY IF EXISTS "Users can create own analytics" ON analytics_snapshots;
    
    -- Goals policies
    DROP POLICY IF EXISTS "Users can view own goals" ON goals;
    DROP POLICY IF EXISTS "Users can create own goals" ON goals;
    DROP POLICY IF EXISTS "Users can update own goals" ON goals;
    DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
END $$;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspaces: Users can view workspaces they're members of
CREATE POLICY "Users can view workspace if member" ON workspaces
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create workspace" ON workspaces
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update workspace" ON workspaces
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete workspace" ON workspaces
    FOR DELETE USING (owner_id = auth.uid());

-- Workspace members: Users can view members of workspaces they belong to
CREATE POLICY "Users can view workspace members" ON workspace_members
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        ) OR
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );

CREATE POLICY "Workspace owners can manage members" ON workspace_members
    FOR ALL USING (
        workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    );

-- Platform connections: Users can only access their own connections
CREATE POLICY "Users can view own connections" ON platform_connections
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own connections" ON platform_connections
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connections" ON platform_connections
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own connections" ON platform_connections
    FOR DELETE USING (user_id = auth.uid());

-- Monitors: Users can only access their own monitors
CREATE POLICY "Users can view own monitors" ON monitors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own monitors" ON monitors
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own monitors" ON monitors
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own monitors" ON monitors
    FOR DELETE USING (user_id = auth.uid());

-- GitHub repositories: Users can view repos from their connections
CREATE POLICY "Users can view own github repos" ON github_repositories
    FOR SELECT USING (
        platform_connection_id IN (
            SELECT id FROM platform_connections WHERE user_id = auth.uid()
        )
    );

-- GitHub contributions: Users can view contributions from their connections
CREATE POLICY "Users can view own github contributions" ON github_contributions
    FOR SELECT USING (
        platform_connection_id IN (
            SELECT id FROM platform_connections WHERE user_id = auth.uid()
        )
    );

-- YouTube videos: Users can view videos from their connections
CREATE POLICY "Users can view own youtube videos" ON youtube_videos
    FOR SELECT USING (
        platform_connection_id IN (
            SELECT id FROM platform_connections WHERE user_id = auth.uid()
        )
    );

-- YouTube channel stats: Users can view stats from their connections
CREATE POLICY "Users can view own youtube stats" ON youtube_channel_stats
    FOR SELECT USING (
        platform_connection_id IN (
            SELECT id FROM platform_connections WHERE user_id = auth.uid()
        )
    );

-- Dev.to articles: Users can view articles from their connections
CREATE POLICY "Users can view own devto articles" ON devto_articles
    FOR SELECT USING (
        platform_connection_id IN (
            SELECT id FROM platform_connections WHERE user_id = auth.uid()
        )
    );

-- Analytics snapshots: Users can view their own snapshots
CREATE POLICY "Users can view own analytics" ON analytics_snapshots
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own analytics" ON analytics_snapshots
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Goals: Users can view and manage their own goals
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own goals" ON goals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE workspaces IS 'User workspaces/teams for organizing multiple users';
COMMENT ON TABLE workspace_members IS 'Junction table for workspace membership';
COMMENT ON TABLE platform_connections IS 'OAuth tokens and connection info for GitHub, YouTube, and Dev.to';
COMMENT ON TABLE monitors IS 'Defines what users want to track';
COMMENT ON TABLE github_repositories IS 'GitHub repository information';
COMMENT ON TABLE github_contributions IS 'Daily GitHub contribution statistics';
COMMENT ON TABLE youtube_videos IS 'YouTube video information';
COMMENT ON TABLE youtube_channel_stats IS 'Daily YouTube channel statistics';
COMMENT ON TABLE devto_articles IS 'Dev.to article information';
COMMENT ON TABLE analytics_snapshots IS 'Pre-aggregated analytics data for faster queries';
COMMENT ON TABLE goals IS 'User-defined goals for tracking progress';
