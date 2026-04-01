import { cn } from '../../lib/utils';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-[#F2F2F7] via-[#E5E5EA] to-[#F2F2F7] bg-[length:200%_100%] animate-shimmer',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-0 overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-10 flex-1 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonRing() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="w-[120px] h-[120px] rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
