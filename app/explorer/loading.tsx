import { PlaceCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ExplorerLoading() {
  return (
    <>
      <div className="border-b border-line">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 md:px-8">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full sm:w-44" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Skeleton className="mb-6 h-3 w-24 rounded-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
