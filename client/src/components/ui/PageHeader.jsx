import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';

export default function PageHeader({ icon: Icon, title, subtitle, accentColor, children }) {
  const color = accentColor || '#007AFF';

  return (
    <motion.div
      style={{ marginBottom: 28 }}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {Icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} style={{ color }} strokeWidth={1.8} />
            </div>
          )}
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'rgba(0,0,0,0.88)',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(60,60,67,0.50)',
                  marginTop: 2,
                  letterSpacing: '-0.005em',
                  fontWeight: 400,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {children}
          </div>
        )}
      </div>
      {/* macOS-style hair-line separator */}
      <div
        style={{
          marginTop: 16,
          height: '0.5px',
          background: 'rgba(60,60,67,0.10)',
        }}
      />
    </motion.div>
  );
}
