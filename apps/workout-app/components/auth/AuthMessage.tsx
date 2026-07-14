export function AuthMessage({
  variant,
  children,
}: {
  variant: 'error' | 'success';
  children: React.ReactNode;
}) {
  const color = variant === 'error' ? '#ffb3a0' : '#86efac';
  return (
    <p
      className="text-sm text-center animate-in fade-in duration-300"
      style={{ color }}
    >
      {children}
    </p>
  );
}
