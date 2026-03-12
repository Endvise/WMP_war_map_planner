import bcrypt from 'bcryptjs';
import { supabase, TABLES } from './supabase';

export type AdminUser = {
  id: number;
  username: string;
  nickname: string;
  password_hash: string;
  is_master: boolean;
};

export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from(TABLES.ADMIN_USERS)
    .select('*')
    .eq('username', username)
    .single();
  
  if (error || !data) return null;
  return data as AdminUser;
}

export async function getAdminById(id: number): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from(TABLES.ADMIN_USERS)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data as AdminUser;
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from(TABLES.ADMIN_USERS)
    .select('*');
  
  if (error) return [];
  return data as AdminUser[];
}

export async function createAdminUser(
  username: string,
  nickname: string,
  password: string,
  isMaster: boolean = false
): Promise<AdminUser | null> {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from(TABLES.ADMIN_USERS)
    .insert({
      username,
      nickname,
      password_hash: passwordHash,
      is_master: isMaster,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  return data as AdminUser;
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.ADMIN_USERS)
    .delete()
    .eq('id', id);
  
  return !error;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
