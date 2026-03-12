-- ============================================
-- War Map Strategy - Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add is_master column to admin_users table (if not exists)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE;

-- 2. Create new master admin user (endvise)
-- Note: This will fail if username already exists
INSERT INTO admin_users (username, nickname, password_hash, is_master)
VALUES (
    'endvise',
    'MasterAdmin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzvYejWqW',  -- bcrypt hash of 'a12503934!'
    TRUE
)
ON CONFLICT (username) DO NOTHING;

-- 3. Set existing admin as non-master (if exists)
UPDATE admin_users SET is_master = FALSE WHERE username = 'admin';

-- 4. Verify the result
SELECT id, username, nickname, is_master, created_at FROM admin_users ORDER BY id;

-- ============================================
-- If step 2 fails because user already exists, run this instead:
-- ============================================
-- UPDATE admin_users 
-- SET is_master = TRUE, password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzvYejWqW'
-- WHERE username = 'endvise';
