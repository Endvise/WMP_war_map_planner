import { supabase, TABLES } from './supabase';

export type WarMapSession = {
  id: number;
  name: string;
  event_type: string;
  created_by: number | null;
  created_at: string;
};

export type UserIcon = {
  id: number;
  session_id: number;
  user_name: string;
  x: number;
  y: number;
  border_color: string;
  placed_by: number | null;
};

export type Flag = {
  id: number;
  session_id: number;
  x: number;
  y: number;
  memo: string;
  created_by: number | null;
};

export type Drawing = {
  id: number;
  session_id: number;
  type: string;
  points: string;
  color: string;
  stroke_width: number;
  created_by: number | null;
};

export type UserPresence = {
  id: number;
  session_id: number;
  user_id: number;
  nickname: string;
  user_color: string;
  last_seen: string;
};

// Sessions
export async function getAllSessions(): Promise<WarMapSession[]> {
  const { data, error } = await supabase
    .from(TABLES.WAR_MAP_SESSIONS)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data as WarMapSession[];
}

export async function getSessionById(id: number): Promise<WarMapSession | null> {
  const { data, error } = await supabase
    .from(TABLES.WAR_MAP_SESSIONS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data as WarMapSession;
}

export async function createSession(name: string, eventType: string, createdBy?: number): Promise<WarMapSession | null> {
  const { data, error } = await supabase
    .from(TABLES.WAR_MAP_SESSIONS)
    .insert({
      name,
      event_type: eventType,
      created_by: createdBy || null,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  return data as WarMapSession;
}

export async function deleteSession(id: number): Promise<boolean> {
  // Delete related items first
  await supabase.from(TABLES.USER_ICONS).delete().eq('session_id', id);
  await supabase.from(TABLES.FLAGS).delete().eq('session_id', id);
  await supabase.from(TABLES.DRAWINGS).delete().eq('session_id', id);
  await supabase.from(TABLES.USER_PRESENCE).delete().eq('session_id', id);
  
  const { error } = await supabase
    .from(TABLES.WAR_MAP_SESSIONS)
    .delete()
    .eq('id', id);
  
  return !error;
}

// User Icons
export async function getIconsBySession(sessionId: number): Promise<UserIcon[]> {
  const { data, error } = await supabase
    .from(TABLES.USER_ICONS)
    .select('*')
    .eq('session_id', sessionId);
  
  if (error) return [];
  return data as UserIcon[];
}

export async function createIcon(
  sessionId: number,
  userName: string,
  x: number,
  y: number,
  borderColor: string,
  placedBy?: number
): Promise<UserIcon | null> {
  const { data, error } = await supabase
    .from(TABLES.USER_ICONS)
    .insert({
      session_id: sessionId,
      user_name: userName,
      x,
      y,
      border_color: borderColor,
      placed_by: placedBy || null,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  return data as UserIcon;
}

export async function updateIconPosition(id: number, x: number, y: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.USER_ICONS)
    .update({ x, y })
    .eq('id', id);
  
  return !error;
}

export async function deleteIcon(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.USER_ICONS)
    .delete()
    .eq('id', id);
  
  return !error;
}

// Flags
export async function getFlagsBySession(sessionId: number): Promise<Flag[]> {
  const { data, error } = await supabase
    .from(TABLES.FLAGS)
    .select('*')
    .eq('session_id', sessionId);
  
  if (error) return [];
  return data as Flag[];
}

export async function createFlag(
  sessionId: number,
  x: number,
  y: number,
  memo: string,
  createdBy?: number
): Promise<Flag | null> {
  const { data, error } = await supabase
    .from(TABLES.FLAGS)
    .insert({
      session_id: sessionId,
      x,
      y,
      memo,
      created_by: createdBy || null,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  return data as Flag;
}

export async function updateFlagMemo(id: number, memo: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.FLAGS)
    .update({ memo })
    .eq('id', id);
  
  return !error;
}

export async function updateFlagPosition(id: number, x: number, y: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.FLAGS)
    .update({ x, y })
    .eq('id', id);
  
  return !error;
}

export async function deleteFlag(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.FLAGS)
    .delete()
    .eq('id', id);
  
  return !error;
}

// Drawings
export async function getDrawingsBySession(sessionId: number): Promise<Drawing[]> {
  const { data, error } = await supabase
    .from(TABLES.DRAWINGS)
    .select('*')
    .eq('session_id', sessionId);
  
  if (error) return [];
  return data as Drawing[];
}

export async function createDrawing(
  sessionId: number,
  drawType: string,
  points: string,
  color: string,
  strokeWidth: number,
  createdBy?: number
): Promise<Drawing | null> {
  const { data, error } = await supabase
    .from(TABLES.DRAWINGS)
    .insert({
      session_id: sessionId,
      type: drawType,
      points,
      color,
      stroke_width: strokeWidth,
      created_by: createdBy || null,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  return data as Drawing;
}

export async function updateDrawingPoints(id: number, points: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.DRAWINGS)
    .update({ points })
    .eq('id', id);
  
  return !error;
}

export async function deleteDrawing(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.DRAWINGS)
    .delete()
    .eq('id', id);
  
  return !error;
}

// User Presence
export async function updateUserPresence(
  sessionId: number,
  userId: number,
  nickname: string,
  userColor: string
): Promise<boolean> {
  try {
    // First try to update existing
    const { error: updateError } = await supabase
      .from(TABLES.USER_PRESENCE)
      .update({
        nickname,
        user_color: userColor,
        last_seen: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (updateError) {
      // If error, try to insert new
      const { error: insertError } = await supabase
        .from(TABLES.USER_PRESENCE)
        .insert({
          session_id: sessionId,
          user_id: userId,
          nickname,
          user_color: userColor,
          last_seen: new Date().toISOString(),
        });
      
      return !insertError;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getOnlineUsers(sessionId: number): Promise<UserPresence[]> {
  const { data, error } = await supabase
    .from(TABLES.USER_PRESENCE)
    .select('*')
    .eq('session_id', sessionId);
  
  if (error) return [];
  return data as UserPresence[];
}

export async function removeUserPresence(sessionId: number, userId: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.USER_PRESENCE)
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId);
  
  return !error;
}
