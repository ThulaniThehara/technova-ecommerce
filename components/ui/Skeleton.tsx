// Placeholder block shown while a page's data is loading (a pulsing grey shape).
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

// Wrap a page-level skeleton so screen readers announce "Loading" once instead of reading shapes.
export function LoadingRegion({ children, label = "Loading" }: { children: React.ReactNode; label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-3 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
