export function AuthSubmitButton({
  loading,
  width = '230px',
  className = '',
  children,
}: {
  loading: boolean;
  width?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`font-bold text-lg tracking-widest transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60 ${className}`}
      style={{
        backgroundColor: '#ff5c00',
        color: '#ffffff',
        width,
        height: '51px',
        borderRadius: '10px',
        alignSelf: 'center',
      }}
    >
      {loading ? '...' : children}
    </button>
  );
}
