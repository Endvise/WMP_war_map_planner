"""
Configuration for War Map Strategy
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Streamlit
STREAMLIT_PORT = int(os.getenv("STREAMLIT_PORT", "8501"))

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///war_map.db")

# Auth
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
