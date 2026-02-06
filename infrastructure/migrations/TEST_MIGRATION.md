# How to Test Migration (Without DATABASE_URL)

You can test the migration directly in Supabase Dashboard - no DATABASE_URL needed!

## Step-by-Step:

1. **Go to Supabase Dashboard**
   - Open your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Migration**
   - Open `infrastructure/migrations/001_initial_schema.sql` in your code editor
   - Copy ALL the contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Check for Success**
   - If successful, you'll see: "Success. No rows returned"
   - If there are errors, they'll be shown in red

5. **Verify Tables Were Created**
   - Click **Table Editor** in left sidebar
   - You should see all these tables:
     - profiles
     - workspaces
     - workspace_members
     - platform_connections
     - monitors
     - github_repositories
     - github_contributions
     - youtube_videos
     - youtube_channel_stats
     - devto_articles
     - analytics_snapshots
     - goals

6. **Check RLS Policies**
   - Click **Authentication** → **Policies**
   - You should see policies for each table

7. **Check Indexes**
   - Click **Database** → **Indexes**
   - You should see many indexes listed

## Quick Verification Query

Run this in SQL Editor to verify everything:

```sql
-- Count tables
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check extensions
SELECT extname FROM pg_extension;

-- Check RLS
SELECT tablename, relrowsecurity 
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE pt.schemaname = 'public'
ORDER BY tablename;
```

If you see 12 tables, extensions enabled, and RLS on all tables - you're good! ✅
