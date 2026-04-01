import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-[#F2F2F7] text-[#3C3C43]',
  primary: 'bg-[rgba(0,122,255,0.1)] text-[#007AFF]',
  success: 'bg-[rgba(52,199,89,0.1)] text-[#34C759]',
  error: 'bg-[rgba(255,59,48,0.1)] text-[#FF3B30]',
  warning: 'bg-[rgba(255,149,0,0.1)] text-[#FF9500]',
  info: 'bg-[rgba(90,200,250,0.1)] text-[#5AC8FA]',
  student: 'bg-[rgba(0,122,255,0.1)] text-[#007AFF]',
  professor: 'bg-[rgba(88,86,214,0.1)] text-[#5856D6]',
  staff: 'bg-[rgba(255,149,0,0.1)] text-[#FF9500]',
  admin: 'bg-[rgba(255,59,48,0.1)] text-[#FF3B30]',
};

export default function Badge({
  children,
  variant = 'default',
  pulse = false,
  className,
  color,
  size = 'sm',
}) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        sizeClass,
        !color && variants[variant],
        className
      )}
      style={
        color
          ? {
              background: `${color}12`,
              color,
            }
          : undefined
      }
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: color || 'currentColor' }}
        />
      )}
      {children}
    </span>
  );
}
