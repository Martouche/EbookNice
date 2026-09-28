import { PlaceCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ChapterLoading() {
  return (
    <>
      <div className="border-b border-line">
        <div className="mx-auto max-w-7xl space-y-4 px-4 pt-8 pb-12 md:px-8 md:pt-12 md:pb-20">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="mt-10 h-3 w-20 rounded-full" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-5 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-8">
        <Skeleton className="h-64 rounded-[2rem] md:h-80" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
