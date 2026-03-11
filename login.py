"""
Login page - Entry point for War Map Strategy
"""

import streamlit as st
import bcrypt
from database import get_admin_by_username, create_admin_user
from config import SUPABASE_URL, SUPABASE_KEY


def init_session_state():
    """Initialize session state"""
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "user_id" not in st.session_state:
        st.session_state.user_id = None
    if "nickname" not in st.session_state:
        st.session_state.nickname = None
    if "username" not in st.session_state:
        st.session_state.username = None
    if "is_master_admin" not in st.session_state:
        st.session_state.is_master_admin = False


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def login(username: str, password: str) -> bool:
    """Login user"""
    user = get_admin_by_username(username)
    if user and verify_password(password, user["password_hash"]):
        st.session_state.logged_in = True
        st.session_state.user_id = user["id"]
        st.session_state.nickname = user["nickname"]
        st.session_state.username = user["username"]
        st.session_state.is_master_admin = user.get("is_master", False)
        # Store Supabase credentials for canvas component
        st.session_state.supabase_url = SUPABASE_URL
        st.session_state.supabase_key = SUPABASE_KEY
        return True
    return False


def logout():
    """Logout user"""
    st.session_state.logged_in = False
    st.session_state.user_id = None
    st.session_state.nickname = None
    st.session_state.username = None
    st.session_state.is_master_admin = False
    st.session_state.supabase_url = None
    st.session_state.supabase_key = None


def create_default_admin():
    """Create default admin user if not exists"""
    existing = get_admin_by_username("endvise")
    if not existing:
        default_password = "a12503934!"
        create_admin_user(
            username="endvise",
            nickname="MasterAdmin",
            password_hash=hash_password(default_password),
            is_master=True
        )
    """Create default admin user if not exists"""
    existing = get_admin_by_username("admin")
    if not existing:
        default_password = "admin123"  # Change in production
        create_admin_user(
            username="admin",
            nickname="Admin",
            password_hash=hash_password(default_password),
            is_master=True,  # First admin is master
        )


def main():
    """Main login page"""
    st.set_page_config(page_title="전쟁맵 전략 - 로그인", page_icon="🗺️")

    init_session_state()

    # Force logout if user clicked logout
    if st.session_state.get("force_logout", False):
        logout()
        st.session_state.force_logout = False
        st.rerun()

    create_default_admin()

    # Show login form (don't auto-redirect if already logged in - let user login)
    st.title("🗺️ 전쟁맵 전략")
    st.markdown("둠스데이 라스트서바이버 전쟁 이벤트 전략 협업 플랫폼")

    with st.form("login_form"):
        username = st.text_input("사용자명")
        password = st.text_input("비밀번호", type="password")
        submit = st.form_submit_button("로그인")

        if submit:
            if login(username, password):
                st.success("로그인 성공!")
                st.rerun()
            else:
                st.error("사용자명 또는 비밀번호가 올바르지 않습니다.")


if __name__ == "__main__":
    main()
