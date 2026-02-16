-- Run this once (e.g. in Supabase SQL Editor) to add GitHub account creation date.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS github_created_at timestamptz;
