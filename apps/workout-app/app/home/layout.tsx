import { HomeHeader } from '@/components/home/HomeHeader'
import { HomeMenu } from '@/components/home/HomeMenu'

// Khung chung cho /home và mọi trang con (/home/message, /home/create_plan, ...):
// header + footer viết 1 lần ở đây, Next.js tự nhét page.tsx tương ứng với URL vào {children}
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ minHeight: '100svh', maxWidth: '460px', margin: '0 auto', backgroundColor: '#f6e4e4' }}
    >
      <HomeHeader />

      {/* Nội dung chính của từng trang */}
      <main className="flex-1">{children}</main>

      <HomeMenu />
    </div>
  )
}
