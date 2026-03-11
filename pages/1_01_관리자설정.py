"""
Admin Management Page - For master admin to manage admin accounts
"""

import streamlit as st
import bcrypt
from database import (
    get_all_admins,
    get_admin_by_id,
    create_admin_user,
    delete_admin_user,
)
from login import hash_password


def init_session_state():
    """Initialize session state"""
    if "is_master_admin" not in st.session_state:
        st.session_state.is_master_admin = False


def main():
    """Admin management page"""
    st.set_page_config(page_title="관리자 설정", page_icon="⚙️")

    # Check login
    if not st.session_state.get("logged_in"):
        st.error("로그인이 필요합니다.")
        st.switch_page("../login.py")

    init_session_state()

    # Check if master admin
    admin = get_admin_by_id(st.session_state.user_id)
    if not admin or not admin.get("is_master", False):
        st.error("접근 권한이 없습니다. 마스터 관리자만 접근 가능합니다.")
        st.switch_page("pages/0_00_메인.py")
        return

    st.title("⚙️ 관리자 계정 관리")
    st.markdown("마스터 관리자가 다른 관리자 계정을 추가/삭제할 수 있습니다.")

    # Load current admins
    admins = get_all_admins()

    # Sidebar - Add new admin
    with st.sidebar:
        st.header("➕ 관리자 추가")

        with st.form("add_admin_form"):
            new_username = st.text_input("사용자명")
            new_nickname = st.text_input("닉네임")
            new_password = st.text_input("비밀번호", type="password")
            confirm_password = st.text_input("비밀번호 확인", type="password")

            is_master = st.checkbox("마스터 관리자 권한")

            submit = st.form_submit_button("추가")

            if submit:
                if not new_username or not new_nickname or not new_password:
                    st.error("모든 필드를 입력해주세요.")
                elif new_password != confirm_password:
                    st.error("비밀번호가 일치하지 않습니다.")
                elif any(a["username"] == new_username for a in admins):
                    st.error("이미 존재하는 사용자명입니다.")
                else:
                    password_hash = hash_password(new_password)
                    create_admin_user(
                        new_username, new_nickname, password_hash, is_master
                    )
                    st.success(f"'{new_nickname}' 관리자가 추가되었습니다!")
                    st.rerun()

    # Display admin list
    st.subheader("📋 관리자 목록")

    if not admins:
        st.info("등록된 관리자가 없습니다.")
    else:
        for admin in admins:
            col1, col2, col3, col4 = st.columns([2, 2, 1, 1])

            with col1:
                st.write(f"**{admin['nickname']}**")
                st.caption(f"@{admin['username']}")

            with col2:
                if admin.get("is_master", False):
                    st.badge("마스터 관리자", color="red")
                else:
                    st.badge("일반 관리자", color="gray")

            with col3:
                st.caption(f"ID: {admin['id']}")

            with col4:
                # Can't delete yourself or master admin
                if admin["id"] != st.session_state.user_id and not admin.get(
                    "is_master", False
                ):
                    if st.button("🗑️ 삭제", key=f"delete_{admin['id']}"):
                        delete_admin_user(admin["id"])
                        st.success(f"'{admin['nickname']}' 관리자가 삭제되었습니다.")
                        st.rerun()
                elif admin["id"] == st.session_state.user_id:
                    st.caption("(본인)")
                else:
                    st.caption("")

    st.divider()

    # Back to main
    if st.button("← 메인으로 돌아가기"):
        st.switch_page("pages/0_00_메인.py")


if __name__ == "__main__":
    main()
