"""
Login page - Entry point for War Map Strategy
"""

import streamlit as st
import bcrypt
from database import get_session, AdminUser, init_db


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


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def login(username: str, password: str) -> bool:
    """Login user"""
    session = get_session()
    try:
        user = session.query(AdminUser).filter(AdminUser.username == username).first()
        if user and verify_password(password, user.password_hash):
            st.session_state.logged_in = True
            st.session_state.user_id = user.id
            st.session_state.nickname = user.nickname
            st.session_state.username = user.username
            return True
        return False
    finally:
        session.close()


def logout():
    """Logout user"""
    st.session_state.logged_in = False
    st.session_state.user_id = None
    st.session_state.nickname = None
    st.session_state.username = None


def create_default_admin():
    """Create default admin user if not exists"""
    session = get_session()
    try:
        admin = session.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not admin:
            default_password = "admin123"  # Change in production
            admin = AdminUser(
                username="admin",
                nickname="Admin",
                password_hash=hash_password(default_password),
            )
            session.add(admin)
            session.commit()
    finally:
        session.close()


def main():
    """Main login page"""
    st.set_page_config(page_title="전쟁맵 전략 - 로그인", page_icon="🗺️")

    init_session_state()
    init_db()
    create_default_admin()

    # Redirect if already logged in
    if st.session_state.logged_in:
        st.switch_page("pages/0_00_메인.py")

    st.title("🗺️ 전쟁맵 전략")
    st.markdown("둠스데이 라스트서바이버 전쟁 이벤트 전략 협업 플랫폼")

    with st.form("login_form"):
        username = st.text_input("사용자명")
        password = st.text_input("비밀번호", type="password")
        submit = st.form_submit_button("로그인")

        if submit:
            if login(username, password):
                st.success("로그인 성공!")
                st.switch_page("pages/0_00_메인.py")
            else:
                st.error("사용자명 또는 비밀번호가 올바르지 않습니다.")


if __name__ == "__main__":
    main()
