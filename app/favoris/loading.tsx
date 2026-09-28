import { Skeleton } from "@/components/ui/skeleton";

export default function CarnetLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 space-y-3 border-b border-line pb-6">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-16 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Skeleton className="h-72 rounded-[2rem] lg:h-[calc(100dvh-8rem)]" />
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
