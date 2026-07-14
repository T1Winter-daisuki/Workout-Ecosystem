export function AuthCard({
  height,
  paddingBottom,
  className = '',
  children,
}: {
  height: string;
  paddingBottom?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`w-full px-8 flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out ${className}`}
      style={{
        backgroundColor: '#980422',
        borderRadius: '48px 48px 0 0',
        height,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom,
      }}
    >
      {children}
    </div>
  );
}
