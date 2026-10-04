import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function GlassButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  let sizeStyles = 'min-h-[44px] px-4 py-2.5 text-sm';
  if (size === 'sm') sizeStyles = 'min-h-[38px] px-3 py-1.5 text-xs';
  if (size === 'lg') sizeStyles = 'min-h-[52px] px-6 py-3 text-base';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-[#996A19] text-white hover:bg-[#70490E] active:bg-[#70490E] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35),0_4px_14px_-2px_rgba(11,107,87,0.25)] border-t border-white/20';
      break;
    case 'secondary':
      variantStyles =
        'bg-white/75 backdrop-blur-md text-[#996A19] hover:bg-white/90 active:bg-white/90 border border-white/80 shadow-[0_2px_8px_-1px_rgba(11,107,87,0.06)]';
      break;
    case 'danger':
      variantStyles =
        'bg-[#C84A45]/12 text-[#A12B26] hover:bg-[#C84A45]/20 active:bg-[#C84A45]/20 border border-[#C84A45]/25 shadow-sm';
      break;
    case 'ghost':
      variantStyles =
        'bg-transparent text-[#525D58] hover:bg-[#996A19]/8 active:bg-[#996A19]/10';
      break;
  }

  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] transform-gpu disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100 ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Memproses...</span>
        </div>
      ) : (
        <span className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
}
