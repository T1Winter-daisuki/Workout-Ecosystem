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
import { ResendLink } from '@/components/auth/ResendLink';

export default function ResetPasswordPage() {
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
      sessionStorage.removeItem('resetEmail');
      router.push('/login');
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
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

  return (
    <AuthBackground>
      <BackButton onClick={() => router.push('/forgot-password')} />
      <AuthHeader lines={['Reset', 'Password']} logoClassName="mb-6" />

      <AuthCard height="480px" paddingBottom="50px">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField
            label="OTP"
            type="text"
            placeholder="Enter OTP here"
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
            maxLength={6}
            required
          />

          <AuthField
            label="NEW PASSWORD"
            type="password"
            placeholder="••••••••"
            value={form.newPassword}
            onChange={(e) =>
              setForm({ ...form, newPassword: e.target.value })
            }
            required
          />

          <AuthField
            label="CONFIRM PASSWORD"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
          />

          {error && <AuthMessage variant="error">{error}</AuthMessage>}
          {resendMsg && (
            <AuthMessage variant="success">{resendMsg}</AuthMessage>
          )}

          <ResendLink onClick={handleResend}>Resend OTP here</ResendLink>

          <AuthSubmitButton loading={loading} width="250px">
            CONFIRM
          </AuthSubmitButton>
        </form>
      </AuthCard>
    </AuthBackground>
  );
}
