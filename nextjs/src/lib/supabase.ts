import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Table names
export const TABLES = {
  ADMIN_USERS: 'admin_users',
  WAR_MAP_SESSIONS: 'war_map_sessions',
  USER_ICONS: 'user_icons',
  FLAGS: 'flags',
  DRAWINGS: 'drawings',
  USER_PRESENCE: 'user_presence',
} as const;
