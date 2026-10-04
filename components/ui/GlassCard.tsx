import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  variant?: 'default' | 'elevated' | 'gold' | 'emerald';
}

export function GlassCard({
  children,
  interactive = false,
  className = '',
  variant = 'default',
  ...props
}: GlassCardProps) {
  let variantStyles = 'bg-white/75 border-white/65';
  if (variant === 'elevated') {
    variantStyles = 'bg-white/85 border-white/75 shadow-[0_8px_30px_rgb(0,0,0,0.06)]';
  } else if (variant === 'gold') {
    variantStyles = 'bg-[#F2E8D2]/40 border-[#B58A3A]/30 shadow-[0_4px_20px_-2px_rgba(181,138,58,0.1)]';
  } else if (variant === 'emerald') {
    variantStyles = 'bg-[#F5EBD7]/45 border-[#996A19]/25 shadow-[0_4px_20px_-2px_rgba(11,107,87,0.1)]';
  }

  const baseStyles = interactive
    ? 'glass-card-interactive cursor-pointer'
    : 'glass-card';

  return (
    <div
      className={`${baseStyles} ${variantStyles} p-4 sm:p-5 relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
