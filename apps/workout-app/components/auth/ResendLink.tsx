export function ResendLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm underline text-left transition-opacity duration-200 hover:opacity-70"
      style={{ color: '#ffffff', width: '250px' }}
    >
      {children}
    </button>
  );
}
