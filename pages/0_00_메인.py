"""
Main page - War Map Strategy Board
"""

import streamlit as st
from database import get_session, WarMapSession, UserIcon, Flag, Drawing


def init_session_state():
    """Initialize session state"""
    if "current_session_id" not in st.session_state:
        st.session_state.current_session_id = None
    if "sessions" not in st.session_state:
        st.session_state.sessions = []
    if "user_color" not in st.session_state:
        # Assign a random color for this user
        import random

        colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]
        st.session_state.user_color = random.choice(colors)


def load_sessions():
    """Load all sessions"""
    session = get_session()
    try:
        sessions = session.query(WarMapSession).all()
        st.session_state.sessions = [
            {"id": s.id, "name": s.name, "event_type": s.event_type} for s in sessions
        ]
    finally:
        session.close()


def create_session(name: str, event_type: str = "general"):
    """Create new session"""
    session = get_session()
    try:
        new_session = WarMapSession(
            name=name, event_type=event_type, created_by=st.session_state.user_id
        )
        session.add(new_session)
        session.commit()
        load_sessions()
    finally:
        session.close()


def delete_session(session_id: int):
    """Delete session"""
    session = get_session()
    try:
        # Delete related items first
        session.query(UserIcon).filter(UserIcon.session_id == session_id).delete()
        session.query(Flag).filter(Flag.session_id == session_id).delete()
        session.query(Drawing).filter(Drawing.session_id == session_id).delete()
        session.query(WarMapSession).filter(WarMapSession.id == session_id).delete()
        session.commit()
        load_sessions()
    finally:
        session.close()


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
        st.info(f"현재 세션: {st.session_state.current_session_id}")
        # TODO: Load map canvas here
    else:
        st.info("왼쪽에서 이벤트를 선택하거나 새로 추가하세요.")


if __name__ == "__main__":
    main()
