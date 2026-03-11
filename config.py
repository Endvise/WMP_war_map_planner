"""
Configuration for War Map Strategy
"""

import os
from supabase import create_client

# Load .env file
from dotenv import load_dotenv

load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Auth
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")


# Initialize Supabase client
def get_supabase_client():
    """Get Supabase client instance"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# Get client (lazy initialization)
_supabase_client = None


def get_supabase():
    """Get cached Supabase client"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = get_supabase_client()
    return _supabase_client
