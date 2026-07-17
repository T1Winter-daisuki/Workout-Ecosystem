'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

interface ProfileData {
  name: string;
  username: string;
  email: string | null;
  avatar? : string | null;
}

const fieldBoxStyle = {
  border: '2px solid #980422',
  borderRadius: '999px',
  height: '48px',
  backgroundColor: 'white',
};

// Email dài (phần trước @ có hơn 3 ký tự): giữ 3 ký tự đầu, phần còn lại (tới trước @) thay bằng *.
// Email ngắn (phần trước @ <= 3 ký tự): ẩn hẳn, không lộ độ dài thật.
function maskEmail(email: string): string {
  const [local = '', domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 3) return `***@${domain}`;
  return `${local.slice(0, 3)}${'*'.repeat(local.length - 3)}@${domain}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then((res) => res.json())
      .then(setProfile)
      .catch(() => {});
  }, []);

  const startEditName = () => {
    setNameInput(profile?.name ?? '');
    setEditingName(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !profile) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiFetch('/api/auth/avatar', {
        method: 'PATCH',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, avatar: data.avatar });
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveName = async () => {
    const name = nameInput.trim();
    if (!name || !profile) return;
    setSavingName(true);
    try {
      const res = await apiFetch('/api/auth/name', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setProfile({ ...profile, name });
        setEditingName(false);
      }
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="flex-1 w-full px-6 pt-8 pb-8 flex flex-col gap-6 relative">
      {/* AVATAR */}
      <div className="w-full flex justify-end pr-1 mb-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploadingAvatar}
          aria-label="Đổi ảnh đại diện"
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ border: '3px solid #980422', backgroundColor: '#f6e4e4' }}
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#980422" strokeWidth="2"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#980422" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* NAME — sửa được tại chỗ */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-black tracking-widest" style={{ color: '#0d294d' }}>
          NAME
        </label>
        <div className="px-4 flex items-center justify-between gap-2" style={fieldBoxStyle}>
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName();
                if (e.key === 'Escape') setEditingName(false);
              }}
              className="flex-1 min-w-0 font-bold tracking-widest outline-none"
              style={{ color: '#980422' }}
            />
          ) : (
            <span className="font-bold tracking-widest truncate" style={{ color: '#980422' }}>
              {profile?.name ?? '...'}
            </span>
          )}

          {editingName ? (
            <button
              onClick={saveName}
              disabled={savingName}
              aria-label="Lưu tên"
              className="shrink-0 transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 12l5 5L20 6" stroke="#980422" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              onClick={startEditName}
              aria-label="Sửa tên"
              className="shrink-0 transition-opacity hover:opacity-70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="#980422" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* USERNAME */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-black tracking-widest" style={{ color: '#0d294d' }}>
          USERNAME
        </label>
        <div className="px-4 flex items-center" style={fieldBoxStyle}>
          <span className="font-bold tracking-widest" style={{ color: '#980422' }}>
            {profile?.username ?? '...'}
          </span>
        </div>
      </div>

      {/* PASSWORD */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-black tracking-widest" style={{ color: '#0d294d' }}>
          PASSWORD
        </label>
        <button
          onClick={() => router.push('/forgot-password')}
          className="px-4 flex items-center w-full transition-opacity hover:opacity-70"
          style={fieldBoxStyle}
        >
          <span className="font-bold tracking-widest" style={{ color: '#980422' }}>
            ••••••••
          </span>
        </button>
      </div>

      {/* EMAIL */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-black tracking-widest" style={{ color: '#0d294d' }}>
          EMAIL
        </label>
        <div className="px-4 flex items-center" style={fieldBoxStyle}>
          <span className="font-bold tracking-widest" style={{ color: '#980422' }}>
            {profile?.email ? maskEmail(profile.email) : '...'}
          </span>
        </div>
      </div>
    </div>
  );
}
