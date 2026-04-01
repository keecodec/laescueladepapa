import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { staggerItem } from '../../lib/animations';

function useAnimatedCounter(target, duration = 900) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target == null || isNaN(target)) return;
    const num = Number(target);
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * num * 100) / 100);
      if (progress < 1) ref.current = requestAnimationFrame(step);
    }
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return count;
}

export default function StatCard({ label, value, suffix = '' }) {
  const animated = useAnimatedCounter(typeof value === 'number' ? value : null);
  const display = typeof value === 'number'
    ? (Number.isInteger(value) ? Math.round(animated) : animated.toFixed(2))
    : value;

  return (
    <motion.div variants={staggerItem}>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 11,
          border: '0.5px solid rgba(0,0,0,0.07)',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
          padding: '14px 16px',
          transition: 'box-shadow 0.18s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.09)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'; }}
      >
        <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(60,60,67,0.48)', marginBottom: 6, letterSpacing: '-0.003em' }}>
          {label}
        </p>
        <p style={{ fontSize: 26, fontWeight: 600, color: 'rgba(0,0,0,0.82)', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {display}
          {suffix && <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(60,60,67,0.38)', marginLeft: 3 }}>{suffix}</span>}
        </p>
      </div>
    </motion.div>
  );
}
