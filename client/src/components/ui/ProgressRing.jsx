import { useEffect, useState } from 'react';
import { getGradeColor } from '../../lib/theme';

export default function ProgressRing({
  value,
  max = 20,
  size = 120,
  strokeWidth = 6,
  label,
  showLabel = true,
  animated = true,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedValue = Math.min(Math.max(value || 0, 0), max);
  const progress = normalizedValue / max;

  useEffect(() => {
    if (!animated) {
      setDisplayValue(normalizedValue);
      return;
    }
    const duration = 1000;
    const start = performance.now();
    let raf;
    function step(now) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayValue(Math.round(eased * normalizedValue * 100) / 100);
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [normalizedValue, animated]);

  const strokeDashoffset = circumference - (displayValue / max) * circumference;
  const color = getGradeColor(normalizedValue);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E5EA"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animated ? 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-semibold tabular-nums"
            style={{ color }}
          >
            {Number.isInteger(normalizedValue)
              ? Math.round(displayValue)
              : displayValue.toFixed(2)}
          </span>
          <span className="text-[10px] text-text-muted font-medium">/{max}</span>
        </div>
      </div>
      {showLabel && label && (
        <p className="text-xs text-text-secondary font-medium text-center">{label}</p>
      )}
    </div>
  );
}
