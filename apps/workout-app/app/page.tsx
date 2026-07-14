'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthCard } from '@/components/auth/AuthCard';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <AuthBackground>
      {/* Content giữa */}
      <div
        className="flex-1 flex flex-col items-center px-8 pb-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out"
        style={{ paddingTop: '160px' }}
      >
        <Image
          src="/Logo.png"
          alt="H4C Logo"
          width={160}
          height={160}
          className="mb-10"
          priority
        />
        <h1
          className="text-5xl font-black text-center tracking-wide"
          style={{ color: '#d64b29' }}
        >
          WELCOME TO
        </h1>
        <h1
          className="text-5xl font-black text-center tracking-widest mt-1"
          style={{ color: '#ed9231' }}
        >
          H4C
        </h1>
      </div>

      <AuthCard height="328px" className="gap-5">
        {/* Login */}
        <button
          onClick={() => router.push('/login')}
          className="font-bold text-lg tracking-wide transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{
            backgroundColor: '#ff5c00',
            color: '#ffffff',
            width: '230px',
            height: '51px',
            borderRadius: '10px',
          }}
        >
          Login
        </button>

        {/* Forgot */}
        <button
          onClick={() => router.push('/forgot-password')}
          className="font-bold text-lg tracking-wide transition-all duration-200 hover:bg-white/10 active:scale-95"
          style={{
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '5px solid #ff5c00',
            width: '230px',
            height: '51px',
            borderRadius: '10px',
          }}
        >
          Forgot Password?
        </button>
      </AuthCard>
    </AuthBackground>
  );
}
