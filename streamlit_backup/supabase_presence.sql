-- ============================================
-- Add user_presence table for online user tracking
-- Run this in Supabase SQL Editor
-- ============================================

-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    nickname TEXT NOT NULL,
    user_color TEXT NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all access to user_presence" ON user_presence
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anon access (for real-time updates)
CREATE POLICY "Allow anon access to user_presence" ON user_presence
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_presence_session ON user_presence(session_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user ON user_presence(user_id);

-- Verify
SELECT * FROM user_presence LIMIT 10;
