'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { setTokens } from '@/lib/auth';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { BackButton } from '@/components/auth/BackButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthField } from '@/components/auth/AuthField';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          Cookies.set('pendingActivate', 'true', { expires: 1 / 24 });
          sessionStorage.setItem('pendingUsername', form.email);
          sessionStorage.setItem('pendingTempPassword', form.password);
          router.push('/activate');
          return;
        }
        setError(data.message);
        return;
      }

      Cookies.set('emailVerified', 'true');
      Cookies.set('role', data.role);
      setTokens(data.accessToken, data.refreshToken);
      router.push(data.role === 'admin' ? '/admin' : '/home');
    } catch {
      setError('Connection error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <BackButton onClick={() => router.push('/')} />
      <AuthHeader lines={['Login']} />

      <AuthCard height="400px" paddingBottom="40px">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <AuthField
            label="USERNAME"
            type="text"
            placeholder="Username / Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <AuthField
            label="PASSWORD"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <AuthMessage variant="error">{error}</AuthMessage>}

          <AuthSubmitButton loading={loading} className="mt-2">
            LOGIN
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthBackground>
  );
}
