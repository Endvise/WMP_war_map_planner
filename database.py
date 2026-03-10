"""
Database models and connection
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


class AdminUser(Base):
    """Admin user model"""

    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    nickname = Column(String(50), nullable=False)
    password_hash = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class WarMapSession(Base):
    """War map session model"""

    __tablename__ = "war_map_sessions"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    image_path = Column(String(500))
    event_type = Column(String(50))
    created_by = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserIcon(Base):
    """User icon on map"""

    __tablename__ = "user_icons"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, nullable=False)
    user_name = Column(String(50), nullable=False)
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)
    border_color = Column(String(20), default="#FF0000")
    placed_by = Column(Integer)
    placed_at = Column(DateTime, default=datetime.utcnow)


class Flag(Base):
    """Flag with memo on map"""

    __tablename__ = "flags"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, nullable=False)
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)
    memo = Column(Text)
    created_by = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class Drawing(Base):
    """Drawing on map (arrows, lines, shapes)"""

    __tablename__ = "drawings"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, nullable=False)
    type = Column(String(20), nullable=False)  # arrow, line, circle, text
    points = Column(Text)  # JSON string of points
    color = Column(String(20), default="#FF0000")
    stroke_width = Column(Integer, default=2)
    created_by = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_engine():
    """Get database engine"""
    db_url = os.getenv("DATABASE_URL", "sqlite:///war_map.db")
    return create_engine(db_url, connect_args={"check_same_thread": False})


def get_session():
    """Get database session"""
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()


def init_db():
    """Initialize database tables"""
    engine = get_engine()
    Base.metadata.create_all(engine)
