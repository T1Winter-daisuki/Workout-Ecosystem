'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', temporaryPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setSuccess('Tạo tài khoản thành công!');
      setForm({ username: '', temporaryPassword: '' });
    } catch {
      setError('Connection error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-white"
      style={{ minHeight: '100svh', maxWidth: '460px', margin: '0 auto' }}
    >
      {/* Pattern góc trên trái */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <Image src="/patternL.svg" alt="" width={250} height={300} priority />
      </div>

      {/* Back button góc trên phải */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => router.push('/')}
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
        className="flex-1 flex flex-col items-center justify-center px-8 pt-24 pb-4"
        style={{ paddingTop: '80px' }}
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
          Create
        </h1>
        <h1
          className="text-5xl font-black text-center tracking-widest mt-1"
          style={{ color: '#d64b29' }}
        >
          Account
        </h1>
      </div>

      {/* Bottom card */}
      <div
        className="w-full px-8 flex flex-col"
        style={{
          backgroundColor: '#980422',
          borderRadius: '48px 48px 0 0',
          height: '450px',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '70px',
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-black tracking-widest"
              style={{ color: '#ed9231' }}
            >
              USERNAME
            </label>
            <input
              type="text"
              placeholder="Username / Email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="px-4 py-3 text-white placeholder-white/60 outline-none"
              style={{
                backgroundColor: '#7a0318',
                border: '5px solid #ff5c00',
                borderRadius: '10px',
                height: '51px',
                width: '250px',
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-black tracking-widest"
              style={{ color: '#ed9231' }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.temporaryPassword}
              onChange={(e) =>
                setForm({ ...form, temporaryPassword: e.target.value })
              }
              required
              className="px-4 py-3 text-white placeholder-white/60 outline-none"
              style={{
                backgroundColor: '#7a0318',
                border: '5px solid #ff5c00',
                borderRadius: '10px',
                height: '51px',
                width: '250px',
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: '#ffb3a0' }}>
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-center" style={{ color: '#86efac' }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-bold text-lg tracking-widest transition-all duration-200 hover:brightness-110 active:scale-95 mt-2"
            style={{
              backgroundColor: '#ff5c00',
              color: '#ffffff',
              width: '230px',
              height: '51px',
              borderRadius: '10px',
              alignSelf: 'center',
            }}
          >
            {loading ? '...' : 'CREATE'}
          </button>
        </form>
      </div>
    </div>
  );
}
