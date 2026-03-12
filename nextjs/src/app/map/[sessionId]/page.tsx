'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const WarMapCanvas = dynamic(() => import('@/components/WarMapCanvas'), { ssr: false });

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
}

const USER_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080',
];

export default function MapPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = parseInt(params.sessionId as string);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
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

      // Load session
      const res = await fetch(`/api/sessions?id=${sessionId}`);
      if (!res.ok) {
        router.push('/main');
        return;
      }
      const sessionData2 = await res.json();
      setSession(sessionData2);
    } catch (err) {
      router.push('/');
    } finally {
      setLoading(false);
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
    <div className="h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="bg-[#16213e] border-b border-[#0f3460] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/main')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 목록
          </button>
          <h1 className="text-lg font-semibold text-white">
            🗺️ {session?.name || '세션'}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>로그인: {user?.nickname}</span>
          <span style={{ color: userColor }}>내 색상</span>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <WarMapCanvas
          sessionId={sessionId}
          userId={user?.id || 0}
          userNickname={user?.nickname || 'User'}
          userColor={userColor}
        />
      </div>
    </div>
  );
}
