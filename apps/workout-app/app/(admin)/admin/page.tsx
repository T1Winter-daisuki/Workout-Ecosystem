'use client';

import { useRouter } from 'next/navigation';
import { clearTokens } from '@/lib/auth';

const adminMenu = [
  { id: 'create', label: 'Create\naccount', icon: '/Admin pattern/create.svg', href: '/register' },
  { id: 'home', label: 'Home', icon: '/Admin pattern/home.svg', href: '/home' },
  { id: 'settings', label: 'Settings', icon: '/Admin pattern/settings.svg', href: '/admin/settings' },
  { id: 'profile', label: 'Profile', icon: '/Admin pattern/profile.svg', href: '/admin/profile' },
  { id: 'inbox', label: 'Inbox', icon: '/Admin pattern/inbox.svg', href: '/admin/inbox' },
  { id: 'ranking', label: 'Ranking', icon: '/Admin pattern/ranking.svg', href: '/admin/ranking' },
];

export default function AdminPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
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
            src="/Logo/Logo_trans.png"
            alt="Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>

      <div className="flex-1 px-8 pt-[clamp(0.75rem,2svh,2rem)] pb-[clamp(0.75rem,2svh,2rem)] flex flex-col items-center w-full">

        <div className="w-full grid grid-cols-2 gap-y-[clamp(0.75rem,4svh,3rem)]">
          {adminMenu.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-3">
              <button
                onClick={() => item.href && router.push(item.href)}
                className="w-[clamp(84px,13.5svh,125px)] h-[clamp(84px,13.5svh,125px)] bg-white border-[4px] rounded-[16px] flex items-center justify-center shadow-md active:scale-95"
                style={{ borderColor: '#980422' }}
              >
                <img
                  src={item.icon}
                  alt={item.id}
                  className="w-[72%] h-[64%] object-contain"
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

        <div className="flex-1 min-h-8" />

        <button
          onClick={handleSignOut}
          className="shrink-0 flex items-center justify-center font-black text-xl tracking-widest active:scale-95 mb-6"
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