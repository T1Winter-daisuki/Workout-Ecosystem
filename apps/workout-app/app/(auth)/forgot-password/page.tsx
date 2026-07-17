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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      sessionStorage.setItem('resetEmail', email);
      router.push('/reset-password');
    } catch {
      setError('Connection error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <BackButton onClick={() => router.back()} />
      <AuthHeader lines={['Forgot', 'Password']} />

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
