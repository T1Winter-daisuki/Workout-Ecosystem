'use client';

import { useRouter } from 'next/navigation';
import { getRefreshToken, clearTokens } from '@/lib/auth';

const adminMenu = [
  { id: 'create', label: 'Create\naccount', icon: '/create.svg', href: '/register' },
  { id: 'home', label: 'Home', icon: '/home.svg', href: '/home' },
  { id: 'settings', label: 'Settings', icon: '/settings.svg', href: '/admin/settings' },
  { id: 'profile', label: 'Profile', icon: '/profile.svg', href: '/admin/profile' },
  { id: 'inbox', label: 'Inbox', icon: '/inbox.svg', href: '/admin/inbox' },
  { id: 'ranking', label: 'Ranking', icon: '/ranking.svg', href: '/admin/ranking' },
];

export default function AdminPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const refreshToken = getRefreshToken();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {}
    clearTokens();
    router.push('/login');
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#f6e4e4',
        height: '100svh',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          backgroundColor: '#980422',
          height: '105px',
          borderRadius: '0 0 16px 16px',
        }}
      >
        <div className="w-20 h-20" />

        <h1 className="text-5xl font-black text-white tracking-wide text-center flex-1">
          Admin
        </h1>

        <div className="w-20 h-20 flex items-center">
          <img
            src="/Logo_trans.png"
            alt="Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 px-8 pt-14 pb-8 flex flex-col items-center w-full overflow-y-auto">

        <div className="h-10" />
        
        <div className="w-full grid grid-cols-2 gap-y-12">
          {adminMenu.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-3">
              <button
                onClick={() => item.href && router.push(item.href)}
                className="w-[125px] h-[125px] bg-white border-[4px] rounded-[16px] flex items-center justify-center shadow-md active:scale-95"
                style={{ borderColor: '#980422' }}
              >
                <img 
                  src={item.icon} 
                  alt={item.id} 
                  className="w-[90px] h-[80px] object-contain" 
                />
              </button>

              <span
                className="font-black text-sm text-center leading-tight tracking-wide whitespace-pre-line"
                style={{ color: '#ed9231' }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="h-6" />

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center font-black text-xl tracking-widest active:scale-95 mb-6"
          style={{
            backgroundColor: '#980422',
            color: '#ffffff',
            width: '260px',
            height: '40px',
            borderRadius: '16px',
          }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}