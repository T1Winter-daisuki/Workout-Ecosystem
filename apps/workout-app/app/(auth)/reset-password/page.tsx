'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';

export default function OTPPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendMsg('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      const email = sessionStorage.getItem('resetEmail') || '';

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otp: form.otp,
            newPassword: form.newPassword,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      sessionStorage.removeItem('resetEmail')
      router.push('/login');
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMsg('');
    try {
      const email = sessionStorage.getItem('resetEmail') || '';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, type: 'reset' }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setResendMsg('OTP mới đã được gửi về email');
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    }
  };

  const inputStyle = {
    backgroundColor: '#7a0318',
    border: '5px solid #ff5c00',
    borderRadius: '10px',
    height: '51px',
    width: '250px',
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-white"
      style={{ minHeight: '100svh', maxWidth: '460px', margin: '0 auto' }}
    >
      {/* Pattern */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <Image src="/patternL.svg" alt="" width={250} height={300} priority />
      </div>

      {/* Back button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => router.push('/activate')}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ backgroundColor: '#ff5c00' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Logo + Title */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8"
        style={{ paddingTop: '80px' }}
      >
        <Image
          src="/Logo.png"
          alt="H4C Logo"
          width={160}
          height={160}
          className="mb-6"
          priority
        />
        <h1
          className="text-5xl font-black text-center tracking-wide"
          style={{ color: '#d64b29' }}
        >
          Reset
        </h1>
        <h1
          className="text-5xl font-black text-center tracking-wide"
          style={{ color: '#d64b29' }}
        >
          Password
        </h1>
      </div>

      {/* Bottom card */}
      <div
        className="w-full px-8 flex flex-col"
        style={{
          backgroundColor: '#980422',
          borderRadius: '48px 48px 0 0',
          height: '480px',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '40px',
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* OTP */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-black tracking-widest"
              style={{ color: '#ed9231' }}
            >
              OTP
            </label>
            <input
              type="text"
              placeholder="Enter OTP here"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              maxLength={6}
              required
              className="px-4 py-3 text-white placeholder-white/60 outline-none"
              style={inputStyle}
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-black tracking-widest"
              style={{ color: '#ed9231' }}
            >
              NEW PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              required
              className="px-4 py-3 text-white placeholder-white/60 outline-none"
              style={inputStyle}
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-black tracking-widest"
              style={{ color: '#ed9231' }}
            >
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
              className="px-4 py-3 text-white placeholder-white/60 outline-none"
              style={inputStyle}
            />
          </div>

          {error ? (
            <p className="text-sm text-center" style={{ color: '#ffb3a0' }}>
              {error}
            </p>
          ) : resendMsg ? (
            <p className="text-sm text-center" style={{ color: '#86efac' }}>
              {resendMsg}
            </p>
          ) : null}

          {/* Resend OTP */}
          <button
            type="button"
            onClick={handleResend}
            className="text-sm underline text-left transition-opacity hover:opacity-70"
            style={{ color: '#ffffff', width: '250px' }}
          >
            Resend OTP here
          </button>

          {/* Confirm button */}
          <button
            type="submit"
            disabled={loading}
            className="font-bold text-lg tracking-widest transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: '#ff5c00',
              color: '#ffffff',
              width: '250px',
              height: '51px',
              borderRadius: '10px',
              alignSelf: 'center',
            }}
          >
            {loading ? '...' : 'CONFIRM'}
          </button>
        </form>
      </div>
    </div>
  );
}