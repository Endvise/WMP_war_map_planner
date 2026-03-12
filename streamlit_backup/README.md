# War Map Strategy - 둠스데이 라스트서바이버 전쟁맵 전략

둠스데이 라스트서바이버 게임의 전쟁 이벤트를 위한 전략 협업 플랫폼

## Features

- 🗺️ Fabric.js 기반 인터랙티브 맵 캔버스
- 👤 유저 아이콘 배치 (드래그 앤 드롭, 테두리 색상)
- 🚩 플래그 및 메모 markers
- ➡️ 화살표, 선, 사각형, 원, 텍스트 그리기 도구
- 🔄 실시간 동기화 (Supabase Polling)
- 👥 다중 사용자 협업

## Tech Stack

- **Frontend**: Streamlit + Fabric.js
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Auth**: bcrypt

## Deployment to Streamlit Cloud

### 1. GitHub에 푸시
이미 완료됨

### 2. Streamlit Cloud에서 앱 생성
1. https://share.streamlit.io 접속
2. GitHub로 로그인
3. `WMP_war_map_planner` 저장소 선택
4. Branch: `master`
5. Main file path: `login.py`
6. Python version: 3.9+

### 3. Secrets 설정
Settings → Secrets에 다음 추가:

```toml
SUPABASE_URL = "https://rdhbbtwllmrafhitdwlq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkaGJidHdsbG1yYWZoaXRkd2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMTA2NzQsImV4cCI6MjA4ODY4NjY3NH0.AsmGYYbp1W5jlciALY7isHVWWj6_GGXoM47-HLeEpnc"
```

### 4. Deploy
Deploy 버튼 클릭

## Local Development

```bash
# Clone
git clone https://github.com/Endvise/WMP_war_map_planner.git
cd WMP_war_map_planner

# Virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install
pip install -r requirements.txt

# Run
streamlit run login.py
```

## 기본 계정

- Username: `admin`
- Password: `admin123`

## Supabase Database Tables

- `admin_users` - 관리자 사용자
- `war_map_sessions` - 전쟁 이벤트 세션
- `user_icons` - 맵上の 유저 아이콘
- `flags` - 플래그 및 메모
- `drawings` - 그리기 요소

## License

MIT
