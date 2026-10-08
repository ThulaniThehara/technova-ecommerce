import Skeleton, { LoadingRegion, ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Loading products">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-7 h-12 w-full rounded-xl" />
        <div className="mt-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}
