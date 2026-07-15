'use client';

import { useRouter } from 'next/navigation';
import { clearTokens } from '@/lib/auth';

export default function UserMenuBody() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens(); // Xóa accessToken ở FE
      router.push('/login');
    }
  };

  return (
    <div className="flex-1 w-full px-6 pt-8 pb-8 flex flex-col overflow-y-auto">

      {/* CỤM MENU CHÍNH */}
      <div className="flex flex-col gap-8 w-full">
        
        {/* 1. ACCOUNT */}
        <div className="flex flex-col gap-1.5">
          <span
            className="font-black text-sm tracking-widest"
            style={{ color: '#0d294d' }}
          >
            ACCOUNT
          </span>
          <button
            onClick={() => router.push('/home/user/profile')}
            className="w-full h-12 border-[2.5px] rounded-[14px] flex items-center pl-6 font-black text-sm tracking-wider active:scale-[0.99] transition-transform text-left shadow-sm"
            style={{ 
              borderColor: '#980422', 
              color: '#980422',
              backgroundColor: 'transparent' 
            }}
          >
            PROFILE
          </button>
        </div>

        {/* 2. SUPPORT */}
        <div className="flex flex-col gap-1.5">
          <span
            className="font-black text-sm tracking-widest"
            style={{ color: '#0d294d' }}
          >
            SUPPORT
          </span>
          <div 
            className="w-full border-[2.5px] rounded-[14px] flex flex-col overflow-hidden shadow-sm"
            style={{ borderColor: '#980422', backgroundColor: 'transparent' }}
          >
            <button
              onClick={() => router.push('/help-center')}
              className="w-full h-12 flex items-center pl-6 font-black text-sm tracking-wider active:bg-black/5 transition-colors text-left"
              style={{ color: '#980422' }}
            >
              HELP CENTER
            </button>
            
            {/* Đường kẻ ngang ngăn cách giữa Help Center và Feedback */}
            <div className="w-full border-t-[1.5px]" style={{ borderColor: '#980422' }} />

            <button
              onClick={() => router.push('/feedback')}
              className="w-full h-12 flex items-center pl-6 font-black text-sm tracking-wider active:bg-black/5 transition-colors text-left"
              style={{ color: '#980422' }}
            >
              FEEDBACK
            </button>
          </div>
        </div>

        {/* 3. COURSE */}
        <div className="flex flex-col gap-1.5">
          <span
            className="font-black text-sm tracking-widest"
            style={{ color: '#0d294d' }}
          >
            COURSE
          </span>
          <button
            onClick={() => router.push('/contract')}
            className="w-full h-12 border-[2.5px] rounded-[14px] flex items-center pl-6 font-black text-sm tracking-wider active:scale-[0.99] transition-transform text-left shadow-sm"
            style={{ 
              borderColor: '#980422', 
              color: '#980422',
              backgroundColor: 'transparent' 
            }}
          >
            CONTRACT
          </button>
        </div>

      </div>

      {/* CỤM NÚT SIGN OUT VÀ LINKS BÊN DƯỚI */}
      <div className="flex flex-col items-center gap-4 mt-10 w-full">
        
        {/* Nút Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-[14px] flex items-center justify-center font-black text-base tracking-widest active:scale-[0.98] transition-transform shadow-md"
          style={{
            backgroundColor: '#980422',
            color: '#ffffff',
          }}
        >
          SIGN OUT
        </button>

        {/* 2 Link Terms và Privacy Policy dưới đáy */}
        <div className="flex flex-col items-start w-full gap-1.5 mt-8">
          <button 
            onClick={() => router.push('/terms')}
            className="font-black text-xs tracking-widest uppercase active:opacity-70"
            style={{ color: '#2b5a92' }}
          >
            TERMS
          </button>
          <button 
            onClick={() => router.push('/privacy')}
            className="font-black text-xs tracking-widest uppercase active:opacity-70"
            style={{ color: '#2b5a92' }}
          >
            PRIVACY POLICY
          </button>
        </div>

      </div>

    </div>
  );
}