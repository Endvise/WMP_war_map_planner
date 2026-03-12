'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  nickname: string;
  isMaster: boolean;
}

interface Admin {
  id: number;
  username: string;
  nickname: string;
  is_master: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // New admin form
  const [newUsername, setNewUsername] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMaster, setIsMaster] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      if (!sessionData.isMaster) {
        router.push('/main');
        return;
      }

      await loadAdmins();
    } catch (err) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to load admins:', err);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername || !newNickname || !newPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (admins.some(a => a.username === newUsername)) {
      setError('이미 존재하는 사용자명입니다.');
      return;
    }

    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          nickname: newNickname,
          password: newPassword,
          isMaster,
        }),
      });

      if (res.ok) {
        setSuccess(`'${newNickname}' 관리자가 추가되었습니다!`);
        setNewUsername('');
        setNewNickname('');
        setNewPassword('');
        setConfirmPassword('');
        setIsMaster(false);
        loadAdmins();
      } else {
        setError('관리자 추가에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류');
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('이 관리자를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/admins?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAdmins();
      }
    } catch (err) {
      console.error('Failed to delete admin:', err);
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
          <h1 className="text-xl font-bold">⚙️ 관리자 계정 관리</h1>
          <button
            onClick={() => router.push('/main')}
            className="px-4 py-2 bg-[#0f3460] hover:bg-[#1a4a7a] rounded-lg transition-colors"
          >
            ← 메인으로
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Add Admin */}
        <aside className="w-80 bg-[#16213e] border-r border-[#0f3460] p-6">
          <h2 className="text-lg font-semibold mb-4">➕ 관리자 추가</h2>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1 text-sm">사용자명</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a14] border border-[#0f3460] rounded-lg text-white text-sm"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 text-sm">닉네임</label>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a14] border border-[#0f3460] rounded-lg text-white text-sm"
                placeholder="닉네임"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 text-sm">비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a14] border border-[#0f3460] rounded-lg text-white text-sm"
                placeholder="비밀번호"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 text-sm">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a14] border border-[#0f3460] rounded-lg text-white text-sm"
                placeholder="비밀번호 확인"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMaster"
                checked={isMaster}
                onChange={(e) => setIsMaster(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isMaster" className="text-sm text-gray-300">
                마스터 관리자 권한
              </label>
            </div>

            {error && (
              <div className="p-2 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-2 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-[#e94560] hover:bg-[#d63850] rounded-lg transition-colors"
            >
              추가
            </button>
          </form>
        </aside>

        {/* Main - Admin List */}
        <main className="flex-1 p-6">
          <h2 className="text-lg font-semibold mb-4">📋 관리자 목록</h2>

          {admins.length === 0 ? (
            <p className="text-gray-500">등록된 관리자가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {admins.map(admin => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-[#0a0a14] rounded-lg"
                >
                  <div>
                    <div className="font-medium">{admin.nickname}</div>
                    <div className="text-sm text-gray-500">@{admin.username}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    {admin.is_master ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        마스터 관리자
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                        일반 관리자
                      </span>
                    )}

                    <span className="text-sm text-gray-500">ID: {admin.id}</span>

                    {!admin.is_master && admin.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                      >
                        🗑️
                      </button>
                    )}

                    {admin.id === user?.id && (
                      <span className="text-sm text-gray-500">(본인)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
