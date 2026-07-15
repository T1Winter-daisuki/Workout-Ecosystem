'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export function HomeHeader() {
  const router = useRouter();
  // Đọc cookie sau khi mount để tránh lệch giữa HTML server render và client (hydration mismatch)
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(Cookies.get('role') === 'admin');
  }, []);

  return (
    <div
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        backgroundColor: '#980422',
        height: '105px',
        borderRadius: '0 0 16px 16px',
      }}
    >
      {/* Logo bên trái — admin bấm được để quay về /admin, role khác chỉ là ảnh tĩnh */}
      <div className="w-20 h-20 flex items-center justify-end">
        {isAdmin ? (
          <button
            onClick={() => router.push('/admin')}
            aria-label="Về trang admin"
            className="transition-opacity hover:opacity-70 active:scale-95"
          >
            <Image
              src="/Logo_trans.png"
              alt="H4C Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </button>
        ) : (
          <Image
            src="/Logo_trans.png"
            alt="H4C Logo"
            width={64}
            height={64}
            className="object-contain"
          />
        )}
      </div>

      {/* Tên app */}
      <h1 className="text-6xl font-black text-white text-center flex-1">
        H4C
      </h1>

      {/* Chuông — giữ khoảng cách mép phải bằng với logo bên trái */}
      <button
        className="transition-opacity hover:opacity-70"
        style={{ marginRight: '16px' }}
      >
        <Image src="/Home/notice.svg" alt="Notifications" width={28} height={28} />
      </button>
    </div>
  );
}
