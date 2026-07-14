'use client';

import { useRouter } from 'next/navigation';

const adminMenu = [
  { id: 'create', label: 'Create\naccount', icon: '/create.svg' },
  { id: 'home', label: 'Home', icon: '/home.svg' },
  { id: 'settings', label: 'Settings', icon: '/settings.svg' },
  { id: 'profile', label: 'Profile', icon: '/profile.svg' },
  { id: 'inbox', label: 'Inbox', icon: '/inbox.svg' },
  { id: 'ranking', label: 'Ranking', icon: '/ranking.svg' },
];

export default function AdminPage() {
  const router = useRouter();

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
        <button
          onClick={() => router.back()}
          className="w-20 h-20 flex items-center justify-center active:scale-95"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M24 12H5M5 12L12 19M5 12L12 5"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

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
      <div className="flex-1 px-8 pt-14 pb-8 flex flex-col items-center w-full">

        <div className="h-10" />
        
        <div className="w-full grid grid-cols-2 gap-y-12">
          {adminMenu.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-3">
              <button
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

        <div className="h-20" />

        <button
          onClick={() => router.push('/login')}
          className="flex items-center justify-center font-black text-xl tracking-widest active:scale-95 mb-6"
          style={{
            backgroundColor: '#980422',
            color: '#ffffff',
            width: '260px',
            height: '60px',
            borderRadius: '16px',
          }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}