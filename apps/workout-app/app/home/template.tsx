// Khác layout.tsx (giữ nguyên khi chuyển trang), template.tsx được mount lại mỗi lần
// đổi route → dùng làm hiệu ứng fade/slide cho nội dung chính khi chuyển tab
export default function HomeTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  )
}
