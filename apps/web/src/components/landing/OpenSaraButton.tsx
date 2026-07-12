'use client';

interface OpenSaraButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function OpenSaraButton({ className, children }: OpenSaraButtonProps) {
  return (
    <button
      onClick={() => (document.querySelector('[aria-label="Ouvrir SARA"]') as HTMLButtonElement)?.click()}
      className={className}
    >
      {children}
    </button>
  );
}
