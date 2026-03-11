"""
War Map Canvas Component for Streamlit
"""

import streamlit.components.v1 as components
import os


def war_map_canvas(
    supabase_url: str,
    supabase_key: str,
    session_id: int,
    user_nickname: str,
    user_color: str,
    key: str = "war_map_canvas",
):
    """
    Render the Fabric.js war map canvas component.

    Args:
        supabase_url: Supabase project URL
        supabase_key: Supabase anon key
        session_id: Current session ID
        user_nickname: Current user's nickname
        user_color: Current user's assigned color
        key: Streamlit component key

    Returns:
        None (renders the canvas)
    """
    # Get the component HTML path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(current_dir, "war_map_canvas.html")

    # Read HTML file
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Inject Streamlit config as JavaScript
    config_script = f"""
    <script>
        window.streamlitConfig = {{
            supabaseUrl: '{supabase_url}',
            supabaseKey: '{supabase_key}',
            sessionId: {session_id},
            userNickname: '{user_nickname}',
            userColor: '{user_color}'
        }};
    </script>
    """

    # Inject before </head>
    html_content = html_content.replace("</head>", f"{config_script}</head>")

    # Render component
    components.html(html_content, height=700, scrolling=True)
