import { cn } from '../../lib/utils';

export default function Input({
  label,
  type = 'text',
  className,
  error,
  icon: Icon,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-text',
            'placeholder:text-text-muted',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10',
            'transition-all duration-200',
            Icon && 'pl-10',
            error && 'border-error focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

export function Select({ label, children, className, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-text',
          'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10',
          'transition-all duration-200 appearance-none',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%233C3C43\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")]',
          'bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat',
          error && 'border-error',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

export function Textarea({ label, className, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-text',
          'placeholder:text-text-muted resize-y min-h-[100px]',
          'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10',
          'transition-all duration-200',
          error && 'border-error',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, className, color, ...props }) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer group', className)}>
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div
          className="w-5 h-5 rounded-md border-2 border-border bg-white transition-all duration-200 peer-checked:border-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/20"
          style={props.checked ? { background: color || '#007AFF', borderColor: color || '#007AFF' } : {}}
        >
          {props.checked && (
            <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      {label && <span className="text-sm text-text-secondary group-hover:text-text transition-colors">{label}</span>}
    </label>
  );
}
