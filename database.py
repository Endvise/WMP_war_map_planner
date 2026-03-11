"""
Database operations using Supabase
"""

import json
from datetime import datetime
from config import get_supabase

# Table names
TABLE_ADMIN_USERS = "admin_users"
TABLE_WAR_MAP_SESSIONS = "war_map_sessions"
TABLE_USER_ICONS = "user_icons"
TABLE_FLAGS = "flags"
TABLE_DRAWINGS = "drawings"
TABLE_USER_PRESENCE = "user_presence"
TABLE_ADMIN_USERS = "admin_users"
TABLE_WAR_MAP_SESSIONS = "war_map_sessions"
TABLE_USER_ICONS = "user_icons"
TABLE_FLAGS = "flags"
TABLE_DRAWINGS = "drawings"


def get_client():
    """Get Supabase client"""
    return get_supabase()


# ==================== Admin Users ====================


def get_admin_by_username(username: str):
    """Get admin user by username"""
    client = get_client()
    response = (
        client.table(TABLE_ADMIN_USERS).select("*").eq("username", username).execute()
    )
    return response.data[0] if response.data else None


def get_admin_by_id(admin_id: int):
    """Get admin user by ID"""
    client = get_client()
    response = (
        client.table(TABLE_ADMIN_USERS).select("*").eq("id", admin_id).execute()
    )
    return response.data[0] if response.data else None


def get_all_admins():
    """Get all admin users"""
    client = get_client()
    response = client.table(TABLE_ADMIN_USERS).select("*").execute()
    return response.data


def create_admin_user(username: str, nickname: str, password_hash: str, is_master: bool = False):
    """Create admin user"""
    client = get_client()
    response = (
        client.table(TABLE_ADMIN_USERS)
        .insert(
            {
                "username": username,
                "nickname": nickname,
                "password_hash": password_hash,
                "is_master": is_master
            }
        )
        .execute()
    )
    return response.data[0] if response.data else None


def delete_admin_user(admin_id: int):
    """Delete admin user"""
    client = get_client()
    client.table(TABLE_ADMIN_USERS).delete().eq("id", admin_id).execute()


def get_admin_by_username(username: str):
    """Get admin user by username"""
    client = get_client()
    response = (
        client.table(TABLE_ADMIN_USERS).select("*").eq("username", username).execute()
    )
    return response.data[0] if response.data else None


def create_admin_user(username: str, nickname: str, password_hash: str):
    """Create admin user"""
    client = get_client()
    response = (
        client.table(TABLE_ADMIN_USERS)
        .insert(
            {"username": username, "nickname": nickname, "password_hash": password_hash}
        )
        .execute()
    )
    return response.data[0] if response.data else None


# ==================== War Map Sessions ====================


def get_all_sessions():
    """Get all war map sessions"""
    client = get_client()
    response = client.table(TABLE_WAR_MAP_SESSIONS).select("*").execute()
    return response.data


def get_session_by_id(session_id: int):
    """Get session by ID"""
    client = get_client()
    response = (
        client.table(TABLE_WAR_MAP_SESSIONS).select("*").eq("id", session_id).execute()
    )
    return response.data[0] if response.data else None


def create_session(name: str, event_type: str, created_by: int = None):
    """Create new session"""
    client = get_client()
    response = (
        client.table(TABLE_WAR_MAP_SESSIONS)
        .insert({"name": name, "event_type": event_type, "created_by": created_by})
        .execute()
    )
    return response.data[0] if response.data else None


def delete_session(session_id: int):
    """Delete session and related data"""
    client = get_client()
    # Delete related items first
    client.table(TABLE_USER_ICONS).delete().eq("session_id", session_id).execute()
    client.table(TABLE_FLAGS).delete().eq("session_id", session_id).execute()
    client.table(TABLE_DRAWINGS).delete().eq("session_id", session_id).execute()
    # Delete session
    client.table(TABLE_WAR_MAP_SESSIONS).delete().eq("id", session_id).execute()


# ==================== User Icons ====================


def get_icons_by_session(session_id: int):
    """Get all icons for a session"""
    client = get_client()
    response = (
        client.table(TABLE_USER_ICONS)
        .select("*")
        .eq("session_id", session_id)
        .execute()
    )
    return response.data


def create_icon(
    session_id: int,
    user_name: str,
    x: int,
    y: int,
    border_color: str,
    placed_by: int = None,
):
    """Create new icon"""
    client = get_client()
    response = (
        client.table(TABLE_USER_ICONS)
        .insert(
            {
                "session_id": session_id,
                "user_name": user_name,
                "x": x,
                "y": y,
                "border_color": border_color,
                "placed_by": placed_by,
            }
        )
        .execute()
    )
    return response.data[0] if response.data else None


def update_icon_position(icon_id: int, x: int, y: int):
    """Update icon position"""
    client = get_client()
    response = (
        client.table(TABLE_USER_ICONS)
        .update({"x": x, "y": y})
        .eq("id", icon_id)
        .execute()
    )
    return response.data[0] if response.data else None


def delete_icon(icon_id: int):
    """Delete icon"""
    client = get_client()
    client.table(TABLE_USER_ICONS).delete().eq("id", icon_id).execute()


# ==================== Flags ====================


def get_flags_by_session(session_id: int):
    """Get all flags for a session"""
    client = get_client()
    response = (
        client.table(TABLE_FLAGS).select("*").eq("session_id", session_id).execute()
    )
    return response.data


def create_flag(session_id: int, x: int, y: int, memo: str, created_by: int = None):
    """Create new flag"""
    client = get_client()
    response = (
        client.table(TABLE_FLAGS)
        .insert(
            {
                "session_id": session_id,
                "x": x,
                "y": y,
                "memo": memo,
                "created_by": created_by,
            }
        )
        .execute()
    )
    return response.data[0] if response.data else None


def update_flag_memo(flag_id: int, memo: str):
    """Update flag memo"""
    client = get_client()
    response = (
        client.table(TABLE_FLAGS).update({"memo": memo}).eq("id", flag_id).execute()
    )
    return response.data[0] if response.data else None


def delete_flag(flag_id: int):
    """Delete flag"""
    client = get_client()
    client.table(TABLE_FLAGS).delete().eq("id", flag_id).execute()


# ==================== Drawings ====================


def get_drawings_by_session(session_id: int):
    """Get all drawings for a session"""
    client = get_client()
    response = (
        client.table(TABLE_DRAWINGS).select("*").eq("session_id", session_id).execute()
    )
    return response.data


def create_drawing(
    session_id: int,
    draw_type: str,
    points: list,
    color: str,
    stroke_width: int,
    created_by: int = None,
):
    """Create new drawing"""
    client = get_client()
    response = (
        client.table(TABLE_DRAWINGS)
        .insert(
            {
                "session_id": session_id,
                "type": draw_type,
                "points": json.dumps(points),
                "color": color,
                "stroke_width": stroke_width,
                "created_by": created_by,
            }
        )
        .execute()
    )
    return response.data[0] if response.data else None


def delete_drawing(drawing_id: int):
    """Delete drawing"""
    client = get_client()
    client.table(TABLE_DRAWINGS).delete().eq("id", drawing_id).execute()


# ==================== User Presence ====================


def update_user_presence(session_id: int, user_id: int, nickname: str, user_color: str):
    """Update user presence in a session"""
    client = get_client()
    # First try to update existing
    response = (
        client.table(TABLE_USER_PRESENCE)
        .update({
            "nickname": nickname,
            "user_color": user_color,
            "last_seen": datetime.now().isoformat()
        })
        .eq("session_id", session_id)
        .eq("user_id", user_id)
        .execute()
    )
    # If no existing, insert new
    if not response.data:
        client.table(TABLE_USER_PRESENCE).insert({
            "session_id": session_id,
            "user_id": user_id,
            "nickname": nickname,
            "user_color": user_color
        }).execute()


def get_online_users(session_id: int):
    """Get all online users in a session"""
    client = get_client()
    response = (
        client.table(TABLE_USER_PRESENCE)
        .select("*")
        .eq("session_id", session_id)
        .execute()
    )
    return response.data


def remove_user_presence(session_id: int, user_id: int):
    """Remove user presence"""
    client = get_client()
    client.table(TABLE_USER_PRESENCE).delete().eq("session_id", session_id).eq("user_id", user_id).execute()
    """Delete drawing"""
    client = get_client()
    client.table(TABLE_DRAWINGS).delete().eq("id", drawing_id).execute()
