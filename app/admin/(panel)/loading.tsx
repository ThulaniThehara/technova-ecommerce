import Skeleton, { LoadingRegion } from "@/components/ui/Skeleton";

// Shown inside the admin shell while any admin page loads its data.
export default function Loading() {
  return (
    <LoadingRegion label="Loading">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-10 h-72 w-full rounded-xl" />
    </LoadingRegion>
  );
}
