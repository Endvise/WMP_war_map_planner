'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  nickname: string;
  isMaster: boolean;
}

interface Session {
  id: number;
  name: string;
  event_type: string;
  created_at: string;
}

const EVENT_TYPES = [
  { value: 'general', label: '일반' },
  { value: 'pompeii', label: '퐁베이' },
  { value: 'ireland', label: '아일랜드' },
  { value: 'archipelago', label: '군도' },
  { value: 'extreme', label: '익스트림' },
  { value: 'prohibited', label: '금제' },
];

const USER_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080',
];

export default function MainPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionType, setNewSessionType] = useState('general');
  const [userColor] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('war-map-session='));
      if (!cookie) {
        router.push('/');
        return;
      }

      const sessionData = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
      setUser(sessionData);
      await loadSessions();
    } catch (err) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const createSession = async () => {
    if (!newSessionName.trim()) return;

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSessionName,
          eventType: newSessionType,
          createdBy: user?.id,
        }),
      });

      if (res.ok) {
        setNewSessionName('');
        setNewSessionType('general');
        setShowNewSession(false);
        loadSessions();
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const deleteSession = async (id: number) => {
    if (!confirm('이 이벤트를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSessions();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Header */}
      <header className="bg-[#16213e] border-b border-[#0f3460] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">🗺️ 전쟁맵 전략</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              {user?.nickname} | <span style={{ color: userColor }}>내 색상</span>
            </span>
            {user?.isMaster && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-[#0f3460] hover:bg-[#1a4a7a] rounded-lg transition-colors"
              >
                ⚙️ 관리자 설정
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-[#0f3460] hover:bg-[#1a4a7a] rounded-lg transition-colors"
            >
              🚪 로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-[#16213e] border-r border-[#0f3460] p-4">
          <h2 className="text-lg font-semibold mb-4">📋 이벤트 목록</h2>

          {/* New Session */}
          <div className="mb-4">
            {showNewSession ? (
              <div className="space-y-3 p-3 bg-[#0a0a14] rounded-lg">
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="이벤트 이름"
                  className="w-full px-3 py-2 bg-[#16213e] border border-[#0f3460] rounded text-white text-sm"
                />
                <select
                  value={newSessionType}
                  onChange={(e) => setNewSessionType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#16213e] border border-[#0f3460] rounded text-white text-sm"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={createSession}
                    className="flex-1 py-2 bg-[#e94560] hover:bg-[#d63850] rounded text-sm"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => setShowNewSession(false)}
                    className="flex-1 py-2 bg-[#0f3460] hover:bg-[#1a4a7a] rounded text-sm"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewSession(true)}
                className="w-full py-2 bg-[#0f3460] hover:bg-[#1a4a7a] rounded-lg text-sm"
              >
                + 새 이벤트 추가
              </button>
            )}
          </div>

          <div className="border-t border-[#0f3460] pt-4">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">이벤트가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-[#0a0a14] rounded-lg hover:bg-[#0f3460] transition-colors cursor-pointer group"
                    onClick={() => router.push(`/map/${session.id}`)}
                  >
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-xs text-gray-500">
                        {EVENT_TYPES.find(t => t.value === session.event_type)?.label || session.event_type}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">환영합니다!</h2>
            <p className="text-gray-400 mb-8">왼쪽에서 이벤트를 선택하거나 새로 추가하세요.</p>
            {sessions.length > 0 && (
              <button
                onClick={() => router.push(`/map/${sessions[0].id}`)}
                className="px-6 py-3 bg-[#e94560] hover:bg-[#d63850] rounded-lg transition-colors"
              >
                첫 번째 이벤트 시작하기 →
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
