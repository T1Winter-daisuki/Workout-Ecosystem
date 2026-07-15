'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// Mỗi trang có 1 bản menu riêng với icon trang đó được tô màu nổi bật.
// Toạ độ hitbox đo trực tiếp từ file SVG (canvas 1201x290, thanh bar bắt đầu từ y≈89,
// vòng tròn "+" đã vẽ sẵn giữa mép trên của bar).
const menuByPath: Record<string, string> = {
  '/home': '/Home/home_menu.svg',
  '/home/message': '/Home/mes_menu.svg',
  '/home/create_plan': '/Home/create_menu.svg',
  '/home/ranking_user': '/Home/rank_menu.svg',
  '/home/user': '/Home/user_menu.svg',
};

const hitboxes = [
  { id: 'home', href: '/home', left: '10.4%', top: '63%' },
  { id: 'message', href: '/home/message', left: '29.9%', top: '64.5%' },
  { id: 'ranking', href: '/home/ranking_user', left: '70%', top: '64.5%' },
  { id: 'user', href: '/home/user', left: '88.7%', top: '63%' },
];

export function HomeMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const menuSrc = menuByPath[pathname] ?? '/Home/home_menu.svg';

  return (
    <div className="relative w-full">
      {/* key={menuSrc} để React mount lại ảnh khi đổi route → chạy lại hiệu ứng fade */}
      <Image
        key={menuSrc}
        src={menuSrc}
        alt="Menu"
        width={460}
        height={111}
        className="w-full animate-in fade-in duration-300"
      />

      {hitboxes.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(item.href)}
          aria-label={item.id}
          className="absolute active:scale-95"
          style={{
            left: item.left,
            top: item.top,
            transform: 'translate(-50%, -50%)',
            width: '18%',
            height: '45%',
          }}
        />
      ))}

      {/* Create — hitbox tròn đè lên vòng tròn "+" đã vẽ sẵn trong nền */}
      <button
        onClick={() => router.push('/home/create_plan')}
        aria-label="create"
        className="absolute active:scale-95"
        style={{
          left: '50%',
          top: '0%',
          transform: 'translateX(-50%)',
          width: '18%',
          height: '62%',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
