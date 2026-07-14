import { InputHTMLAttributes } from 'react';

export function AuthField({
  label,
  ...inputProps
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-black tracking-widest"
        style={{ color: '#ed9231' }}
      >
        {label}
      </label>
      <input
        {...inputProps}
        className="px-4 py-3 text-white placeholder-white/60 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-white/60"
        style={{
          backgroundColor: '#7a0318',
          border: '5px solid #ff5c00',
          borderRadius: '10px',
          height: '51px',
          width: '250px',
        }}
      />
    </div>
  );
}
