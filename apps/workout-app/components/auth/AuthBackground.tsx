import Image from 'next/image';

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex flex-col overflow-hidden bg-white"
      style={{ minHeight: '100svh', maxWidth: '460px', margin: '0 auto' }}
    >
      {/* Pattern góc trên trái */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <Image src="/patternL.svg" alt="" width={250} height={300} priority />
      </div>

      {children}
    </div>
  );
}
