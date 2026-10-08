// Skeleton rows while the orders load. It lives in the (list) route group so it only covers the
// list page and never the order detail page, whose "not found" must stay a real 404.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading your orders">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-line bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
