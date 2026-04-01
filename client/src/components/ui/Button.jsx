import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: {
    background: 'linear-gradient(180deg, #1a8FFF 0%, #007AFF 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,122,255,0.35), inset 0 0.5px 0 rgba(255,255,255,0.25)',
    hoverOpacity: 0.90,
  },
  secondary: {
    background: 'rgba(120,120,128,0.12)',
    color: 'rgba(0,0,0,0.80)',
    border: 'none',
    boxShadow: 'none',
    hoverBg: 'rgba(120,120,128,0.18)',
  },
  danger: {
    background: 'linear-gradient(180deg, #FF5147 0%, #FF3B30 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 2px 8px rgba(255,59,48,0.30), inset 0 0.5px 0 rgba(255,255,255,0.20)',
    hoverOpacity: 0.90,
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(60,60,67,0.55)',
    border: 'none',
    boxShadow: 'none',
    hoverBg: 'rgba(0,0,0,0.04)',
  },
  outline: {
    background: 'transparent',
    color: '#007AFF',
    border: '0.5px solid rgba(0,122,255,0.40)',
    boxShadow: 'none',
    hoverBg: 'rgba(0,122,255,0.06)',
  },
  success: {
    background: 'linear-gradient(180deg, #40d968 0%, #34C759 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 2px 8px rgba(52,199,89,0.30), inset 0 0.5px 0 rgba(255,255,255,0.20)',
    hoverOpacity: 0.90,
  },
};

const sizes = {
  sm: { padding: '0 10px', height: 28, fontSize: 13, borderRadius: 7, gap: 5 },
  md: { padding: '0 14px', height: 34, fontSize: 14, borderRadius: 9, gap: 6 },
  lg: { padding: '0 18px', height: 38, fontSize: 15, borderRadius: 10, gap: 7 },
  icon: { padding: '0', width: 34, height: 34, borderRadius: 9, gap: 0, minWidth: 34 },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  style,
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      className={cn('inline-flex items-center justify-center font-medium cursor-pointer select-none', className)}
      disabled={disabled || loading}
      style={{
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        boxShadow: v.boxShadow || 'none',
        borderRadius: s.borderRadius,
        padding: s.padding,
        height: s.height,
        minWidth: s.minWidth,
        fontSize: s.fontSize,
        gap: s.gap,
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
        fontWeight: 600,
        transition: 'transform 0.1s ease, opacity 0.15s ease, background 0.15s ease',
        opacity: (disabled || loading) ? 0.5 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 12 : 14} style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2} />
      ) : null}
      {children}
    </button>
  );
}
