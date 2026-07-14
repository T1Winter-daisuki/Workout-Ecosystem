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

export default function ActivatePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const username = sessionStorage.getItem('pendingUsername') || '';
      const temporaryPassword = sessionStorage.getItem('pendingTempPassword') || '';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-activate-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, temporaryPassword }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      sessionStorage.setItem('pendingEmail', email);
      router.push('/otp');
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <BackButton onClick={() => router.push('/login')} />
      <AuthHeader lines={['Active', 'Account']} />

      <AuthCard height="400px" paddingBottom="70px">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <AuthField
            label="EMAIL"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <AuthMessage variant="error">{error}</AuthMessage>}

          <AuthSubmitButton loading={loading} className="mt-2">
            GET OTP
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthBackground>
  );
}
