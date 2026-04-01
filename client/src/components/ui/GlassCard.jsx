import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function GlassCard({
  children,
  className,
  hover = true,
  padding = 'p-5',
  onClick,
  style,
  ...props
}) {
  return (
    <div
      className={cn('group', padding, onClick && 'cursor-pointer', className)}
      onClick={onClick}
      style={{
        /* macOS System Preferences panel style */
        background: '#FFFFFF',
        borderRadius: 12,
        border: '0.5px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)';
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Grouped card (like iOS Settings groups / macOS sidebar sections) ── */
export function GroupCard({ children, title, style, ...props }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: '0.5px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {title && (
        <div
          style={{
            padding: '10px 16px 8px',
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(60,60,67,0.40)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            borderBottom: '0.5px solid rgba(0,0,0,0.05)',
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
