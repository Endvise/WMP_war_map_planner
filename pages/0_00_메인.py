"""
Main page - War Map Strategy Board
"""

import streamlit as st
import random
from components import war_map_canvas
from database import (
    get_all_sessions,
    get_session_by_id,
    create_session as db_create_session,
    delete_session as db_delete_session,
    get_icons_by_session,
    get_flags_by_session,
    get_drawings_by_session,
    create_icon,
    update_icon_position,
    delete_icon,
    create_flag,
    update_flag_memo,
    delete_flag,
    create_drawing,
    delete_drawing,
)


def init_session_state():
    """Initialize session state"""
    if "current_session_id" not in st.session_state:
        st.session_state.current_session_id = None
    if "sessions" not in st.session_state:
        st.session_state.sessions = []
    if "user_color" not in st.session_state:
        colors = [
            "#FF0000",
            "#00FF00",
            "#0000FF",
            "#FFFF00",
            "#FF00FF",
            "#00FFFF",
            "#FFA500",
            "#800080",
        ]
        st.session_state.user_color = random.choice(colors)


def load_sessions():
    """Load all sessions from Supabase"""
    sessions = get_all_sessions()
    st.session_state.sessions = [
        {"id": s["id"], "name": s["name"], "event_type": s.get("event_type", "general")}
        for s in sessions
    ]


def create_session(name: str, event_type: str = "general"):
    """Create new session"""
    db_create_session(
        name=name, event_type=event_type, created_by=st.session_state.user_id
    )
    load_sessions()


def delete_session(session_id: int):
    """Delete session"""
    db_delete_session(session_id)
    if st.session_state.current_session_id == session_id:
        st.session_state.current_session_id = None
    load_sessions()


def main():
    """Main war map page"""
    st.set_page_config(page_title="전쟁맵 전략", page_icon="🗺️")

    # Check login
    if not st.session_state.get("logged_in"):
        st.error("로그인이 필요합니다.")
        st.switch_page("../login.py")

    init_session_state()
    load_sessions()

    # Sidebar - Session list
    with st.sidebar:
        st.header("📋 이벤트 목록")

        # Create new session
        with st.expander("새 이벤트 추가", expanded=False):
            new_name = st.text_input("이벤트 이름")
            new_type = st.selectbox(
                "이벤트 타입",
                [
                    "general",
                    "pompeii",
                    "ireland",
                    "archipelago",
                    "extreme",
                    "prohibited",
                ],
            )
            if st.button("추가"):
                if new_name:
                    create_session(new_name, new_type)
                    st.success(f"'{new_name}' 이벤트 생성됨")

        st.divider()

        # Admin management link (master admin only)
        if st.session_state.get("is_master_admin"):
            if st.button("⚙️ 관리자 설정", key="admin_settings"):
                st.switch_page("pages/1_01_관리자설정.py")

        # Logout
        if st.button("🚪 로그아웃", key="logout"):
            st.switch_page("../login.py")

        st.divider()

        # Session list
        for s in st.session_state.sessions:
            col1, col2 = st.columns([3, 1])
            with col1:
                if st.button(s["name"], key=f"session_{s['id']}"):
                    st.session_state.current_session_id = s["id"]
            with col2:
                if st.button("🗑️", key=f"delete_{s['id']}"):
                    delete_session(s["id"])
                    st.rerun()

    # Main area
    st.title("🗺️ 전쟁맵 전략")
    st.markdown(
        f"**로그인**: {st.session_state.nickname} | **내 색상**: {st.session_state.user_color}"
    )

    if st.session_state.current_session_id:
        session = get_session_by_id(st.session_state.current_session_id)
        st.info(f"현재 세션: {session['name'] if session else 'Unknown'}")

        # Render War Map Canvas
        war_map_canvas(
            supabase_url=st.session_state.get("supabase_url", ""),
            supabase_key=st.session_state.get("supabase_key", ""),
            session_id=st.session_state.current_session_id,
            user_id=st.session_state.get("user_id", 0),
            user_nickname=st.session_state.get("nickname", "User"),
            user_color=st.session_state.get("user_color", "#e94560"),
            key=f"canvas_{st.session_state.current_session_id}",
        )
    else:
        st.info("왼쪽에서 이벤트를 선택하거나 새로 추가하세요.")


if __name__ == "__main__":
    main()
