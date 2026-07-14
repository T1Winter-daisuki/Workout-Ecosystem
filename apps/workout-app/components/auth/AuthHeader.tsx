import Image from 'next/image';

export function AuthHeader({
  lines,
  logoClassName = 'mb-10',
}: {
  lines: string[];
  logoClassName?: string;
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-8 animate-in fade-in slide-in-from-top-4 duration-500 ease-out"
      style={{ paddingTop: '80px' }}
    >
      <Image
        src="/Logo.png"
        alt="H4C Logo"
        width={160}
        height={160}
        className={logoClassName}
        priority
      />
      {lines.map((line) => (
        <h1
          key={line}
          className="text-5xl font-black text-center tracking-wide"
          style={{ color: '#d64b29' }}
        >
          {line}
        </h1>
      ))}
    </div>
  );
}
