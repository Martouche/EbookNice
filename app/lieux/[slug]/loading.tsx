import { Skeleton } from "@/components/ui/skeleton";

export default function PlaceLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-10 md:px-8 md:pt-8">
      <Skeleton className="mb-4 hidden h-4 w-32 rounded-full md:block" />
      <Skeleton className="-mx-4 aspect-[4/5] rounded-none md:mx-0 md:aspect-auto md:h-[min(34rem,62vh)] md:rounded-[2rem]" />
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_340px] md:gap-14 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
          </div>
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <Skeleton className="h-72 rounded-[1.75rem]" />
      </div>
    </div>
  );
}
