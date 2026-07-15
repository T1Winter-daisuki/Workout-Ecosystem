'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { BackButton } from '@/components/auth/BackButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthField } from '@/components/auth/AuthField';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';

export default function RegisterPage() {
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
          credentials: 'include',
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
    <AuthBackground>
      <BackButton onClick={() => router.push('/admin')} />
      <AuthHeader lines={['Create', 'Account']} />

      <AuthCard height="400px" paddingBottom="40px">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <AuthField
            label="USERNAME"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          <AuthField
            label="PASSWORD"
            type="password"
            placeholder="••••••••"
            value={form.temporaryPassword}
            onChange={(e) =>
              setForm({ ...form, temporaryPassword: e.target.value })
            }
            required
          />

          {error && <AuthMessage variant="error">{error}</AuthMessage>}
          {success && <AuthMessage variant="success">{success}</AuthMessage>}

          <AuthSubmitButton loading={loading} className="mt-2">
            CREATE
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthBackground>
  );
}
