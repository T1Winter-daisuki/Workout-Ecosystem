export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute top-4 right-4 animate-in fade-in duration-500">
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:brightness-110 active:scale-95"
        style={{ backgroundColor: '#ff5c00' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
