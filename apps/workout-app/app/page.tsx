'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-white"
      style={{ minHeight: '100svh', maxWidth: '460px', margin: '0 auto' }}
    >
      {/* Pattern góc trên trái */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <Image
          src="/patternL.svg"
          alt=""
          width={250}
          height={300}
          priority
        />
      </div>

      {/* Content giữa */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-24 pb-4"
      style={{ height: 'calc(100svh - 340px)' }}>
        <Image
          src="/Logo.png"
          alt="H4C Logo"
          width={160}
          height={160}
          className="mb-10"
          priority
        />
        <h1
          className="text-3xl font-black text-center tracking-wide"
          style={{ color: '#d64b29' }}
        >
          WELCOME TO
        </h1>
        <h1
          className="text-4xl font-black text-center tracking-widest mt-1"
          style={{ color: '#ed9231' }}
        >
          H4C
        </h1>
      </div>

      {/* Bottom card */}
      <div
        className="w-full flex flex-col items-center justify-center gap-5"
        style={{
          backgroundColor: '#980422',
          borderRadius: '48px 48px 0 0',
          height: '328px',
        }}
      >
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
      </div>
    </div>
  )
}