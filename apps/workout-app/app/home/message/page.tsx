'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

interface Conversation {
  username: string;
  name: string;
  lastMessage: string;
  avatar?: string | null;
  unread?: boolean;
}

interface UserResult {
  username: string;
  name: string;
  avatar?: string | null;
}

function Avatar({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div
      className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
      style={{ border: '2px solid #980422' }}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#eec9cf' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#980422" strokeWidth="2"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#980422" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

export default function MessagePage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);

  useEffect(() => {
    apiFetch('/api/chat/conversations')
      .then((res) => res.json())
      .then(setConversations)
      .catch(() => {});
  }, []);

  // Tìm user theo query, debounce 300ms để không gọi API theo từng phím
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      apiFetch(`/api/chat/users?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then(setResults)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <div
      className="px-5 pt-6 pb-6 flex flex-col"
      style={{ height: 'calc(100svh - 105px - 111px)' }}
    >

      {/* Search bar */}
      <div className="relative mb-5 flex-shrink-0">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 italic outline-none"
          style={{
            backgroundColor: '#f6c9cf',
            border: '2px solid #980422',
            borderRadius: '999px',
            color: '#980422',
          }}
        />
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          className="absolute right-4 top-1/2"
          style={{ transform: 'translateY(-50%)' }}
        >
          <circle cx="11" cy="11" r="7" stroke="#980422" strokeWidth="2"/>
          <path d="M20 20L16.5 16.5" stroke="#980422" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Đang gõ: kết quả tìm user — Bình thường: danh sách hội thoại */}
      <div
        className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-y-auto"
        style={{ backgroundColor: '#f6c9cf', scrollbarWidth: 'none' }}
      >
        {searching ? (
          results.map((user, i) => (
            <button
              key={user.username}
              onClick={() => router.push(`/home/message/${user.username}`)}
              className="flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-black/5"
              style={{
                borderBottom: i < results.length - 1 ? '1px solid rgba(152,4,34,0.15)' : 'none',
              }}
            >
              <Avatar src={user.avatar} alt={user.name} />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: '#980422' }}>
                  {user.name}
                </p>
                <p className="text-sm truncate" style={{ color: '#5a3a42' }}>
                  @{user.username}
                </p>
              </div>
            </button>
          ))
        ) : (
          conversations.map((conv, i) => (
            <button
              key={conv.username}
              onClick={() => router.push(`/home/message/${conv.username}`)}
              className="flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-black/5"
              style={{
                borderBottom: i < conversations.length - 1 ? '1px solid rgba(152,4,34,0.15)' : 'none',
              }}
            >
              <Avatar src={conv.avatar} alt={conv.name} />

              {/* Name + preview */}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: '#980422' }}>
                  {conv.name}
                </p>
                <p className="text-sm truncate" style={{ color: '#5a3a42' }}>
                  {conv.lastMessage}
                </p>
              </div>

              {/* Unread dot */}
              {conv.unread && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#980422' }}
                />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
